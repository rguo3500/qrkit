# QRKit System Audit Baseline

审核对象是 `/home/ubuntu/qrkit` 当前工作树及正式域名 `https://lovexiaoyue.dpdns.org`。当前项目为 React/Vite 前端、Cloudflare Pages Functions、D1 数据库、tRPC 风格 API、Google OAuth 2.0，以及 Dynamic QR 与 Team Workspace 业务模块。

截至本次审核，工作树包含 `client/`、`functions/`、`server/`、`shared/`、`drizzle/`、`d1-migrations/`、`worker/`、Playwright/Vitest 测试和 Wrangler 配置。项目存在较多历史 todo，其中已完成项与未完成项混杂；当前明确的生产阻断信号是：Google OAuth callback 已成功更新 D1 用户，但正式浏览器的 `team.list` 仍返回 401，用户无法进入 Team Workspace。此前已经尝试 HttpOnly cookie、单 Set-Cookie 和 fragment/sessionStorage 兜底，但 fragment 方案尚未完成正式域名验证。

已确认的外部事实：生产 D1 数据库 `qrkit` 已应用 `0001_dynamic_qr.sql` 和 `0002_team_collaboration.sql`；只读查询确认 `users`、`teams`、`team_members`、`dynamic_link_shares` 存在，Google 用户记录 `rguo3500@gmail.com` 已写入，`last_signed_in` 曾更新。正式 `/teams` 能渲染，不再出现白屏，但未登录状态仍显示登录恢复入口。

审核必须重点交叉验证：OAuth state/nonce/PKCE、callback 重定向和 session 传递；Functions 的 cookie、Bearer fallback、JWT 验证、CORS/CSRF、异常响应和速率限制；D1 schema 与 migration 一致性、索引、外键和权限边界；Dynamic QR 公开重定向与扫描事件写入；Team owner/editor/viewer 的跨团队访问控制；前端查询启用条件、loading/error/empty 状态和可访问性；SEO sitemap/robots/feed/canonical/meta；Cloudflare Pages 构建变量、Functions 绑定、`_redirects`、缓存和部署可重复性；测试覆盖与真实生产 E2E 缺口。
