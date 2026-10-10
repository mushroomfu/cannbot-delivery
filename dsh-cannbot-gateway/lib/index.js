/**
 * dsh-cannbot-gateway — register the cannbot OpenAI-compatible gateway
 * (https://cannbot.hicann.cn/gateway/compatible-mode/v1) as an `llm-pi-ai`
 * provider route.
 *
 * Adapted for the DeepSeek Harness 0.2.0-rc.x composition:
 *   - `apply(ctx, config)` receives the loader row's config already resolved
 *     against the exported `Config` schema (defaults filled in by the loader);
 *     there is no per-plugin settings namespace to register — plugin
 *     configuration IS the composition entry, and the Plugins page card edits
 *     the entry's volatile fields through the settings service.
 *   - The route is written with `settings.update("llm-pi-ai", {providers})`:
 *     `providers` is a volatile field of the llm-pi-ai entry, so the write is
 *     hot-applied and persisted into the profile composition, and the llm-pi-ai
 *     row reloads with the route.
 *   - The Plugins page card edits `displayName` / `gatewayURL` / `sessionFile`
 *     (volatile here), plus the virtual key through the credentials domain.
 *     Editing them reloads this entry, so `apply` runs again and rewrites the
 *     route — no separate watch channel is needed.
 *
 * Auth mirrors the cannbot OpenCode plugin: the gateway requires BOTH
 *   - `x-api-vkey: <virtual key>`    → credential ref (default CANNBOT_VK),
 *                                      editable in the Plugins page card;
 *                                      falls back to the loader-row `xApiKey`
 *   - `Authorization: Bearer <JWT>`  → read from the cannbot session file
 *                                      (cannbot-toolkit ≥2.0 location first,
 *                                      1.x fallback second), polled every 5s
 *                                      so a fresh login propagates unchanged.
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
// The deployment fork of schemastery: `.volatile()` marks live-editable fields
// and the harness importer resolves this first-party name for profile plugins.
import Schema from "@deepseek-ai/schemastery";

const NAMESPACE = "llm-pi-ai";
const NAME = "cannbot-gateway";

const DEFAULT_GATEWAY = "https://cannbot.hicann.cn/gateway/compatible-mode/v1";
/** cannbot-toolkit ≥2.0 迁移后的登录态位置（优先），1.x 的旧位置作兜底。 */
const DEFAULT_SESSION = "~/.local/share/opencode/session.json";
const SESSION_FALLBACK = "~/.cannbot/session.json";
const DEFAULT_VK_REF = "CANNBOT_VK";

const DEFAULT_MODELS = [
	{ id: "deepseek-v4-flash", name: "DeepSeek-V4-Flash", contextWindow: 1048576, maxTokens: 393216 },
	{ id: "deepseek-v4-pro", name: "DeepSeek-V4-Pro", contextWindow: 1048576, maxTokens: 393216 },
];

/**
 * The plugin's composition config. Volatile fields are the ones the Plugins
 * page card edits live; everything else is maintained in cordis.patch.yml.
 */
export const Config = Schema.object({
	enabled: Schema.boolean().default(true).description("启用 cannbot 路由"),
	route: Schema.string().default("cannbot").description("llm-pi-ai 中的路由键名"),
	displayName: Schema.string().default("Cannbot").volatile().description("模型选择器分组名"),
	gatewayURL: Schema.string().default(DEFAULT_GATEWAY).volatile().description("OpenAI 兼容网关地址"),
	sessionFile: Schema.string().default(DEFAULT_SESSION).volatile().description("cannbot 登录态文件（JWT 来源，留默认自动探测新/旧位置）"),
	pluginType: Schema.string().default("OpenCodeGUI").description("plugin_type 请求头"),
	pollIntervalMs: Schema.number().default(5000).description("session.json 轮询间隔（毫秒）"),
	xApiKeyEnv: Schema.string().default(DEFAULT_VK_REF).volatile().description("虚拟密钥的凭据引用名"),
	xApiKey: Schema.string().role("secret").description("虚拟密钥 vk-...（兼容旧配置的兜底；推荐在前端填写）"),
	models: Schema.array(
		Schema.object({
			id: Schema.string().required(),
			name: Schema.string(),
			contextWindow: Schema.number().default(1048576),
			maxTokens: Schema.number().default(393216),
		}),
	).default(DEFAULT_MODELS).volatile().description("模型列表（卡片可编辑，保存即热生效）"),
});

