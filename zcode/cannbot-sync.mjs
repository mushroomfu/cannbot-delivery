#!/usr/bin/env node
/**
 * cannbot-sync.mjs — 在 ZCode 中安装/修复/更新 cannbot 模型服务
 *
 * 用法：
 *   node cannbot-sync.mjs                # 自动读取 VK/JWT 并同步
 *   node cannbot-sync.mjs --vk vk-xxx    # 手动指定新的 x-api-vkey
 *   node cannbot-sync.mjs --jwt eyJ...   # 手动指定新的 JWT
 *
 * 凭据来源（自动模式）：
 *   VK  ← ~/.local/share/opencode/auth.json 的 cannbot.key
 *         （配置过 cannbot 官方 OpenCode 插件的机器上即存在；也可用 --vk 显式指定）
 *   JWT ← 优先 auth.json 的 cannbot-cli.access（长期 token，几乎不过期），
 *         已过期则回退 ~/.cannbot/session.json（24 小时有效）
 *
 * 同步目标（VK/JWT 各写入 2 处，共 4 处，写前自动备份 .bak）：
 *   ~/.zcode/cli/config.json  → provider.cannbot.{options.headers, headers}   （CLI 即时生效）
 *   ~/.zcode/v2/config.json   → provider.cannbot.{options.headers, headers}   （桌面端需重启 ZCode）
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const args = process.argv.slice(2);
function argOf(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

// ── 凭据解析 ─────────────────────────────────────────────────────────────────
const authPath = join(homedir(), ".local", "share", "opencode", "auth.json");
let vk = argOf("--vk");
let jwt = argOf("--jwt");
let vkSource = vk ? "命令行参数 --vk" : null;
let jwtSource = jwt ? "命令行参数 --jwt" : null;

if (!vk || !jwt) {
  if (!existsSync(authPath)) {
    console.error(`[x] 找不到 ${authPath}，且未通过 --vk/--jwt 提供凭据`);
    console.error("    请改用: node cannbot-sync.mjs --vk vk-xxxx [--jwt eyJ...]");
    process.exit(1);
  }
  const auth = JSON.parse(readFileSync(authPath, "utf-8"));
  if (!vk) {
    vk = auth.cannbot?.key ?? auth["cannbot-vk"]?.key;
    vkSource = "opencode auth.json";
  }
  if (!jwt) {
    const cliExp = auth["cannbot-cli"]?.access
      ? JSON.parse(Buffer.from(auth["cannbot-cli"].access.split(".")[1], "base64").toString()).exp
      : 0;
    const nowSec = Math.floor(Date.now() / 1000);
    if (cliExp > nowSec) {
      jwt = auth["cannbot-cli"].access;
      jwtSource = "opencode auth.json";
    } else if (existsSync(join(homedir(), ".cannbot", "session.json"))) {
      jwt = JSON.parse(readFileSync(join(homedir(), ".cannbot", "session.json"), "utf-8")).accessToken;
      jwtSource = "~/.cannbot/session.json（24 小时有效）";
      console.warn("[!] 长期 CLI token 缺失或已过期，回退使用 session.json（24 小时后需重新同步）");
    }
  }
}
if (!vk || !jwt) {
  console.error("[x] 缺少 VK 或 JWT，无法同步");
  process.exit(1);
}
const jwtExp = new Date(JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString()).exp * 1000);
console.log(`[i] VK 来源: ${vkSource}   JWT 来源: ${jwtSource}`);
console.log(`[i] VK: ${vk.slice(0, 8)}...  JWT 过期时间: ${jwtExp.toISOString()}`);

// ── provider 条目 ────────────────────────────────────────────────────────────
const GATEWAY = "https://cannbot.hicann.cn/gateway/compatible-mode/v1";
const HEADERS = { "x-api-vkey": vk };

const REASONING_LEVELS = ["low", "max", "high"];
// cannbot 网关对 reasoning_effort 的实测兼容值；off/none 会 400，勿加入
const CLI_MODELS = {
  "deepseek-v4-flash": { name: "DeepSeek V4 Flash", family: "deepseek", reasoning: { enabled: true, levels: REASONING_LEVELS, defaultLevel: "max" }, tool_call: true, limit: { context: 1048576, output: 393216 }, modalities: { input: ["text"], output: ["text"] } },
  "deepseek-v4-pro": { name: "DeepSeek V4 Pro", family: "deepseek", reasoning: { enabled: true, levels: REASONING_LEVELS, defaultLevel: "max" }, tool_call: true, limit: { context: 1048576, output: 393216 }, modalities: { input: ["text"], output: ["text"] } },
  "glm-5.3": { name: "GLM 5.3", family: "glm", reasoning: { enabled: true, levels: REASONING_LEVELS, defaultLevel: "max" }, tool_call: true, limit: { context: 1048576, output: 131072 }, modalities: { input: ["text"], output: ["text"] } },
  "glm-5.3-flash": { name: "GLM 5.3 Flash", family: "glm", reasoning: { enabled: true, levels: REASONING_LEVELS, defaultLevel: "max" }, tool_call: true, limit: { context: 1048576, output: 131072 }, modalities: { input: ["text"], output: ["text"] } },
  "glm-5.2": { name: "GLM 5.2", family: "glm", reasoning: { enabled: true, levels: REASONING_LEVELS, defaultLevel: "max" }, tool_call: true, limit: { context: 1048576, output: 131072 }, modalities: { input: ["text"], output: ["text"] } },
};

function v2Model(name, priority, output) {
  return {
    name,
    reasoning: { enabled: true, variants: REASONING_LEVELS, defaultVariant: "max" },
    limit: { context: 1048576, output },
    modalities: { input: ["text"], output: ["text"] },
    zcode: { modified: false, priority },
  };
}
const V2_MODELS = {
  "deepseek-v4-flash": v2Model("DeepSeek V4 Flash", 50, 393216),
  "deepseek-v4-pro": v2Model("DeepSeek V4 Pro", 49, 393216),
  "glm-5.3": v2Model("GLM 5.3", 48, 131072),
  "glm-5.3-flash": v2Model("GLM 5.3 Flash", 47, 131072),
  "glm-5.2": v2Model("GLM 5.2", 46, 131072),
};

function buildCliEntry() {
  return {
    kind: "openai-compatible",
    name: "CANNBOT",
    options: { apiKey: jwt, baseURL: GATEWAY, headers: HEADERS },
    headers: HEADERS,
    models: CLI_MODELS,
  };
}
function buildV2Entry() {
  return {
    name: "CANNBOT",
    kind: "openai-compatible",
    source: "custom",
    enabled: true,
    options: { apiKey: jwt, baseURL: GATEWAY, headers: HEADERS },
    headers: HEADERS,
    models: V2_MODELS,
  };
}

// ── 写入 ─────────────────────────────────────────────────────────────────────
function upsert(path, entry, isDesktop) {
  if (!existsSync(path)) {
    console.error(`[x] 目标文件不存在: ${path}`);
    return false;
  }
  copyFileSync(path, path + ".bak");
  const cfg = JSON.parse(readFileSync(path, "utf-8"));
  cfg.provider = cfg.provider ?? {};
  cfg.provider.cannbot = entry;
  // 仅在默认模型缺失或本就指向 cannbot 时才设默认，避免覆盖用户自己的选择
  if (!isDesktop && (!cfg.model || cfg.model.startsWith("cannbot/"))) {
    cfg.model = cfg.model ?? "cannbot/deepseek-v4-flash";
  }
  writeFileSync(path, JSON.stringify(cfg, null, 2), "utf-8");
  JSON.parse(readFileSync(path, "utf-8")); // 写后校验
  console.log(`[+] 已更新 ${path}`);
  return true;
}

const ok1 = upsert(join(homedir(), ".zcode", "cli", "config.json"), buildCliEntry(), false);
const ok2 = upsert(join(homedir(), ".zcode", "v2", "config.json"), buildV2Entry(), true);

if (ok1 && ok2) {
  console.log("\n完成。CLI 立即生效；桌面端模型选择器需重启 ZCode。");
  const zcodeCli = join(
    process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
    "Programs", "ZCode", "resources", "glm", "zcode.cjs",
  );
  console.log(
    existsSync(zcodeCli)
      ? `验证: node "${zcodeCli}" -p "你好" --cwd ~`
      : "验证: 重启 ZCode 后在模型选择器选择 CANNBOT 分组，或在终端 zcode 中直接对话。",
  );
}
