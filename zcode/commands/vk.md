---
description: 更新 cannbot 网关的 x-api-vkey 并同步到 ZCode 全部配置
argument-hint: [vk-新密钥]（留空则自动读取 opencode auth.json 中的最新 VK）
allowed-tools: Bash(node *)
---

用户要更新 cannbot 网关的 x-api-vkey（虚拟密钥）。用户参数：$ARGUMENTS

前提：`~/.zcode/cannbot-sync.mjs` 已按本仓库 [`zcode/README.md`](../zcode/README.md) 安装。

请严格按以下步骤执行：

1. 判断参数：若上面的用户参数中包含一个以 `vk-` 开头的字符串，则将其作为新 VK，运行：
   `node "$HOME/.zcode/cannbot-sync.mjs" --vk <该vk值>`
   （若 shell 不展开 `$HOME`，请替换为用户主目录的绝对路径。）
   若参数为空或只有 `status` 字样，则运行自动模式（脚本自动从 `~/.local/share/opencode/auth.json` 读取最新 VK 与长期 JWT）：
   `node "$HOME/.zcode/cannbot-sync.mjs"`
2. 检查脚本输出的三个关键点，全部正常才算成功：
   - `已更新` 出现两次（cli/config.json 和 v2/config.json）
   - `JWT 过期时间` 为 2126 年附近（长期 token）；若出现回退 session.json 的警告，提醒用户该 token 24 小时过期
   - 末尾无 `[x]` 报错行
3. 用简洁的中文向用户报告：新 VK 前 8 位、JWT 过期时间、写入的文件，并固定提醒两句话：
   - CLI（终端 zcode）立即生效；
   - 桌面端模型选择器需要重启 ZCode 后生效。
4. 若脚本失败（如提示找不到凭据），告知用户获取新 VK 后用 `/vk vk-xxxx` 的形式重试；若连 `--vk` 参数也失败，请检查 `~/.zcode/cannbot-sync.mjs` 是否存在。
