# ZCode 接入 cannbot 网关

把 cannbot（CANN 网关）的 DeepSeek / GLM 等模型接入智谱 **ZCode**（桌面端 + 终端 CLI）。

与 [`dsh-cannbot-gateway/`](../dsh-cannbot-gateway/) 面向 dsh-desktop 的思路一致，但 ZCode 没有 cordis 插件机制，这里利用的是 ZCode 自身的 **自定义 provider** 能力：`kind: openai-compatible` + provider 级自定义请求头，由本目录的安装脚本一键写入。

- 已在 **ZCode 0.16.5（Windows 11）** 上实测通过：DeepSeek V4 Flash/Pro、GLM 5.3/5.3-Flash/5.2 五个模型对话往返、工具调用（tool calls）均正常
- 密钥不落仓库：所有示例均使用占位符，脚本运行时才从本机读取/接收凭据

## 认证原理

cannbot 网关的每个请求必须同时携带（缺一即 401，与 dsh 插件、官方 OpenCode 插件同源）：

```
x-api-vkey: vk-xxxxxxxx            ← 虚拟密钥（provider 的 headers 字段提供）
Authorization: Bearer <JWT>        ← 写入 provider 的 apiKey（openai-compatible 协议自动加 Bearer）
```

ZCode 侧的关键映射：

| cannbot 需要 | ZCode provider 配置 | 说明 |
|---|---|---|
| `Authorization: Bearer <JWT>` | `options.apiKey` | openai-compatible kind 自动发送 Bearer 头 |
| `x-api-vkey: vk-...` | `headers`（provider 顶层） | 自定义头，桌面端构建运行时描述符时注入每个请求 |

JWT 建议用**长期 token**：cannbot 官方 OpenCode 插件在 `~/.local/share/opencode/auth.json` 落过 `cannbot-cli.access`（有效期到 2126 年），比 `~/.cannbot/session.json`（24 小时过期）省心得多。

## 包含内容

```
zcode/
├── cannbot-sync.mjs   ← 安装/修复/更新 VK 的一键脚本（无第三方依赖）
├── commands/vk.md     ← /vk 斜杠命令（可选，复制到 ~/.zcode/commands/）
└── README.md          ← 本文档
```

## 快速开始

**前提**：

- ZCode 0.16.x，且至少启动过一次（`~/.zcode/v2/config.json` 已生成）
- 拥有 cannbot 虚拟密钥 `vk-...`（配置过 cannbot 的 OpenCode 插件时，`~/.local/share/opencode/auth.json` 的 `cannbot.key` 就是它，脚本会自动读取）

**步骤**：

1. 把 [`cannbot-sync.mjs`](cannbot-sync.mjs) 复制到 `~/.zcode/` 下：

   ```bash
   cp cannbot-sync.mjs ~/.zcode/cannbot-sync.mjs
   ```

2. 运行（自动模式）：

   ```bash
   node ~/.zcode/cannbot-sync.mjs
   ```

   也可显式指定凭据：`node ~/.zcode/cannbot-sync.mjs --vk vk-xxxx [--jwt eyJ...]`。
   脚本会把 provider `cannbot` 写入两个配置文件（写前自动备份 `.bak`，写后校验 JSON）。

3. 验证：

   - **CLI（立即生效）**：

     ```bash
     node "%LOCALAPPDATA%/Programs/ZCode/resources/glm/zcode.cjs" -p "你是什么模型？" --cwd ~
     ```

     （macOS/Linux 路径为 ZCode 安装目录下的 `resources/glm/zcode.cjs`；脚本结束时会打印本机实际可用的验证命令。）
     回答中自报 DeepSeek 即为通。

   - **桌面端**：重启 ZCode，模型选择器出现 **CANNBOT** 分组，含 5 个模型。

## /vk 斜杠命令（可选）

