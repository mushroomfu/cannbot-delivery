# dsh-cannbot-gateway

把 cannbot 的 OpenAI 兼容网关注册为 dsh 的 `llm-pi-ai` provider 路由。完整安装步骤、配置参考与注意事项见仓库根目录 [README](../README.md)。

**v0.3.2 适配 DeepSeek Harness `0.2.0-rc.x`**(新版「插件」页面与 configForms/`plugins.item` API,Electron 44 构建);v0.2.x 面向旧版 dsh-desktop 2.0.3,两者 API 不兼容,请按所装版本选择。

## 修改虚拟密钥（推荐：前端可视化）

**插件 → 「Cannbot 网关」**（0.2.0-rc.x 的插件详情页；旧版 2.0.3 在 设置 → 插件 → 插件配置 → 「Cannbot 网关」卡片），在「虚拟密钥（x-api-vkey）」密码框填入新的 `vk-...` 并保存——密钥写入本机凭据库（`.credentials.yaml` 的 `CANNBOT_VK` 引用，不进设置文件），插件监听凭据变更后**立即热重写路由，无需重启**。桌面端与网页版都有这张卡片。

## 认证方式（与 cannbot OpenCode 插件一致）

网关同时要求两个请求头：

- `x-api-vkey: <虚拟密钥 vk-...>` —— 凭据库引用（默认 `CANNBOT_VK`）或 loader 行 `config.xApiKey` 兜底
- `Authorization: Bearer <JWT>` —— 自动从 cannbot 登录态文件读取，**每 5 秒轮询**：默认先探测 `~/.local/share/opencode/session.json`（cannbot-toolkit ≥2.0），回落 `~/.cannbot/session.json`（1.x）；cannbot 插件重新登录后自动生效，无需改任何文件

## 配置

在 `~/.dsh/profiles/desktop/cordis.patch.yml` 中以 loader 行 config 的方式配置：

```yaml
- id: cannbot-gateway
  config:
    enabled: true
    route: cannbot                   # llm-pi-ai 中的 provider 键名
    displayName: Cannbot             # 模型选择器里的分组名（前端可改）
    gatewayURL: https://cannbot.hicann.cn/gateway/compatible-mode/v1
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

`sessionFile` 可省略（schema 默认值即自动探测新/旧两个登录态位置）；虚拟密钥**不再写在这里**——装好后在前端卡片填写，或确认凭据库 `CANNBOT_VK` 引用已配置。

前端卡片可改：虚拟密钥、分组名称、网关地址、登录态文件。模型列表等仍在本文件维护，改后重启生效。

## 行为

- 通过 `settings.update("llm-pi-ai", { providers })` 写入路由:0.2.0-rc.x 中 `llm-pi-ai` 的 `providers` 是 volatile 字段,写入会持久化到本 profile 的组合文件(cordis.patch.yml 的 `llm-pi-ai` 行,**含 JWT**)并热重载适配器,桌面端与网页版同时生效;插件每次启动、以及卡片配置/凭据/登录态任一变化时都会重写路由。
- 卡片可改的 `displayName` / `gatewayURL` / `sessionFile` 在本插件 Config 里声明为 volatile:保存后由 settings 服务原地应用到条目配置(不重跑插件),插件监听 `settings/document-updated` 事件实时重写路由。
- 前端保存的密钥经 credentials 域写入本机凭据库，绝不进入设置文档、绝不经前端回显（只显示「已配置/未配置」徽章）。
- 插件禁用/卸载时自动注销该路由，不残留过期 JWT。
- 帐号可用的模型列表可随时用 `GET /cannbot/api/models/list?page=1&size=100`（带 `Authorization: Bearer <session.json 的 JWT>`）查询。
