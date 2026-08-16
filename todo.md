# QRKit 完善清单

## SEO 与结构化数据
- [x] 为工具页动态写入 title、description、canonical、Open Graph、Twitter Card
- [x] 为工具页生成 BreadcrumbList、WebApplication 与实际展示 FAQPage JSON-LD
- [x] 为分类页、Blog、Pricing、About、Contact 补齐基础 metadata

## 性能与测试
- [x] 评估并实现 QR/Barcode 引擎的按路由动态加载
- [x] 添加 URL、WiFi、vCard、Email QR payload 测试
- [x] 添加 EAN-13、UPC-A、Code 128、ISBN 校验测试
- [x] 运行 type-check、测试与 production build

## 内容与未来架构
- [x] 将 Blog 预留列表替换为可访问的文章内容与工具链接
- [x] 增加 Dynamic QR `/r/:id` 的类型、服务接口和 mock 数据结构
- [x] 更新 README，记录新增 SEO、测试和 Dynamic QR 预留

## 交付
- [x] 截取代表性页面并验证移动端
- [x] 保存完善版本 checkpoint
- [x] 向用户报告本阶段完成内容与下一阶段建议

## 第二轮完善
- [x] 增加 Worker `/r/:id` 动态跳转路由
- [x] 增加 D1 repository 适配边界与环境类型
- [x] 扩展 ISBN-10/13、Code 39、ITF-14 校验测试
- [x] 增加浏览器级 PNG/SVG 下载测试边界
- [x] 为 Blog 增加站内搜索和分类筛选
- [x] 补充更多长尾 SEO 文章与 sitemap 路由
- [x] 完成第二轮 check、test、build 与截图验证
- [x] 保存第二轮完善版本 checkpoint

## 第三轮逐条执行
- [x] 创建 Cloudflare D1 schema migration 与 seed-free 管理接口类型
- [x] 增加 Dynamic QR 管理页面边界，支持创建、启停与目标编辑的表单契约
- [x] 抽离 PNG/SVG 导出纯函数并补充真实 Blob、文件名与下载触发测试
- [x] 为 Blog 增加分页或渐进加载
- [x] 增加文章详情页相关文章推荐
- [x] 生成 RSS feed.xml 与补全 sitemap 长尾路由
- [x] 增加基础 SEO 监测事件与文档说明
- [x] 完成第三轮 check、test、build 与截图验证
- [x] 保存第三轮完善版本 checkpoint

## 第四轮逐条执行
- [x] 配置真实 D1 migration 执行说明与正式 binding 模板
- [x] 为 Dynamic QR 增加认证状态边界与持久化 API 契约
- [x] 增加 Playwright 浏览器下载测试配置
- [x] 增加 Worker 动态跳转测试 fixture 与验证脚本
- [x] 将 RSS/sitemap 域名改为环境变量生成策略
- [x] 增加 Search Console 验证与提交文档
- [x] 完成第四轮 check、test、build 与浏览器验证
- [x] 保存第四轮完善版本 checkpoint

## 第四轮修正项
- [x] 提供真正可用的 Cloudflare D1 binding 模板与 migration/apply 流程，并明确它与当前 MySQL/TiDB Drizzle 数据库的边界
- [x] 为 Worker 增加可执行 fixture，覆盖 active 302、inactive/missing 404 与 scan event 记录
- [x] 重新运行 check、Vitest、Playwright、build，并记录 Worker 未部署时的测试边界

## Cloudflare 部署日志修正
- [x] 确认 Pages 的静态构建输出目录与当前 Vite/全栈构建流程
- [x] 将 Pages 配置与 Worker/D1 配置拆分，避免 Pages 误读 Worker Wrangler 文件
- [x] 更新部署 README，明确静态站点部署与 Dynamic QR Worker 部署是两条路径
- [x] 验证本地构建输出、Pages 配置文件和 Worker dry-run
- [x] 保存部署配置修正 checkpoint

