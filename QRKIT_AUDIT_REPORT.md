# QRKit 全面项目审核报告

**审核对象：** QRKit（React/Vite + Cloudflare Pages Functions + D1 + Google OAuth）  
**正式域名：** `https://lovexiaoyue.dpdns.org`  
**审核日期：** 2026-08-16  
**审核范围：** 源代码、D1 migration、Pages Functions、OAuth、Dynamic QR、团队协作、SEO、测试、依赖与生产域名行为。

## 一、结论摘要

QRKit 的静态生成器、SEO 内容体系、D1 基础表结构、权限查询边界和 Cloudflare Pages 构建链路已经形成可运行的产品骨架。当前本地验证仍然稳定：**16 个测试文件、54 项断言通过，TypeScript 检查通过，production build 通过**。正式域名的 `/teams` 已不再出现白屏，错误边界和显式登录入口也能够正常渲染。

但是，项目目前**不应被认定为已经完成生产级团队协作交付**。最高风险集中在认证会话：Google OAuth callback 可以更新 D1 用户记录，但真实浏览器在多次生产验收中仍无法保持可用的 `app_session_id`，Team Workspace 因此持续返回 401。为绕过 cookie 问题，当前版本又把一年期 JWT 放入 URL fragment，再写入 `sessionStorage` 作为 Bearer fallback；该方案能提高兼容性，但扩大了客户端令牌暴露面，且尚未完成真实浏览器成功登录验收。

此外，Pages Functions 的业务 API 缺少后端输入 schema 校验和速率限制；Dynamic QR 统计接口把最近 200 条记录的数量当作总扫描数；团队邀请只有 `pending` 写入，没有发现完整的“匹配邮箱后激活成员”流程；生产 Playwright 认证测试仍被环境变量跳过。这些问题会直接影响真实用户、数据准确性和安全审计结论。

## 二、风险分级总表

