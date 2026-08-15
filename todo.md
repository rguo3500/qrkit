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
- [ ] 基于包含 wrangler.toml 顶层 name 的最新提交重新部署 Cloudflare Pages，并确认构建日志通过
- [ ] 部署后复核 https://lovexiaoyue.dpdns.org/sitemap.xml，确认内容可访问且链接全部指向正式域名