const inject = ["settings", "credentials"];

function nonEmpty(value) {
	return typeof value === "string" && value.trim().length > 0;
}

/** Volatile fields resolve to lazy wrappers; unwrap them (and nested wrappers) to plain values. */
function plainValue(value) {
	return value !== null && typeof value === "object" && typeof value.get === "function" ? plainValue(value.get()) : value;
}

function expandHome(path) {
	return path.startsWith("~") ? join(homedir(), path.slice(1)) : path;
}

/**
 * 登录态候选路径：显式配置优先，其后是 cannbot-toolkit 2.x 的新位置与 1.x 的旧位置。
 * 升级迁移（~/.cannbot → ~/.local/share/opencode）因此不会打断路由。
 */
function sessionCandidates(value) {
	const list = [];
	if (nonEmpty(value?.sessionFile)) list.push(expandHome(value.sessionFile.trim()));
	for (const candidate of [DEFAULT_SESSION, SESSION_FALLBACK]) {
		const expanded = expandHome(candidate);
		if (!list.includes(expanded)) list.push(expanded);
	}
	return list;
}

/** 依次读候选路径，返回第一个带有效 accessToken 的文件。 */
function readSessionToken(candidates) {
	for (const file of candidates) {
		const token = readAccessToken(file);
		if (token) return { token, file };
	}
	return null;
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

/** 规范化模型列表:补默认值、修类型、丢掉无 id 项。仲裁与路由写入共用,保证比较稳定。 */
function normalizeModels(models) {
	return (Array.isArray(models) && models.length > 0 ? models : DEFAULT_MODELS)
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
		.filter((model) => model.id.length > 0);
}

function buildProfile(value, vk, token, models) {
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
		models: normalizeModels(models),
	};
}

