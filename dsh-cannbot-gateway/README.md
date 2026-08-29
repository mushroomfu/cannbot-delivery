# dsh-cannbot-gateway

把 cannbot 的 OpenAI 兼容网关注册为 dsh-desktop 的 `llm-pi-ai` provider 路由。完整安装步骤、配置参考与注意事项见仓库根目录 [README](../README.md)。

## 修改虚拟密钥（推荐：前端可视化）

**设置 → 插件 → 插件配置 → 「Cannbot 网关」卡片**，在「虚拟密钥（x-api-vkey）」密码框填入新的 `vk-...` 并保存——密钥写入本机凭据库（`.credentials.yaml` 的 `CANNBOT_VK` 引用，不进设置文件），插件监听凭据变更后**立即热重写路由，无需重启**。桌面端与网页版都有这张卡片。

## 认证方式（与 cannbot OpenCode 插件一致）

网关同时要求两个请求头：

- `x-api-vkey: <虚拟密钥 vk-...>` —— 凭据库引用（默认 `CANNBOT_VK`）或 loader 行 `config.xApiKey` 兜底
- `Authorization: Bearer <JWT>` —— 自动从 `~/.cannbot/session.json` 读取，**每 5 秒轮询**，cannbot 插件重新登录后自动生效，无需改任何文件

## 配置

在 `~/.dsh/profiles/desktop/cordis.patch.yml` 中以 loader 行 config 的方式配置：

```yaml
- id: cannbot-gateway
  config:
    enabled: true
    route: cannbot                   # llm-pi-ai 中的 provider 键名
    displayName: Cannbot             # 模型选择器里的分组名（前端可改）
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

前端卡片可改：虚拟密钥、分组名称、网关地址、登录态文件。模型列表等仍在本文件维护，改后重启生效。

## 行为

- 通过 `ctx.settings` 写入 `llm-pi-ai` 命名空间的 `providers.<route>` 键，由 dsh 校验并持久化到 settings.yaml，适配器热加载；桌面端与网页版同时生效。
- 前端保存的密钥经 credentials 域写入本机凭据库，绝不进入设置文档、绝不经前端回显（只显示「已配置/未配置」徽章）。
- 插件禁用/卸载时自动注销该路由，不残留过期 JWT。
- 帐号可用的模型列表可随时用 `GET /cannbot/api/models/list?page=1&size=100`（带 `Authorization: Bearer <session.json 的 JWT>`）查询。