| 编号 | 严重度 | 问题 | 影响 | 建议状态 |
|---|---|---|---|---|
| A-01 | **阻塞** | 正式 Google OAuth 登录后的浏览器会话仍无法稳定建立，`team.list` 返回 401 | 团队协作、Dynamic QR 持久化和所有受保护功能不可用 | 必须优先修复并完成真实浏览器回归 |
| A-02 | **高** | OAuth 未实现 PKCE；当前只依赖 state + nonce | 增加授权码拦截/注入风险，尤其不适合把代码流程扩展到更多客户端 | 使用 S256 PKCE，并在 callback 校验 verifier |
| A-03 | **高** | 一年期 JWT 放在 URL fragment，再写入 `sessionStorage` Bearer fallback | 令牌进入浏览器历史、截图、扩展和客户端脚本可见范围；fragment 方案是临时绕过而非标准会话设计 | 优先恢复可靠的 HttpOnly cookie；fragment 仅作为短期诊断开关并缩短 TTL |
| A-04 | **高** | Pages Functions 直接使用 `input` 字段，没有统一后端 schema 校验 | 可提交超长名称、任意 role/status、无效邮箱或不符合业务约束的 destination；容易造成脏数据和异常 | 使用 Zod/Valibot 等共享 schema，所有 mutation 在服务端再次校验 |
| A-05 | **高** | Dynamic QR Pages 统计用最多 200 条明细的行数作为 `totalScans`，趋势为空数组 | 扫描超过 200 次后总数必然错误；生产图表无法反映真实趋势 | 使用 `COUNT(*)`、按日聚合和独立 recent limit 查询 |
| A-06 | **高** | 团队邀请只创建 `pending` 成员，未发现登录后按邮箱自动激活的完整流程 | “邀请成员”不能真正让收件人加入团队，用户验收会卡在 pending | 增加 invitation token/expiry、接受邀请、邮箱匹配和撤销流程 |
| A-07 | **高** | Dynamic QR 公开 redirect 先写 scan event，写入失败就不重定向 | D1 临时故障会使二维码目标不可访问，业务可用性被统计写入耦合 | 重定向主链路优先；scan 写入失败应降级、异步或至少返回目标并记录错误 |
| A-08 | **中高** | OAuth callback 未强制检查 Google `email_verified`，也未验证 ID token 的 issuer/audience/nonce | 仅依赖 userinfo access token，身份验证边界不够完整 | 使用 OIDC ID token 验证，检查 `iss`、`aud`、`exp`、`sub`、`email_verified` |
| A-09 | **中高** | OAuth、API 和公开 redirect 均未见速率限制、重放保护或滥用控制 | 可被反复触发 OAuth、扫描写入或错误请求，增加 D1/外部 API 成本 | 增加 Cloudflare Rate Limiting/Turnstile/短期 nonce 消费标记和基础 IP/slug 限流 |
| A-10 | **中** | `_redirects` 使用 `/* /index.html 200`，部署日志已报告可能的无限循环并忽略该规则 | 直接访问深层 SPA 路由可能依赖 Cloudflare 自动 fallback，行为不够可重复 | 依据 Pages Functions 路由明确配置 fallback，移除被 Pages 判定为循环的规则，并做深链回归 |
| A-11 | **中** | analytics script 使用 `%VITE_ANALYTICS_ENDPOINT%` 和 `%VITE_ANALYTICS_WEBSITE_ID%` 占位符；部署日志出现变量未注入警告 | 生产 HTML 可能加载无效脚本 URL，带来控制台噪音和不可用统计 | 构建时仅在两个变量都存在时输出脚本，否则不渲染 analytics 标签 |
| A-12 | **中** | 主 bundle 仍有约 586 kB gzip 前未压缩、DynamicQrPage 约 445 kB | 移动端首屏和缓存性能受影响 | 拆分 QR/条码引擎、图表和导出库，配置 manualChunks 并设置性能预算 |
| A-13 | **中** | `pnpm audit --prod` 报告 8 low、47 moderate、17 high、0 critical，共 567 个依赖 | 需要区分直接依赖和传递依赖，不能带着 high 风险直接交付 | 生成锁定版本审计清单，先处理生产路径上的 high，再评估 dev-only 项 |
| A-14 | **中** | 认证 Playwright、真实 Team Workspace 和真实 Dynamic QR analytics 测试仍被 `PLAYWRIGHT_STORAGE_STATE` 等条件跳过 | 正是当前生产 OAuth/session 回归未被自动发现的原因 | 建立专用测试账号/隔离数据，CI 中强制运行认证路径而非 skip |
| A-15 | **中** | server/Drizzle/MySQL 旧路径与 Cloudflare Functions/D1 新路径并存 | 后续维护者可能修错路径；number ID 与 string ID 契约存在漂移风险 | 明确 legacy 目录，删除未使用生产路径或加 README/CI 防止误用 |
| A-16 | **中** | `todo.md` 仍保留多条“已完成”但描述与当前真实状态不一致的历史项 | 交付状态不可审计，容易把“代码存在”误认为“生产已验收” | 将代码完成、部署完成、真实 UAT 完成拆成独立状态 |

## 三、详细审核证据

### 1. OAuth 与会话：当前生产阻塞项

`functions/api/oauth/callback.ts` 能完成 Google token exchange、userinfo 查询、D1 用户 upsert 和 JWT 签发；真实只读查询也确认 `users` 表存在，并且 `rguo3500@gmail.com` 的 `last_signed_in` 已更新。因此，问题不是 Google 凭据或 D1 migration 缺失，而是在 callback 完成后，当前浏览器没有稳定使用 session。

当前前端入口在 `client/src/const.ts` 中使用 `state`、nonce cookie、`returnTo` 和无 PKCE 的 authorization-code flow。为了绕过 cookie 丢失，callback 又把一年期 JWT 放入 `#oauth_session`，前端在启动前写入 `sessionStorage['manus-cookie']`，然后把它作为 `Authorization: Bearer` 发送。该方案解释了为什么页面可以避免白屏，但也意味着真实登录仍依赖 JavaScript、sessionStorage 和一个非标准的临时通道。