function apply(ctx, entry) {
	// The loader hands us this entry's config resolved against Config (defaults included);
	// volatile fields arrive as lazy wrappers, so normalize everything to plain values.
	const config = Object.fromEntries(Object.entries(entry ?? {}).map(([key, value]) => [key, plainValue(value)]));
	const logger = ctx.logger;

	ctx.inject(["settings"], (sctx) => {
		const credentialsCtx = ctx.credentials;

		let stopping = false;
		let lastSignature = "";
		/** JSON of the model list the last successful route write carried. */
		let lastModels = null;

		/**
		 * Volatile-field edits from the Plugins page card are applied to the fiber
		 * config in place (no apply re-run); the settings service announces them
		 * with `settings/document-updated`. Re-read the live volatile fields from
		 * the describe projection and merge them over this apply's composition
		 * config, so the route always reflects what the page shows.
		 */
		const freshConfig = () => {
			try {
				const row = sctx.settings.describe().find((row) => row.ns === NAME);
				return row ? { ...config, ...row.value } : config;
			} catch {
				return config;
			}
		};

		/** The model list the live llm-pi-ai route currently carries (Models-page edits land here). */
		const readLiveModels = (route) => {
			try {
				const row = sctx.settings.describe().find((row) => row.ns === NAMESPACE);
				const models = row?.value?.providers?.[route]?.models;
				return Array.isArray(models) && models.length > 0 ? models : null;
			} catch {
				return null;
			}
		};

		/** Persist an adopted model list back onto this entry, so the card and later restarts keep it. */
		const persistModels = async (models) => {
			for (let attempt = 0; attempt < 5; attempt++) {
				try {
					await sctx.settings.update(NAME, { models });
					return;
				} catch {
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}
		};

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
			const value = freshConfig();
			if (value?.enabled === false) return;
			const ref = vkRefOf(value);
			const route = nonEmpty(value?.route) ? value.route.trim() : "cannbot";
			let vk = await readCredential(ref);
			if (vk === null && nonEmpty(value?.xApiKey)) vk = value.xApiKey.trim();
			if (!vk) {
				if (trigger !== "poll") {
					logger.warn("%s: 未配置虚拟密钥（凭据 %s 为空且组装层无 xApiKey），路由暂不注册", NAME, ref);
				}
				return;
			}
			const candidates = sessionCandidates(value);
			const session = readSessionToken(candidates);
			const token = session?.token ?? null;
			if (!token) {
				logger.warn("%s: 候选登录态文件均无 accessToken（%s），等待下次轮询", NAME, candidates.join(" / "));
				return;
			}

			// 模型列表仲裁:哪一侧与上次写入不同,哪一侧就是较新的用户意图。
			// 卡片/组合层编辑 → 用本条目值;模型选择页/其他途径改了 llm-pi-ai → 采纳并回写本条目,
			// 两侧都没动则维持原值。任何一侧的手动模型配置都不再被回退。
			let models = normalizeModels(value?.models);
			if (JSON.stringify(models) !== lastModels) {
				// 卡片或组合层的模型编辑尚未落到路由:本条目值胜出。
			} else {
				const liveModels = readLiveModels(route);
				const normalizedLive = liveModels ? JSON.stringify(normalizeModels(liveModels)) : null;
				if (normalizedLive !== null && normalizedLive !== lastModels) {
					models = JSON.parse(normalizedLive);
					void persistModels(models);
					logger.info("%s: 已采纳 llm-pi-ai 侧的模型列表编辑(%d 个模型)", NAME, models.length);
				}
			}

			const signature = JSON.stringify([vk, token, value?.route, value?.displayName, value?.gatewayURL, value?.pluginType, models]);
			if (signature === lastSignature) return;
			const profile = buildProfile(value, vk, token, models);
			for (let attempt = 0; ; attempt++) {
				if (stopping) return;
				try {
					await sctx.settings.update(NAMESPACE, { providers: { [route]: profile } });
					break;
				} catch (error) {
					// The llm-pi-ai entry may not be up yet during early boot; rapid saves
					// can also collide with the HMR transaction the write itself opened.
					if (attempt < 60 && /not registered|No configurable plugin entry|HMR transactions/i.test(String(error?.message))) {
						await new Promise((resolve) => setTimeout(resolve, 1000));
						continue;
					}
					logger.error("%s: 写入 %s 路由失败: %s", NAME, route, error?.stack ?? error);
					return;
				}
			}
			lastSignature = signature;
			lastModels = JSON.stringify(profile.models);
			logger.info("%s: 路由 %s 已就绪（模型 %s，密钥来源 %s，JWT 来自 %s）", NAME, route, profile.models.map((m) => m.id).join("/"), vk === value?.xApiKey?.trim() ? "组装层" : `凭据 ${ref}`, session?.file ?? "?");
		};

		const pollMs = Number.isFinite(config?.pollIntervalMs) && config.pollIntervalMs >= 1000
			? Math.floor(config.pollIntervalMs)
			: 5000;
		const timer = setInterval(() => {
			void sync("poll");
		}, pollMs);
		if (typeof timer?.unref === "function") timer.unref();

		const offCredential = typeof ctx.on === "function"
			? ctx.on("credentials/reference-updated", (ref) => {
				if (ref === vkRefOf(freshConfig())) void sync("credential");
			})
			: undefined;
		const offDocUpdated = typeof ctx.on === "function"
			? ctx.on("settings/document-updated", (ns) => {
				// 本条目:卡片编辑了活字段;llm-pi-ai:模型页或其他途径改了 providers(含模型列表)。
				if (ns === NAME) void sync("config");
				else if (ns === NAMESPACE) void sync("route");
			})
			: undefined;

		ctx.effect(() => () => {
			stopping = true;
			clearInterval(timer);
			if (typeof offCredential === "function") offCredential();
			if (typeof offDocUpdated === "function") offDocUpdated();
			// 卸载/禁用时移除本插件写入的路由，避免残留过期 JWT（条目重载也会触发，
			// 新一代 apply 会立即重写，短暂窗口无碍）。
			const route = nonEmpty(config?.route) ? config.route.trim() : "cannbot";
			void sctx.settings?.mutate?.(NAMESPACE, [{ op: "unset", path: ["providers", route] }])?.catch?.(() => {});
		}, `${NAME}:teardown`);

		logger.info("%s: 已加载（gateway=%s，配置来自 loader 行；displayName/gatewayURL/sessionFile 可在前端“插件配置”修改）", NAME, nonEmpty(config?.gatewayURL) ? config.gatewayURL : DEFAULT_GATEWAY);
		void seedCredential(vkRefOf(config), config?.xApiKey).then(() => sync("startup"));
	});
}

export { apply, inject };
