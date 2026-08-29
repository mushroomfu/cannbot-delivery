/**
 * dsh-cannbot-gateway — register the cannbot OpenAI-compatible gateway
 * (https://cannbot.hicann.cn/gateway/compatible-mode/v1) as an `llm-pi-ai`
 * provider route.
 *
 * Auth mirrors the cannbot OpenCode plugin: the gateway requires BOTH
 *   - `x-api-vkey: <virtual key>`    → configured on this plugin (loader row config)
 *   - `Authorization: Bearer <JWT>`  → read from ~/.cannbot/session.json
 *
 * The session file is polled, so a fresh login in the cannbot VS Code
 * extension propagates into dsh without touching settings.yaml. The route is
 * written through the settings service (`llm-pi-ai` namespace), which
 * validates and persists it into settings.yaml and hot-reloads the adapter.
 *
 * Config (the loader row's `config:` block, e.g. in cordis.patch.yml):
 *   enabled       whether to register the route (default true)
 *   route         provider key inside llm-pi-ai.providers (default "cannbot")
 *   displayName   model picker label (default "Cannbot")
 *   gatewayURL    OpenAI-compatible base URL
 *   xApiKey       the cannbot virtual key (vk-...)  [required]
 *   sessionFile   path of cannbot session.json (default ~/.cannbot/session.json)
 *   pluginType    plugin_type header value (default "OpenCodeGUI")
 *   pollIntervalMs  session.json poll interval (default 5000)
 *   models        [{ id, name, contextWindow, maxTokens }]
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const NAMESPACE = "llm-pi-ai";
const NAME = "cannbot-gateway";

const DEFAULT_MODELS = [
	{ id: "deepseek-v4-flash", name: "DeepSeek-V4-Flash", contextWindow: 1048576, maxTokens: 393216 },
	{ id: "deepseek-v4-pro", name: "DeepSeek-V4-Pro", contextWindow: 1048576, maxTokens: 393216 },
];

function resolveConfig(raw = {}) {
	const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
	const out = {
		enabled: raw?.enabled !== false,
		route: nonEmpty(raw?.route) ? raw.route.trim() : "cannbot",
		displayName: nonEmpty(raw?.displayName) ? raw.displayName.trim() : "Cannbot",
		gatewayURL: nonEmpty(raw?.gatewayURL)
			? raw.gatewayURL.trim().replace(/\/+$/, "")
			: "https://cannbot.hicann.cn/gateway/compatible-mode/v1",
		xApiKey: typeof raw?.xApiKey === "string" ? raw.xApiKey.trim() : "",
		sessionFile: nonEmpty(raw?.sessionFile)
			? raw.sessionFile.trim()
			: join(homedir(), ".cannbot", "session.json"),
		pluginType: nonEmpty(raw?.pluginType) ? raw.pluginType.trim() : "OpenCodeGUI",
		pollIntervalMs: Number.isFinite(raw?.pollIntervalMs) && raw.pollIntervalMs >= 1000
			? Math.floor(raw.pollIntervalMs)
			: 5000,
		models: Array.isArray(raw?.models) && raw.models.length > 0
			? raw.models
				.map((model) => ({
					id: String(model?.id ?? "").trim(),
					name: nonEmpty(model?.name) ? model.name.trim() : String(model?.id ?? "").trim(),
					contextWindow: Number.isFinite(model?.contextWindow) && model.contextWindow > 0
						? Math.floor(model.contextWindow)
						: 1048576,
					maxTokens: Number.isFinite(model?.maxTokens) && model.maxTokens > 0
						? Math.floor(model.maxTokens)
						: 32768,
				}))
				.filter((model) => model.id.length > 0)
			: DEFAULT_MODELS,
	};
	if (out.sessionFile.startsWith("~")) out.sessionFile = join(homedir(), out.sessionFile.slice(1));
	return out;
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

function buildProfile(config, token) {
	const headers = { "x-api-vkey": config.xApiKey, plugin_type: config.pluginType };
	if (token) headers.Authorization = `Bearer ${token}`;
	return {
		displayName: config.displayName,
		api: "openai-completions",
		baseURL: config.gatewayURL,
		headers,
		compat: { supportsDeveloperRole: false, maxTokensField: "max_tokens" },
		timeoutMs: 120000,
		streamIdleTimeoutMs: 300000,
		models: config.models.map(({ id, name, contextWindow, maxTokens }) => ({ id, name, contextWindow, maxTokens })),
	};
}

const name = NAME;
const inject = ["settings"];

function apply(ctx, rawConfig) {
	const config = resolveConfig(rawConfig);
	const logger = ctx.logger;
	const modelSummary = config.models.map((model) => model.id).join("/");

	if (!config.enabled) {
		// Best-effort cleanup when a previously enabled fiber is torn down.
		ctx.effect(() => () => {
			void ctx.settings?.mutate?.(NAMESPACE, [{ op: "unset", path: ["providers", config.route] }])?.catch?.(() => {});
		}, `${NAME}:unregister-on-dispose`);
		logger.info("%s: enabled=false，路由 %s 保持注销", NAME, config.route);
		return;
	}

	if (!config.xApiKey) {
		logger.warn("%s: 未配置 xApiKey（cannbot 虚拟密钥 vk-...），跳过路由注册；请在插件 loader 行的 config.xApiKey 填写", NAME);
		return;
	}

	let lastToken = null;
	let stopping = false;

	const write = async () => {
		const token = readAccessToken(config.sessionFile);
		if (token === lastToken) return;
		if (!token) {
			logger.warn("%s: %s 中暂无 accessToken，等待下次轮询", NAME, config.sessionFile);
			return;
		}
		const profile = buildProfile(config, token);
		// llm-pi-ai 的命名空间可能晚于本插件注册；未注册时退避重试。
		for (let attempt = 0; ; attempt++) {
			if (stopping) return;
			try {
				await ctx.settings.update(NAMESPACE, { providers: { [config.route]: profile } });
				break;
			} catch (error) {
				if (attempt < 60 && /not registered/i.test(String(error?.message))) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					continue;
				}
				logger.error("%s: 写入 %s 路由失败: %s", NAME, config.route, error?.stack ?? error);
				return;
			}
		}
		lastToken = token;
		logger.info("%s: 路由 %s 已就绪（模型 %s，JWT 已注入）", NAME, config.route, modelSummary);
	};

	void write();

	const timer = setInterval(() => {
		void write();
	}, config.pollIntervalMs);
	if (typeof timer?.unref === "function") timer.unref();

	ctx.effect(() => () => {
		stopping = true;
		clearInterval(timer);
		// 卸载/禁用时移除本插件写入的路由，避免残留过期 JWT（关停途中失败可忽略）。
		void ctx.settings?.mutate?.(NAMESPACE, [{ op: "unset", path: ["providers", config.route] }])?.catch?.(() => {});
	}, `${NAME}:teardown`);

	logger.info("%s: 已加载（route=%s, gateway=%s, models=%s）", NAME, config.route, config.gatewayURL, modelSummary);
}

export { apply, inject, name };