Google 官方文档描述的 server flow 包括生成并校验 anti-forgery state、交换 code、获取并验证身份信息；其文档也提示应谨慎处理认证实现并优先采用经过验证的库。[3] RFC 7636 说明 Authorization Code Grant 的 public client 存在 authorization-code interception 风险，并定义 PKCE verifier/challenge 作为缓解措施。[2] QRKit 当前 authorization request 没有 `code_challenge`，callback 也没有 `code_verifier`，因此 A-02 应列为高优先级安全修复。

**建议的正式方案**是：用单一、可验证的 HttpOnly、Secure、SameSite=Lax cookie 作为唯一浏览器会话；callback 只返回同源 302，不在 URL fragment 传 JWT；使用短期、一次性 server-side OAuth transaction 保存 state、returnTo、PKCE verifier 和 nonce；callback 消费 transaction 后再签发短期 access session + 可轮换 refresh session。若暂时无法引入 transaction store，至少应将 PKCE verifier 加密签入 state，并确保 state 一次性消费。

### 2. Pages Functions API 与输入/权限边界

`functions/api/trpc/[[trpc]].ts` 的 SQL 参数大多使用绑定变量，动态 update 字段来自固定白名单，因此未观察到典型 SQL 注入路径；Team 查询也以当前用户和 team membership 为边界，这是当前实现的优点。

但 Functions 路由没有像旧 server/routers.ts 那样使用统一 schema。`team.create` 直接使用 `input.name`；`team.invite` 直接接受 `input.email` 和 `input.role`；`team.updateRole` 可把任意 `input.role` 写入数据库；Dynamic QR create/update 直接接受 destination、label、slug。数据库 CHECK 约束只能覆盖少数枚举，无法替代长度、邮箱、URL 协议、slug 和字段存在性校验。建议把共享输入 schema 放在 `shared/`，在 Functions 与前端 tRPC 类型之间复用，并对所有未知字段、空对象、错误 JSON 和 HTTP method 做明确响应。

当前 team invite API 仅插入 `status='pending'` 的记录，代码搜索未发现 pending-to-active 的接受流程。数据库结构支持 `user_id` 为空，但没有 invitation token、过期时间、接受接口或登录后按 email 激活机制。因此“邀请成员”目前更接近写入一条待处理记录，而不是完整协作流程。

### 3. Dynamic QR 与统计准确性

正式 Pages route `functions/r/[id].ts` 按 `dynamic_links.id` 查找目标，校验目标必须以 `http://` 或 `https://` 开头，并限制 user-agent/referrer 长度；这是正确的基本安全边界。独立 `worker/redirect.ts` 则按 slug 查找，说明 Pages Functions 与独立 Worker 存在两套不同的公开链接契约。前端 `dynamicRedirectUrl` 接受字符串 id，当前 production 部署必须明确只保留一条真实入口并为另一条加 deprecated 说明，否则 smoke test 容易测错路径。

Pages redirect 在写入 scan event 失败时不会执行 `Response.redirect`，这会让统计存储故障直接变成二维码不可用。建议把 redirect 当作关键路径，把 event 写入设计成容错的旁路；至少应在 catch 中记录可观测错误并仍返回目标。

Functions 的 `dynamicQr.stats` 查询最近 200 条明细，然后返回 `totalScans: rows.results.length` 和空 `trend`。这不是准确总数，也不满足页面已有的按日趋势产品承诺。统计 API 应拆成一个 `COUNT(*)`、一个按 UTC 日期聚合、一个最近 N 条明细查询，并明确时区策略。

### 4. SEO、前端体验与部署配置

正式 `robots.txt` 和 `sitemap.xml` 均可访问，sitemap 链接使用正式域名，未观察到旧 Pages 域名。页面级 `RouteSeo` 会在 React `useEffect` 中写入 title、description、canonical、Open Graph、Twitter Card 和 JSON-LD，这对浏览器运行后的体验有效；但它不是服务端渲染，首屏 HTML 本身只有通用 title/description。对需要稳定搜索摘要和社交分享的公开工具页，建议增加预渲染/静态生成，或至少确保关键正文、canonical 和社交 metadata 在构建时可被 crawler 看到。