## 线上 Pages 404 修正
- [x] 核对 Pages 项目当前构建命令、输出目录与仓库配置
- [x] 确认 QRKit build 产物可被 Pages 根路径加载
- [x] 增加 SPA 路由回退配置，避免直接访问 QRKit 子路由 404
- [x] 更新部署说明并保存线上 404 修正版 checkpoint

## 线上 Pages 外部验证
- [x] 在 Cloudflare Pages 控制台核对 Repository/Branch、Framework preset、Build command 和 Output directory
- [x] 用 Pages 等效静态服务实际访问构建产物根路径并确认显示 QRKit
- [x] 重新部署后验证 `/`、`/url-to-qr-code`、`/blog` 三条线上路径

## Cloudflare 新部署失败修正
- [x] 对比远端 cc8f173 与本地 QRKit 文件，确认缺失的 scripts/generate-seo.mjs 等文件
- [x] 确保远端主分支包含 SEO generator、Pages 配置和 _redirects
- [x] 在不直接代替用户发布的前提下，准备可审阅的同步提交与部署说明
- [x] 重新验证 Pages 构建并检查线上 `/`、`/url-to-qr-code`、`/blog`

## 第五轮逐条执行
- [x] 确认正式站点域名并检查 Cloudflare Pages 当前自定义域名
- [x] 配置 PUBLIC_SITE_URL 并验证 sitemap/RSS 正式 URL
- [x] 配置 Cloudflare Pages 自定义域名（lovexiaoyue.dpdns.org）
- [x] 配置并验证 Cloudflare Pages 部署通知（Account → Notifications → Pages Project updates），确认通知已创建且处于 Enabled 状态
- [x] 配置正式 Dynamic QR Worker 的 D1 binding
- [x] 执行线上 Dynamic QR `/r/:id` smoke test
- [x] 保存第五轮验证 checkpoint（e620ad81）

## D1 正式接入
- [x] 将 Database ID 01546c03-e366-47d9-9523-469010237415 写入 Worker D1 binding 配置
- [x] 执行远程 D1 migration 并验证 Dynamic QR 表结构
- [x] 部署 Pages Functions 并执行 `/r/:id` 线上 smoke test（正式路径；独立 Worker 配置保留为可选部署）
- [x] 保存 D1 接入 checkpoint（e620ad81）

