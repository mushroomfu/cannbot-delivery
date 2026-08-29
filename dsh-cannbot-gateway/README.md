# dsh-cannbot-gateway

把 cannbot 的 OpenAI 兼容网关注册为 dsh-desktop 的 `llm-pi-ai` provider 路由。完整安装步骤、配置参考与注意事项见仓库根目录 [README](../README.md)。

## 认证方式（与 cannbot OpenCode 插件一致）

网关同时要求两个请求头：

- `x-api-vkey: <虚拟密钥 vk-...>` —— **在本插件配置里填写**
- `Authorization: Bearer <JWT>` —— 自动从 `~/.cannbot/session.json` 读取，**每 5 秒轮询**，cannbot 插件重新登录后自动生效，无需改任何文件

## 配置

在 `~/.dsh/profiles/desktop/cordis.patch.yml` 中以 loader 行 config 的方式配置：

```yaml
- id: cannbot-gateway
  config:
    xApiKey: vk-xxxxxxxxxxxxxxxx    # cannbot 虚拟密钥（必填）
    route: cannbot                   # llm-pi-ai 中的 provider 键名
    displayName: Cannbot             # 模型选择器里的分组名
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

改完 `xApiKey` 或模型列表后重启 dsh-desktop 即可生效；JWT 过期刷新则完全自动。

## 行为

- 通过 `ctx.settings` 写入 `llm-pi-ai` 命名空间的 `providers.<route>` 键，由 dsh 校验并持久化到 settings.yaml，适配器热加载；桌面端与网页版同时生效。
- 插件禁用/卸载时自动注销该路由，不残留过期 JWT。
- 帐号可用的模型列表可随时用 `GET /cannbot/api/models/list?page=1&size=100`（带 `Authorization: Bearer <session.json 的 JWT>`）查询。