`client/public/_redirects` 仅有 `/* /index.html 200`。Cloudflare 官方文档明确说明 `_redirects` 不作用于匹配 Pages Functions 的请求，并规定该文件的语法与限制。[1] 项目部署日志同时报告该规则可能形成无限循环并被忽略，因此应删除循环规则，针对 SPA 深链做实际 HTTP 回归，而不是把这条规则当成已验证的 fallback。

`client/index.html` 无条件输出 `%VITE_ANALYTICS_ENDPOINT%/umami`。正式构建日志报告 analytics 变量未注入警告；生产应采用条件模板或构建插件，避免产生无效 script URL。

### 5. 测试与交付可信度

当前全量自动化结果很好地说明“本地代码可以编译和通过现有单元/集成测试”，但不能证明生产认证可用。Playwright 中认证 Dynamic QR analytics 测试要求 `PLAYWRIGHT_STORAGE_STATE`，没有状态时直接 skip；Worker 测试要求 `PLAYWRIGHT_WORKER_URL`；Team 测试只断言页面标题和两个区域可见，并不创建团队、邀请成员、修改角色、共享链接或验证登录 session。`todo.md` 也明确把真实 Team UAT 和有效 storage state 留为未完成。

因此，当前 54 项通过应在发布说明中标为“代码级验证”，不能写成“生产级团队协作已验证”。下一轮应建立隔离测试账号、一次性测试数据清理、OAuth callback 断言、Team create/invite/accept/share/unshare/updateRole 全链路和 Dynamic QR scan/statistics 真实回归。

## 四、建议修复顺序

| 顺序 | 工作包 | 验收标准 |
|---|---|---|
| 1 | 重做 OAuth session：PKCE、一次性 state transaction、HttpOnly cookie、OIDC claims 校验 | 在新浏览器上下文中完成登录，刷新页面后 `auth.me` 与 `team.list` 仍为 200；URL 不含 JWT |
| 2 | Functions 输入 schema 与速率限制 | 非法 role、空 name、无效 email、非 HTTPS destination、超长字段均返回稳定 4xx；重复 OAuth/redirect 请求受限 |
| 3 | 修正 Dynamic QR 统计与 redirect 降级 | 生成超过 200 条事件后 totalScans 准确；按日趋势非空；D1 写入失败时目标仍可访问 |
| 4 | 完成团队邀请生命周期 | owner 邀请后，匹配邮箱用户可接受邀请并变为 active；viewer/editor/owner 权限在真实 DB 中验证 |
| 5 | 清理 Pages fallback、analytics 和 bundle 性能问题 | 深链直接打开 200；无 analytics 变量时不输出无效 script；首屏 chunk 达到预算 |
| 6 | 建立不可跳过的生产 E2E | CI 具备独立 Google 测试账号/状态，认证 Team 和 Dynamic QR 流程不再因环境变量缺失而静默 skip |

## 五、审核结论

**当前建议：继续保留为预发布/受限验收环境，不建议把“团队协作已生产完成”作为对外承诺。** 静态 QR/条码生成与公开内容页面可以继续运营；Dynamic QR 和团队协作应在修复 A-01、A-05、A-06 并完成真实认证 E2E 后再宣布完成。最重要的下一步不是继续添加 UI，而是把 OAuth session 设计收敛为单一、标准、可观察且可测试的会话路径。

## References

[1]: https://developers.cloudflare.com/pages/configuration/redirects/ "Cloudflare Pages Redirects"
[2]: https://datatracker.ietf.org/doc/html/rfc7636 "RFC 7636: Proof Key for Code Exchange by OAuth Public Clients"
[3]: https://developers.google.com/identity/openid-connect/openid-connect "Google OpenID Connect"