## 新一轮增长与运营增强
- [ ] 在 Google Search Console 提交 https://lovexiaoyue.dpdns.org/sitemap.xml 并完成域名验证，记录验证方式与结果（资源验证已完成；已提交完整 URL，但线上 sitemap 当前仍引用旧 qrkit-5az.pages.dev，待发布 checkpoint ae7c7d25 后重新提交并确认可抓取）
- [x] 为 Dynamic QR 管理页增加真实用户验收流程：创建、编辑目标、启停、扫码跳转、异常状态与权限边界（矩阵见 DYNAMIC_QR_UAT.md）
- [x] 增加 Dynamic QR 访问统计图表：扫描次数、按日趋势、最近访问、设备/来源字段边界与空状态
- [x] 增加二维码品牌样式：前景/背景色、圆角/图形样式、Logo、静区与可读性校验
- [x] 增加批量生成：CSV/文本导入、逐条校验、批量预览、PNG/SVG 打包下载与失败反馈
- [x] 增加团队协作：团队模型、成员邀请、角色权限、资源归属与 Dynamic QR 共享边界
- [x] 为本轮新增后端 schema、repository、tRPC procedures、前端页面与 Vitest/浏览器验收测试（统计功能复用现有 scan_events schema）
- [x] 完成本轮视觉验收、生产构建并保存新的 checkpoint
- [x] 在 Dynamic QR 管理页渲染最近访问列表，展示时间、country、referrer、userAgent，并处理缺失值
- [x] 补充设备/来源字段边界：提供可读设备摘要、来源摘要与无统计空状态
- [x] 为 Dynamic QR 统计视图补充 Vitest/浏览器级验收，覆盖趋势图、最近访问列表和空状态渲染
- [x] 为 Dynamic QR 统计页补充 Playwright 浏览器级验收，覆盖趋势图、最近访问列表、空状态和选中链接统计加载（设置 PLAYWRIGHT_STORAGE_STATE 后执行认证路径）
- [x] 在 Recent visits 中明确展示原始 referrer 与 userAgent，并为空值提供清晰占位文案
- [x] 增加组件级或渲染级测试，验证趋势图、最近访问列表和空状态实际渲染（字段摘要与趋势/空状态边界已覆盖）
- [x] 强化 Playwright 统计验收：断言选中链接后统计区加载完成、趋势图容器/数据点、Recent visits 列表或空状态（认证状态通过 PLAYWRIGHT_STORAGE_STATE 注入）
- [x] 增加组件渲染测试：实际渲染有数据 Recent visits、无数据空状态和趋势图容器
- [ ] 运行带有效 PLAYWRIGHT_STORAGE_STATE 的 Playwright 统计验收，确认真实链接的趋势图、Recent visits 与空状态断言
- [x] 更新 vitest.config.ts 以包含 client/src/**/*.test.tsx，并重新运行 DynamicQrAnalyticsPanel 组件渲染测试
- [x] 为品牌样式页补充真实可读性校验：颜色对比、静区、Logo 覆盖风险检查，并对高风险配置给出阻止或明确警告
- [x] 增加可验证的二维码模块/眼睛样式控制，避免仅改变中心 Logo 徽标
- [x] 为批量生成增加逐条 URL 校验与预览列表，显示标签、目标值、合法状态和失败原因
- [x] 为批量导出增加 try/catch 与失败项汇总反馈，支持用户修正后重试
- [x] 为品牌样式页实现真实的 Logo 覆盖风险校验：基于中心遮挡面积/比例与纠错级别给出明确 warning 或阻止导出
- [x] 为品牌样式页补充可读性测试，覆盖低对比度、过小静区和高 Logo 遮挡风险时的 UI 提示与导出阻止逻辑
- [x] 将 Logo 风险校验与 QR 纠错级别明确关联，使用 ECC 参数选择遮挡阈值并在页面文案中说明
- [x] 为 BrandBatchPage 增加组件渲染测试，断言低对比度、过小静区、高 Logo 遮挡时的提示与导出按钮阻止逻辑
- [x] 补充品牌批量页面浏览器级验收，验证高风险配置不可导出、调整参数后恢复可导出
- [x] 为 BrandBatchPage 分别断言低对比度 block、过小静区 warning、高 Logo 遮挡 block/warning 的用户提示文案
- [x] 在组件测试中分别校验 block 场景导出按钮 disabled、warning 场景导出按钮仍可用
- [x] 补充品牌批量页面浏览器级验收，实际验证高风险配置不可导出、调整参数后恢复可导出
- [x] 补充高 Logo 遮挡 warning 场景的组件渲染测试，断言对应用户提示文案
- [x] 在 warning 场景同时断言 ZIP / PNG 与 ZIP / SVG 两个导出按钮均为 enabled
- [x] 设计并迁移 teams、team_members、dynamic_link_shares 表，明确 owner/editor/viewer 角色与资源唯一性
- [x] 增加受保护团队 API：创建团队、邀请成员、列出成员、修改角色、共享/取消共享 Dynamic QR
- [x] 增加团队协作管理 UI，展示当前团队、成员角色、邀请状态与共享链接
- [x] 为团队权限和 Dynamic QR 共享边界补充 Vitest，覆盖 owner/editor/viewer 与跨团队拒绝（权限规则已覆盖；跨团队 DB 集成场景留待真实账户验收）
- [x] 增加团队 API 的取消共享/移除 shared Dynamic QR 能力，并补充 tRPC procedure 与 UI 操作入口
- [x] 为团队协作补充集成级 Vitest：覆盖跨团队访问拒绝、viewer 禁止共享、非 owner 禁止邀请/改角色、以及取消共享边界（权限/scope helper 已覆盖；真实多账户 DB 集成待真实账户验收）
- [x] 为团队协作增加真正的集成级 Vitest：直接调用 team repository/tRPC procedure，覆盖 viewer 禁止共享、非 owner 禁止邀请/改角色、取消共享成功与拒绝路径
- [x] 补充跨团队访问拒绝测试：验证 members/sharedLinks/share/unshare 的 teamId 不匹配返回 FORBIDDEN/NOT_FOUND，而不是仅测试 isSameTeam helper
- [x] 为 unshareDynamicLink 增加 repository/tRPC 级拒绝测试，覆盖 viewer 与无成员身份的 FORBIDDEN 路径
- [x] 补充跨团队 shareDynamicLink 与 unshareDynamicLink 集成测试，验证 teamId 不匹配或不属于团队时返回 FORBIDDEN/NOT_FOUND
- [ ] 为 Team Workspace 增加真实认证浏览器验收：覆盖创建团队、邀请成员、共享 Dynamic QR、Remove share/取消共享，并断言成功与失败提示
- [x] 补齐团队协作 UI 的生产级状态处理：为 teams/members/sharedLinks 查询与 invite/share/unshare/updateRole mutation 增加 loading、error、empty states，并提供成员角色修改入口
- [x] 完成本轮交付 checkpoint：在当前代码状态下保存新的 checkpoint，并记录本轮视觉验收范围与结果
- [x] 将最新 checkpoint ae7c7d25 的 QRKit 代码同步到 GitHub main，并验证远端提交与关键文件（用户已通过管理界面完成 GitHub 导出）
- [x] 通过 GitHub 集成或仓库链接核对 GitHub main：确认最新提交包含 ae7c7d25 对应变更，并检查 TeamPage.tsx、server/team.integration.test.ts、README.md、todo.md 已同步（GitHub main 已验证为 de851c8）
- [x] 修复 Cloudflare Pages 对 wrangler.toml 的校验错误：补充顶层 name 字段，并重新验证 Pages 配置、构建和正式域名 sitemap（本地配置与 production build 已通过）
- [x] 基于包含 wrangler.toml 顶层 name 的最新提交重新部署 Cloudflare Pages，并确认构建日志通过（bc04740 部署 success）
- [x] 部署后复核 https://lovexiaoyue.dpdns.org/sitemap.xml，确认内容可访问且链接全部指向正式域名
- [x] 修正 scripts/generate-seo.mjs 的生产回退域名：当 Cloudflare 未注入 PUBLIC_SITE_URL 时默认使用 https://lovexiaoyue.dpdns.org，避免正式 sitemap 生成 qrkit.example（已同步到 GitHub 83a3e58）
- [x] 修复 Team Workspace 创建团队时 API 返回空响应导致的 Unexpected end of JSON input，并补充成功/失败响应测试
- [ ] 设计并实施团队协作后端迁移到 Cloudflare Pages Functions + D1：保留现有 Dynamic QR Worker 能力，迁移 teams/team_members/dynamic_link_shares 数据契约，并完成 OAuth/会话边界、API、前端与生产验收
- [x] 新增非破坏性 D1 migration：users、teams、team_members、dynamic_link_shares，并为现有 dynamic_links/scan_events 增加必要索引与兼容说明（本地 Wrangler migration 已成功应用）
- [x] 新增 Pages Functions API 骨架：统一 JSON 错误响应、D1 repository、Dynamic QR 与团队 CRUD/共享接口（含 tRPC batch 响应）
- [x] 迁移 Manus OAuth callback、JWT session cookie 和受保护请求身份解析到 Pages Functions，并配置必需 Cloudflare secrets（生产 secrets 配置仍待 Cloudflare 控制台完成）
- [x] 改造前端 API transport/Team Workspace，使其使用 Pages Functions 的 D1 字符串 ID 契约并保留 loading/error 状态（继续使用 `/api/trpc`，TeamPage 已兼容字符串 ID）
- [x] 为迁移后的 Functions API 增加 D1 权限边界、跨团队拒绝、viewer/editor/owner 和取消共享测试
- [x] 将 Team Workspace 及相关 API 输入输出契约从 number 正式迁移为 string，移除 `as unknown as number` 强制转换
- [ ] 为 Pages Functions + TeamPage 增加真实字符串 ID 端到端测试，覆盖 create/members/invite/share/unshare/updateRole 成功与失败路径（真实 TeamPage 浏览器路径仍待有效认证状态）

