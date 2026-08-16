# QRKit 生产验收记录

本文档用于记录 QRKit 在 `https://lovexiaoyue.dpdns.org` 上的人工验收结果。仓库测试不能替代 Cloudflare Pages 环境变量、Google OAuth、Search Console 或真实浏览器会话的验证，因此外部环境项目必须由部署者回填证据。

## 当前代码可验证结果

| 项目 | 结果 | 证据 |
|---|---|---|
| Team Workspace 页面与导航 | 已移除 | `client/src/App.tsx` 不再注册 `/teams`，`client/src/pages/TeamPage.tsx` 已删除 |
| 团队 Pages Functions procedure | 已移除 | `functions/api/trpc/[[trpc]].ts` 不再包含 `team.*` 分支 |
| 单用户 Dynamic QR API | 已保留 | `dynamicQr.list/stats/create/update/remove` 仍由 Pages Functions 提供 |
| Dynamic QR 统计准确性 | 已覆盖自动化回归 | `COUNT(*)` 总数、14 日趋势、最近访问分别查询；`pnpm test` 包含 Functions 与组件测试 |
| 静态 QR 与 Barcode | 已保留 | 前端工具路由和浏览器本地生成代码未依赖团队模块 |
| 构建与类型 | 已通过 | 最近一次执行 `pnpm test`：15 个文件、50 项断言；`pnpm check` 与 `pnpm build` 通过 |
| 干净交付包 | 已生成 | `qrkit-clean-single-user.zip`，不包含 `node_modules`、`dist`、`.wrangler`、测试结果和 `.git` |

## 必须由部署者回填的正式域名验收

### Cloudflare Pages Production 配置

请在 Cloudflare Pages 的 Production 环境核对以下变量，并将核对日期、部署 ID 或部署日志链接补充到表格中。不要把 secret 值写入仓库。

| 变量 | 已核对 | 证据/日期 |
|---|---|---|
| `GOOGLE_CLIENT_ID` | [ ] | |
| `GOOGLE_CLIENT_SECRET` | [ ] | |
| `GOOGLE_REDIRECT_URI=https://lovexiaoyue.dpdns.org/api/oauth/callback` | [ ] | |
| `JWT_SECRET` | [ ] | |
| `PUBLIC_SITE_URL=https://lovexiaoyue.dpdns.org` | [ ] | |
| 最新 GitHub `main` 已触发 Pages 部署 | [ ] | |

### Google OAuth 与 Dynamic QR

使用无痕窗口或清理后的浏览器会话，访问正式域名并记录每一步结果。若 Dynamic QR 页面没有链接数据，应先创建一个测试链接，再执行扫码和统计验证。

| 验收步骤 | 结果 | 证据/时间 |
|---|---|---|
| 访问 `/dynamic-qr` 后可跳转 Google 登录 | [ ] | |
| Google 回调后回到 `/dynamic-qr`，不是 callback 或 404 | [ ] | |
| 可创建 Dynamic QR，目标为 HTTP(S) URL | [ ] | |
| 编辑目标后，旧目标不再生效 | [ ] | |
| 停用后 `/r/:id` 不再重定向 | [ ] | |
| 激活后 `/r/:id` 返回 302 并记录 scan event | [ ] | |
| 统计总数与实际扫码次数一致 | [ ] | |
| 14 日趋势、Recent visits 和空状态正确显示 | [ ] | |

### Playwright 认证统计验收

如需运行真实浏览器自动化，请在本地准备有效的 `PLAYWRIGHT_STORAGE_STATE`，然后执行项目 README 中的 Playwright 命令。认证状态文件不得提交到 GitHub。执行结果应记录测试时间、目标域名和通过/失败数量；没有有效 storage state 时，只能报告组件级和 Functions 级测试，不能声称已完成真实生产浏览器验收。

### Google Search Console

请记录资源类型（Domain property 或 URL-prefix property）、验证方式、验证日期、sitemap URL 和 Search Console 显示的提交/读取结果。推荐记录为：

| 项目 | 记录 |
|---|---|
| Property | |
| Verification method | |
| Verification date | |
| Sitemap URL | `https://lovexiaoyue.dpdns.org/sitemap.xml` |
| Sitemap submitted date | |
| Last read / status | |

## 数据保留说明

本次方案 A 不删除 D1 中既有 `teams`、`team_members` 和 `dynamic_link_shares` 表，也不执行破坏性迁移。应用代码不再读取或写入这些表；保留它们是为了避免不可恢复的数据删除，并不表示团队功能仍然可用。