把 [`commands/vk.md`](commands/vk.md) 复制到 `~/.zcode/commands/vk.md`，之后在 ZCode 输入框的 `/` 菜单即出现更新入口：

```
/vk              ← 自动模式：从 opencode auth.json 读取最新 VK/JWT 并同步
/vk vk-新密钥     ← 手动模式：显式指定新 VK
```

命令会驱动 agent 执行同步脚本、检查输出并汇报结果。适合 VK 轮换时使用，不必再碰脚本。

## 手动配置（与脚本等价）

不想跑脚本也可以手改以下两个文件。**注意 VK/JWT 在每个文件出现 2 处**（`options.headers` 与 provider 顶层 `headers`），漏一处即 401。以下占位符请替换：`<YOUR_VK>` = `vk-...`，`<YOUR_JWT>` = JWT。

**1. `~/.zcode/cli/config.json`**（CLI 运行时读取；文件不存在则新建）：

```json
{
  "provider": {
    "cannbot": {
      "kind": "openai-compatible",
      "name": "CANNBOT",
      "options": {
        "apiKey": "<YOUR_JWT>",
        "baseURL": "https://cannbot.hicann.cn/gateway/compatible-mode/v1",
        "headers": { "x-api-vkey": "<YOUR_VK>" }
      },
      "headers": { "x-api-vkey": "<YOUR_VK>" },
      "models": {
        "deepseek-v4-flash": {
          "name": "DeepSeek V4 Flash",
          "family": "deepseek",
          "reasoning": { "enabled": true, "levels": ["low", "max", "high"], "defaultLevel": "max" },
          "tool_call": true,
          "limit": { "context": 1048576, "output": 393216 },
          "modalities": { "input": ["text"], "output": ["text"] }
        }
      }
    }
  },
  "model": "cannbot/deepseek-v4-flash"
}
```

**2. `~/.zcode/v2/config.json`**（桌面端模型选择器读取；在已有 `provider` 表中追加，注意别覆盖其他键）：

```json
{
  "cannbot": {
    "name": "CANNBOT",
    "kind": "openai-compatible",
    "source": "custom",
    "enabled": true,
    "options": {
      "apiKey": "<YOUR_JWT>",
      "baseURL": "https://cannbot.hicann.cn/gateway/compatible-mode/v1",
      "headers": { "x-api-vkey": "<YOUR_VK>" }
    },
    "headers": { "x-api-vkey": "<YOUR_VK>" },
    "models": {
      "deepseek-v4-flash": {
        "name": "DeepSeek V4 Flash",
        "reasoning": { "enabled": true, "variants": ["low", "max", "high"], "defaultVariant": "max" },
        "limit": { "context": 1048576, "output": 393216 },
        "modalities": { "input": ["text"], "output": ["text"] },
        "zcode": { "modified": false, "priority": 50 }
      }
    }
  }
}
```

五个已验证模型的写法完全同构，仅需替换模型 ID 与限额：`deepseek-v4-flash`（输出 393216）、`deepseek-v4-pro`（393216）、`glm-5.3` / `glm-5.3-flash` / `glm-5.2`（输出 131072）。

## 更新 x-api-vkey

VK 出现在两个文件、各 2 处，共 4 处。推荐顺序：

1. **`/vk vk-新密钥`**（装了斜杠命令的话，一行搞定）
2. **重跑同步脚本**：`node ~/.zcode/cannbot-sync.mjs --vk vk-新密钥`
3. 手改 4 处后用 `python -m json.tool` 或任意 JSON 校验器确认语法

## 查询账号可用模型

```
GET https://cannbot.hicann.cn/cannbot/api/models/list?page=1&size=100
Authorization: Bearer <accessToken>
```

`status === 1` 的条目即为可用模型。除本文档内置的 5 个外，网关上还有 `qwen3.7-plus`、`qwen3.7-max`、`gpt-5.4`、`claude-opus-4-8` 等，按同样结构加进 `models` 即可。**注意该 API 会被 CloudWAF 拦截 curl/非浏览器客户端（418）**，请用浏览器打开 cannbot 站点、或用 Node/Electron 侧代码请求（ZCode 运行时本身不受影响）。