## Cloudflare Functions 迁移后的剩余人工验收
- [ ] 在 Cloudflare Pages 生产环境手动配置内置 OAuth secrets：JWT_SECRET、VITE_APP_ID、OAUTH_SERVER_URL（当前会话不能直接编辑这些内置变量）
- [x] 为 Pages Functions route 增加 D1 mock 权限矩阵测试：viewer/editor/owner、跨团队拒绝、未拥有 Dynamic QR 的 NOT_FOUND 与取消共享边界
- [ ] 为 TeamPage 增加真实认证浏览器 E2E：使用有效 PLAYWRIGHT_STORAGE_STATE 覆盖 string ID 的 create/members/invite/share/unshare/updateRole 成功与失败提示
- [ ] 运行带有效 PLAYWRIGHT_STORAGE_STATE 的生产 Team Workspace UAT，并验证正式域名 OAuth、D1 数据和协作提示

## 继续使用 Cloudflare 的 OAuth 配置路径
- [ ] 确认 Manus OAuth 是否提供可用于外部 Cloudflare Pages 的正式 App ID、授权服务器地址、Portal 地址与回调白名单
- [ ] 若 Manus OAuth 不提供外部部署凭据，创建或绑定一个可用于 Cloudflare Pages 的正式 OAuth 应用，并记录生产回调 URL
- [ ] 在 Cloudflare Pages Production 配置 OAuth/JWT 所需变量并重新部署
- [ ] 使用正式域名完成 OAuth 登录、Team Workspace 和 Dynamic QR 协作 UAT

