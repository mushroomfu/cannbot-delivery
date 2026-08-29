/**
 * dsh-cannbot-gateway — register the cannbot OpenAI-compatible gateway
 * (https://cannbot.hicann.cn/gateway/compatible-mode/v1) as an `llm-pi-ai`
 * provider route.
 *
 * Auth mirrors the cannbot OpenCode plugin: the gateway requires BOTH
 *   - `x-api-vkey: <virtual key>`    → credential ref (default CANNBOT_VK),
 *                                      editable in the 插件配置 frontend card;
 *                                      falls back to the loader-row `xApiKey`
 *   - `Authorization: Bearer <JWT>`  → read from ~/.cannbot/session.json
 *
 * Configuration is a settings namespace (`cannbot-gateway`) whose composition
 * base is the loader-row `config:` block; the frontend 插件配置 card writes the
 * user layer, and the virtual key itself is written through the credentials
 * domain so it never rides a settings document. The session file is polled,
 * so a fresh login in the cannbot VS Code extension propagates into dsh
 * without touching anything.
 *
 * The route is written through the settings service (`llm-pi-ai` namespace),
 * which validates and persists it into settings.yaml and hot-reloads the
 * adapter. Desktop window and browser web UI share the same host, so both
 * pick the route up identically.
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import Schema from "schemastery";

const NAMESPACE = "llm-pi-ai";
const NAME = "cannbot-gateway";
const NS = NAME;

const DEFAULT_GATEWAY = "https://cannbot.hicann.cn/gateway/compatible-mode/v1";
const DEFAULT_SESSION = "~/.cannbot/session.json";
const DEFAULT_VK_REF = "CANNBOT_VK";

const DEFAULT_MODELS = [
	{ id: "deepseek-v4-flash", name: "DeepSeek-V4-Flash", contextWindow: 1048576, maxTokens: 393216 },
	{ id: "deepseek-v4-pro", name: "DeepSeek-V4-Pro", contextWindow: 1048576, maxTokens: 393216 },
];

/** The settings namespace the frontend 插件配置 card edits. */
export const Config = Schema.object({
	enabled: Schema.boolean().default(true).description("启用 cannbot 路由"),
	route: Schema.string().default("cannbot").description("llm-pi-ai 中的路由键名"),
	displayName: Schema.string().default("Cannbot").description("模型选择器分组名"),
	gatewayURL: Schema.string().default(DEFAULT_GATEWAY).description("OpenAI 兼容网关地址"),
	sessionFile: Schema.string().default(DEFAULT_SESSION).description("cannbot 登录态文件（JWT 来源）"),
	pluginType: Schema.string().default("OpenCodeGUI").description("plugin_type 请求头"),
	pollIntervalMs: Schema.number().default(5000).description("session.json 轮询间隔（毫秒）"),
	xApiKeyEnv: Schema.string().default(DEFAULT_VK_REF).description("虚拟密钥的凭据引用名（前端保存到这里）"),
	xApiKey: Schema.string().role("secret").description("虚拟密钥 vk-...（兼容旧配置的兜底；推荐在前端填写）"),
	models: Schema.array(
		Schema.object({
			id: Schema.string().required(),
			name: Schema.string(),
			contextWindow: Schema.number().default(1048576),
			maxTokens: Schema.number().default(393216),
		}),
	).default(DEFAULT_MODELS).description("模型列表"),
});

const name = NS;
const inject = ["settings", "credentials"];

function nonEmpty(value) {
	return typeof value === "string" && value.trim().length > 0;
}

function normalizeSessionFile(path) {
	const trimmed = nonEmpty(path) ? path.trim() : DEFAULT_SESSION;
	return trimmed.startsWith("~") ? join(homedir(), trimmed.slice(1)) : trimmed;
}

function readAccessToken(sessionFile) {
	try {
		const parsed = JSON.parse(readFileSync(sessionFile, "utf-8"));
		const token = parsed?.accessToken;
		return typeof token === "string" && token.length > 0 ? token : null;
	} catch {
		return null;
	}
}

function buildProfile(value, vk, token) {
	const headers = { plugin_type: nonEmpty(value.pluginType) ? value.pluginType.trim() : "OpenCodeGUI" };
	if (vk) headers["x-api-vkey"] = vk;
	if (token) headers.Authorization = `Bearer ${token}`;
	return {
		displayName: nonEmpty(value.displayName) ? value.displayName.trim() : "Cannbot",
		api: "openai-completions",
		baseURL: nonEmpty(value.gatewayURL) ? value.gatewayURL.trim().replace(/\/+$/, "") : DEFAULT_GATEWAY,
		headers,
		compat: { supportsDeveloperRole: false, maxTokensField: "max_tokens" },
		timeoutMs: 120000,
		streamIdleTimeoutMs: 300000,
		models: (Array.isArray(value.models) && value.models.length > 0 ? value.models : DEFAULT_MODELS)
			.map((model) => ({
				id: String(model?.id ?? "").trim(),
				name: nonEmpty(model?.name) ? model.name.trim() : String(model?.id ?? "").trim(),
				contextWindow: Number.isFinite(model?.contextWindow) && model.contextWindow > 0
					? Math.floor(model.contextWindow)
					: 1048576,
				maxTokens: Number.isFinite(model?.maxTokens) && model.maxTokens > 0
					? Math.floor(model.maxTokens)
					: 393216,
			}))
			.filter((model) => model.id.length > 0),
	};
}

