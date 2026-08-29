# cannbot-delivery

把 [cannbot](https://cannbot.hicann.cn)（CANN 网关）的 DeepSeek 等模型接入 **dsh-desktop**（DeepSeek Harness Desktop）。

当前包含 **`dsh-cannbot-gateway`** —— 一个 dsh-desktop cordis 插件：把 cannbot 的 OpenAI 兼容网关注册为 `llm-pi-ai` 的 provider 路由，模型选择器中出现 **Cannbot** 分组，桌面端与网页版同时可用。

## 特性

- **`x-api-vkey` 写在插件配置里**，不进 settings.yaml，不与手工配置互相覆盖
- **Bearer JWT 自动刷新**：每 5 秒轮询 `~/.cannbot/session.json`，cannbot 侧重新登录后自动跟进，无需改任何文件
- **桌面端 + 网页版同时生效**：插件运行在宿主侧，Electron 窗口与浏览器（`http://127.0.0.1:43120/`）共享同一条请求链路
- 通过 settings 服务写入 `llm-pi-ai` 命名空间：带 schema 校验、持久化、热加载；插件禁用/卸载时自动注销路由，不残留过期 JWT
- 零 npm 依赖（纯 Node 内置模块）

## 认证原理

cannbot 网关的每个请求必须同时携带（缺一即 401）：

```
x-api-vkey: vk-xxxxxxxx            ← 虚拟密钥（插件配置提供）
Authorization: Bearer <JWT>        ← 自动读取 ~/.cannbot/session.json
plugin_type: OpenCodeGUI           ← 来源标识
```

与 cannbot 官方 OpenCode 插件的 `chat.headers` 注入机制等价，只是改为静态插件配置 + 会话文件轮询。

## 安装

**前提**：

- dsh-desktop v2.x，且至少成功启动过一次（已生成 `~/.dsh/profiles/desktop/`）
- 网络可达 `cannbot.hicann.cn`
- 已在 cannbot VS Code 插件中登录过（生成 `~/.cannbot/session.json`）
- 拥有 cannbot 虚拟密钥 `vk-...`（若配置过 cannbot 的 OpenCode 插件，`~/.local/share/opencode/auth.json` 的 `cannbot.key` 就是它）

**步骤**：

1. 把 [`dsh-cannbot-gateway/`](dsh-cannbot-gateway/) 整个目录复制到 `~/.dsh/profiles/desktop/vendor/` 下：

   ```
   ~/.dsh/profiles/desktop/vendor/dsh-cannbot-gateway/
   ├── cordis.patch.yml
   ├── lib/index.js
   ├── package.json
   └── README.md
   ```

2. 编辑 `~/.dsh/profiles/desktop/package.json`，注册依赖与 bundle：

   ```json
   {
     "dependencies": {
       "dsh-cannbot-gateway": "file:vendor/dsh-cannbot-gateway",
       ...
     },
     "dsh": {
       "profile": {
         "bundles": [
           ...,
           "dsh-cannbot-gateway"
         ]
       }
     }
   }
   ```

3. 在 profile 目录执行安装：

   ```bash
   cd ~/.dsh/profiles/desktop
   pnpm install --no-frozen-lockfile
   ```

4. 编辑 `~/.dsh/profiles/desktop/cordis.patch.yml`，追加插件配置（**把 `xApiKey` 换成你自己的虚拟密钥**），完整示例见 [`examples/cordis-patch.example.yml`](examples/cordis-patch.example.yml)：

   ```yaml
   - id: cannbot-gateway
     config:
       enabled: true
       route: cannbot
       displayName: Cannbot
       xApiKey: vk-xxxxxxxx        # ← 你的 cannbot 虚拟密钥
       gatewayURL: https://cannbot.hicann.cn/gateway/compatible-mode/v1
       sessionFile: ~/.cannbot/session.json
       pluginType: OpenCodeGUI
       models:
         - id: deepseek-v4-flash
           name: DeepSeek-V4-Flash
           contextWindow: 1048576
           maxTokens: 393216
         - id: deepseek-v4-pro
           name: DeepSeek-V4-Pro
           contextWindow: 1048576
           maxTokens: 393216
   ```

5. 重启 dsh-desktop。

模型选择器出现 **Cannbot** 分组即安装成功。也可以查看日志确认：

```
%APPDATA%/DSH Desktop/logs/dsh-YYYY-MM-DD.log
```

应能看到两行：

```
[I] [cannbot-gateway] cannbot-gateway: 已加载（route=cannbot, gateway=..., models=...）
[I] [cannbot-gateway] cannbot-gateway: 路由 cannbot 已就绪（模型 ..., JWT 已注入）
```

## 配置参考

| 字段 | 默认值 | 说明 |
|---|---|---|
| `enabled` | `true` | 设为 `false` 时插件不注册路由，并注销已写入的路由 |
| `route` | `cannbot` | `llm-pi-ai.providers` 下的路由键名（模型选择器的 `provider`） |
| `displayName` | `Cannbot` | 模型选择器里的分组名 |
| `gatewayURL` | `https://cannbot.hicann.cn/gateway/compatible-mode/v1` | OpenAI 兼容网关地址 |
| `xApiKey` | （空，**必填**） | cannbot 虚拟密钥 `vk-...` |
| `sessionFile` | `~/.cannbot/session.json` | cannbot 登录态文件，自动轮询读取 `accessToken` |
| `pluginType` | `OpenCodeGUI` | `plugin_type` 请求头的值 |
| `pollIntervalMs` | `5000` | session.json 轮询间隔（毫秒，最小 1000） |
| `models` | deepseek-v4-flash / deepseek-v4-pro | 模型列表（`id`、`name`、`contextWindow`、`maxTokens`） |

`compat`（`supportsDeveloperRole: false`、`maxTokensField: max_tokens`）由插件固定写入，无需配置——这是 cannbot 网关实测要求的请求形态。

## 查询账号可用模型

```
GET https://cannbot.hicann.cn/cannbot/api/models/list?page=1&size=100
Authorization: Bearer <session.json 里的 accessToken>
```

返回字段中 `status === 1` 的条目（`model`、`title`、`contextLength`、`maxTokens`）即为可用模型，按需填入 `models` 列表。

## 卸载

1. 从 `cordis.patch.yml` 删除 `cannbot-gateway` 配置段
2. 从 `package.json` 的 `dependencies` 与 `bundles` 中移除 `dsh-cannbot-gateway`，再执行一次 `pnpm install`
3. 删除 `vendor/dsh-cannbot-gateway/`
4. 若 `settings.yaml` 的 `llm-pi-ai.providers` 下残留 `cannbot:` 段，手动删除（插件已负责自动清理，残留只可能来自更早的手工配置）

## 注意事项

- **虚拟密钥（`vk-...`）是敏感凭据**：不要提交到任何仓库、不要截图分享。本仓库所有示例均使用占位符。
- **JWT 有效期 24 小时**，由 cannbot 登录态决定。插件每 5 秒轮询 `session.json`，你在 cannbot VS Code 插件重新登录后 dsh 自动跟随；未登录（文件缺失或无 `accessToken`）时插件不写路由，恢复登录后 5 秒内自动注册。
- **不要在 settings.yaml 里手工维护 `cannbot:` 段**：路由由插件全权管理，手工段会在插件写入时被覆盖，且其 JWT 过期后会造成难排查的 401。
- **旧模型已下线**：cannbot 官方 OpenCode 插件示例中的 `deepseek-v3`、`deepseek-r1` 已不可用（网关返回 403 `Model not allowed`），请以 models/list API 的结果为准。
- **网页版访问**需要 `settings.yaml` 中 `dsh-desktop.mode: compatibility` 且 `openBrowser: true`；`networkExposure: loopback` 时仅本机浏览器可访问，改为 `lan` 意味着局域网内任何人都能操作你的电脑，请谨慎。
- **网关偶发 502**（socket 连接被对端关闭）属 cannbot 侧瞬断，dsh 会自动重试；持续失败时先确认浏览器能打开 cannbot 站点。
- **本机代理故障不影响本插件**：LLM 请求走 Node fetch（undici），不读取 `HTTPS_PROXY` 环境变量，cannbot 为国内可达地址，直连即可。
- 插件对 `llm-pi-ai` 命名空间的写入需要该命名空间已注册（dsh 内置适配器）；启动早期尚未注册时插件会自动退避重试（最长 60 秒），无需干预。
- `agent-default-model` 可指向本路由（如 `provider: cannbot, model: deepseek-v4-pro`），把 cannbot 模型设为默认。
- 网页版端口默认 `43120`，被占用时自动顺延（43121、43122…）。

## 常见错误对照

| 现象 | 原因 | 处理 |
|---|---|---|
| `401 Access Token required` | 缺 `Authorization` 头 | 确认 `sessionFile` 路径正确、cannbot 已登录；插件日志会提示 JWT 缺席 |
| `401 Virtual Key is required` | 缺 `x-api-vkey` 头 | 检查 `cordis.patch.yml` 中 `xApiKey` 是否填写、重启是否生效 |
| `403 Model not allowed` | 该 VK 无权使用此模型（或模型已下线） | 用 models/list API 查可用模型，更新 `models` 列表 |
| 模型选择器无 Cannbot 分组 | 插件未加载或未写路由 | 查日志中 `cannbot-gateway` 关键字；确认 bundle 已注册、`pnpm install` 已执行 |
| `MISSING_CREDENTIAL` | profile 误配了 `apiKeyEnv` | 本插件不使用 `apiKeyEnv`，认证全在 `headers` 中 |
| 日志出现 `settings namespace "llm-pi-ai" is not registered` | 启动时序问题 | 插件会自动重试至多 60 秒，无需处理；持续出现说明 dsh 版本异常 |

## 兼容性

- dsh-desktop v2.0.3（`@deepseek-ai/dsh-llm-pi-ai` 基于 `@earendil-works/pi-ai` 的 openai-completions 协议）上开发验证
- dsh-desktop（Electron 窗口）与 dsh 网页版（浏览器访问本机 webserver）同时验证通过
- Windows 10/11；理论兼容 macOS/Linux（未验证，`sessionFile` 路径支持 `~` 展开）

## License

MIT