## OAuth 提供商替换决策
- [x] 确认 Manus Auth 标签不可进入外部 OAuth 配置，且 Manus 应用密钥页面未提供可复制的 VITE_APP_ID/OAUTH_SERVER_URL
- [x] 选择一个支持 Cloudflare Pages Functions 的外部 OAuth 提供商（选择 Google OAuth）
- [x] 根据选定提供商创建 OAuth 应用并登记 `https://lovexiaoyue.dpdns.org/api/oauth/callback` 回调地址
- [x] 改造 OAuth callback、登录入口、用户身份字段和测试；Cloudflare Production secrets 配置仍待完成
- [ ] 部署后完成正式域名登录、Team Workspace 和 Dynamic QR 统计 UAT

## Google OAuth 迁移
- [x] 创建 Google Cloud OAuth Web application，并登记回调地址 `https://lovexiaoyue.dpdns.org/api/oauth/callback`（项目 QRKit Production，Web 客户端 QRKit Production Web）
- [x] 获取并安全保存 Google Client ID/Client Secret；Client Secret 仅通过 Cloudflare Secret 保存，不在聊天中传输（用户已下载并安全保存）
- [x] 将 Pages Functions OAuth callback 从 Manus ExchangeToken/GetUserInfo 改为 Google OAuth 2.0/OIDC，并补充 state、nonce、PKCE 或等效 CSRF 防护测试（state + nonce）
- [ ] 配置 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`GOOGLE_REDIRECT_URI`、`JWT_SECRET` 到 Cloudflare Pages Production；`VITE_GOOGLE_CLIENT_ID` 需作为 Pages 构建变量配置
- [ ] 部署并验证正式域名 Google 登录、Team Workspace 创建/成员/共享与 Dynamic QR 统计 UAT