## 注意事项

- **虚拟密钥（`vk-...`）与 JWT 是敏感凭据**：不要提交到任何仓库、不要截图分享。本目录所有示例均使用占位符；`cannbot-sync.mjs` 自身不含任何密钥，凭据仅保存在本机 `~/.zcode/` 配置文件中，同步/备份时注意避开。
- **reasoning 参数只接受 `low` / `max` / `high`**（网关实测）：`off`、`none` 会返回 400，因此模型条目的 variants/levels 固定为这三档，不要加"关闭思考"档。
- **桌面端配置的生效时机**：ZCode 桌面端仅在启动时读取 `v2/config.json`。脚本写入后需重启 ZCode；重启后界面上的模型设置改动会按条目合并回写，不会冲掉 cannbot 条目。但**写入后、重启前**这段时间内若在设置界面改动模型相关选项，正在运行的旧内存状态可能把条目覆盖回去——写入后尽快重启即可。
- **ZCode 更新不影响配置**：更新只替换安装目录（`%LOCALAPPDATA%/Programs/ZCode`）下的程序文件，`~/.zcode/` 下的配置不受影响。万一未来大版本改了 provider 配置格式导致条目丢失，重跑一次同步脚本即可完整重建。
- **CLI 默认模型**：脚本仅在 `model` 字段缺失或本就指向 `cannbot/*` 时才设默认值，不会覆盖你已选择的其他模型。会话内可用 `/model cannbot/glm-5.3` 临时切换。
- **旧模型已下线**：cannbot 官方 OpenCode 插件示例中的 `deepseek-v3`、`deepseek-r1` 已不可用（403 `Model not allowed`），与 dsh 侧结论一致。

## 常见错误对照

| 现象 | 原因 | 处理 |
|---|---|---|
| `401 Virtual Key is required` | 缺 `x-api-vkey` 头 | 检查 provider 顶层 `headers`（桌面端实际读取的是它）与 `options.headers` 是否都写了 |
| `401 Access Token required` | 缺 `Authorization` 头 | 确认 `options.apiKey` 已填 JWT，且 provider `kind` 为 `openai-compatible`（anthropic kind 发的是 `x-api-key`，不适用） |
| `403 Model not allowed` | 该 VK 无权使用此模型 / 模型 ID 写错 | 用 models/list API 核对模型 ID；`deepseek-v3`、`deepseek-r1` 已下线 |
| 响应 `content` 为空但 `finish_reason: length` | DeepSeek V4 为 reasoning 模型 | 正常现象：token 先耗在推理上，调大 `max_tokens` 即可；ZCode 运行时原生解析 `reasoning_content` |
| `400` 且提示 reasoning/effort 相关 | `reasoning_effort` 传了 `off`/`none` | variants/levels 固定 `low`/`max`/`high` 三档 |
| 命令行 curl 测试返回 418 拦截页 | CloudWAF 识别 curl TLS 指纹 | 用 Node fetch / ZCode 运行时验证，不代表配置有问题 |
| 模型选择器无 CANNBOT 分组 | 桌面端未重启，或 `v2/config.json` 被旧内存状态覆盖 | 重启 ZCode；仍无则重跑同步脚本后再重启 |

## 兼容性

- ZCode 0.16.5（Windows 11）实测：CLI（`zcode.cjs -p` 无头模式）与桌面端配置链路均验证通过；桌面端模型选择器分组显示与重启加载行为基于对其配置读写代码的分析
- 五个模型对话往返 + 工具调用实测通过（2026-08，cannbot 网关 v2026-08 模型列表）
- 理论兼容 macOS/Linux 的 ZCode 安装（脚本全部基于 `os.homedir()` 与环境变量，未实测）