function apply(ctx, entry) {
	const base = entry ?? {};
	const logger = ctx.logger;

	ctx.inject(["settings"], (sctx) => {
		const scope = sctx.settings.register(NS, Config, { base });
		const credentialsCtx = ctx.credentials;

		let stopping = false;
		let lastVk = null;
		let lastToken = null;
		let lastSignature = "";

		const vkRefOf = (value) => (nonEmpty(value?.xApiKeyEnv) ? value.xApiKeyEnv.trim() : DEFAULT_VK_REF);

		const readCredential = async (ref) => {
			if (!credentialsCtx || typeof credentialsCtx.resolve !== "function") return null;
			try {
				const hit = await credentialsCtx.resolve(ref);
				const value = hit?.value;
				return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
			} catch {
				return null;
			}
		};

		/** 一次性迁移：组装层带了 xApiKey 且凭据未配置时，把它种进凭据库，前端即可显示“已配置”。 */
		const seedCredential = async (ref, fallbackVk) => {
			if (!credentialsCtx || typeof credentialsCtx.set !== "function") return;
			if (!nonEmpty(fallbackVk)) return;
			try {
				const existing = await readCredential(ref);
				if (existing) return;
				await credentialsCtx.set(ref, fallbackVk.trim());
				logger.info("%s: 已把组装层 xApiKey 迁移到凭据 %s", NAME, ref);
			} catch (error) {
				logger.warn("%s: 迁移 xApiKey 到凭据 %s 失败（忽略，继续用组装层值）: %s", NAME, ref, error?.message ?? error);
			}
		};

		const sync = async (trigger) => {
			const value = scope.get();
			if (value?.enabled === false) return;
			const ref = vkRefOf(value);
			let vk = await readCredential(ref);
			if (vk === null && nonEmpty(value?.xApiKey)) vk = value.xApiKey.trim();
			if (!vk) {
				if (lastVk !== null || trigger !== "poll") {
					logger.warn("%s: 未配置虚拟密钥（凭据 %s 为空且组装层无 xApiKey），路由暂不注册", NAME, ref);
				}
				return;
			}
			const sessionFile = normalizeSessionFile(value?.sessionFile);
			const token = readAccessToken(sessionFile);
			const signature = JSON.stringify([vk, token, value?.route, value?.displayName, value?.gatewayURL, value?.pluginType, value?.models]);
			if (signature === lastSignature) return;
			if (!token) {
				logger.warn("%s: %s 中暂无 accessToken，等待下次轮询", NAME, sessionFile);
				return;
			}
			const route = nonEmpty(value?.route) ? value.route.trim() : "cannbot";
			const profile = buildProfile(value, vk, token);
			for (let attempt = 0; ; attempt++) {
				if (stopping) return;
				try {
					await sctx.settings.update(NAMESPACE, { providers: { [route]: profile } });
					break;
				} catch (error) {
					if (attempt < 60 && /not registered/i.test(String(error?.message))) {
						await new Promise((resolve) => setTimeout(resolve, 1000));
						continue;
					}
					logger.error("%s: 写入 %s 路由失败: %s", NAME, route, error?.stack ?? error);
					return;
				}
			}
			lastVk = vk;
			lastToken = token;
			lastSignature = signature;
			logger.info("%s: 路由 %s 已就绪（模型 %s，密钥来源 %s，JWT 已注入）", NAME, route, profile.models.map((m) => m.id).join("/"), vk === value?.xApiKey?.trim() ? "组装层" : `凭据 ${ref}`);
		};

		const pollMs = Number.isFinite(base?.pollIntervalMs) && base.pollIntervalMs >= 1000
			? Math.floor(base.pollIntervalMs)
			: 5000;
		const timer = setInterval(() => {
			void sync("poll");
		}, pollMs);
		if (typeof timer?.unref === "function") timer.unref();

		const offWatch = scope.watch(() => {
			void sync("config");
		});
		const offCredential = typeof ctx.on === "function"
			? ctx.on("credentials/reference-updated", (ref) => {
				const value = scope.get();
				if (ref === vkRefOf(value)) void sync("credential");
			})
			: undefined;

		ctx.effect(() => () => {
			stopping = true;
			clearInterval(timer);
			offWatch?.();
			if (typeof offCredential === "function") offCredential();
			// 卸载/禁用时移除本插件写入的路由，避免残留过期 JWT（关停途中失败可忽略）。
			const value = scope.get();
			const route = nonEmpty(value?.route) ? value.route.trim() : "cannbot";
			void sctx.settings?.mutate?.(NAMESPACE, [{ op: "unset", path: ["providers", route] }])?.catch?.(() => {});
		}, `${NAME}:teardown`);

		logger.info("%s: 已加载（gateway=%s，配置基底层来自 loader 行，可在前端“插件配置”修改）", NAME, nonEmpty(base?.gatewayURL) ? base.gatewayURL : DEFAULT_GATEWAY);
		void seedCredential(vkRefOf(base), base?.xApiKey).then(() => sync("startup"));
	});
}

export { apply, inject, name };