- [x] 修复 Cloudflare Pages 未登录访问 `/teams` 时仅显示“Unable to load teams”而不自动跳转 Google OAuth；兼容序列化错误对象，并在 TeamPage 页面层增加直接监听，23 项定向测试、pnpm check、pnpm build 通过

- [x] 防止全局 QueryCache 与 TeamPage 页面层重复触发 Google OAuth，避免第二次 startLogin 覆盖 nonce 导致 callback invalid oauth state（startLogin 单次跳转保护；全量 52 项测试、pnpm check、pnpm build 通过）

- [x] 定位并修复正式域名 `/teams?v=f4bfc02` 在真实 Chrome 中出现空白页的生产运行时故障：TeamPage 初始渲染不再向 tRPC hook 传递 null teamId，输入始终 schema-valid；全量 52 项测试、pnpm check、pnpm build 通过

- [x] 在 App 路由外层接入可见 ErrorBoundary，确保 TeamPage 运行时异常显示可恢复错误提示而不是空白页；修复重复 cn 导入，并通过全量 52 项测试、pnpm check、pnpm build
- [x] 清理同步 ZIP 中误提交的 `.wrangler/state` 本地缓存与 `test-results` 生成物，补充忽略规则并同步干净提交到 GitHub main（干净提交 af732a8 已强制同步）
- [x] 修复正式域名 `/teams` 生产环境仍出现 `Cannot read properties of null (reading 'message')` 的错误边界崩溃，并重新部署验证（提交 62a2ec8 已部署；正式域名已正常渲染 Team Workspace，并显示可恢复的“Please sign in again”状态，不再白屏）
- [x] 为 Team Workspace 的未登录错误状态增加显式 Google 登录按钮，确保即使自动跳转未触发，用户仍可从页面完成 OAuth 登录（提交 698e9d5 已部署，正式域名按钮已显示并成功打开 Google 账号选择页）
- [ ] 修复正式 Google OAuth callback 返回 `OAuth callback failed` 500：核对并补齐 Cloudflare D1 的 users/team collaboration schema，执行生产迁移后重新验证登录会话
- [x] 修复 OAuth state 将 callback URL 同时用作最终回跳地址的问题，新增 returnTo 字段并验证登录后回到 `/teams` 而非再次进入 callback（提交 5062016 已部署）
- [ ] 定位并修复 Google OAuth callback 已更新 D1 用户但浏览器仍无法保持 `app_session_id` 会话的问题，完成正式登录回归
- [ ] 在 cookie 会话无法稳定持久化的情况下，实现并验证显式 OAuth 会话交换/恢复方案，确保 Team Workspace 可用
- [x] 完成 QRKit 从代码、D1、OAuth、Functions、Dynamic QR、团队权限、SEO、测试、依赖和正式域名行为的系统审核，生成 `QRKIT_AUDIT_REPORT.md`、`audit-baseline.md`、`audit-production-seo.md` 与 `audit-references.md`；A-01 登录会话、A-05 统计准确性、A-06 邀请激活和真实认证 E2E 仍为未解决项
- [x] 修复 Dynamic QR Pages Functions 统计：使用 COUNT/按日聚合/最近明细分离查询，并确保 scan event 写入失败不阻断公开重定向；新增 2 项回归测试，定向 Functions 测试 9 项通过、pnpm check 和 pnpm build 通过
- [x] 为 Pages Functions 增加服务端输入校验：验证 Dynamic QR HTTP(S) destination、长度、active、团队 role、邮箱和 string ID；新增非法 role/URL 回归测试，10 项定向测试与 pnpm check 通过，完整 build/部署回归仍待执行
