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
- [ ] 保存完善版本 checkpoint
- [ ] 向用户报告本阶段完成内容与下一阶段建议

## 第二轮完善
- [x] 增加 Worker `/r/:id` 动态跳转路由
- [x] 增加 D1 repository 适配边界与环境类型
- [x] 扩展 ISBN-10/13、Code 39、ITF-14 校验测试
- [x] 增加浏览器级 PNG/SVG 下载测试边界
- [x] 为 Blog 增加站内搜索和分类筛选
- [x] 补充更多长尾 SEO 文章与 sitemap 路由
- [x] 完成第二轮 check、test、build 与截图验证
- [ ] 保存第二轮完善版本 checkpoint

## 第三轮逐条执行
- [x] 创建 Cloudflare D1 schema migration 与 seed-free 管理接口类型
- [x] 增加 Dynamic QR 管理页面边界，支持创建、启停与目标编辑的表单契约
- [x] 抽离 PNG/SVG 导出纯函数并补充真实 Blob、文件名与下载触发测试
- [x] 为 Blog 增加分页或渐进加载
- [x] 增加文章详情页相关文章推荐
- [x] 生成 RSS feed.xml 与补全 sitemap 长尾路由
- [x] 增加基础 SEO 监测事件与文档说明
- [x] 完成第三轮 check、test、build 与截图验证
- [ ] 保存第三轮完善版本 checkpoint

## 第四轮逐条执行
- [x] 配置真实 D1 migration 执行说明与正式 binding 模板
- [x] 为 Dynamic QR 增加认证状态边界与持久化 API 契约
- [x] 增加 Playwright 浏览器下载测试配置
- [x] 增加 Worker 动态跳转测试 fixture 与验证脚本
- [x] 将 RSS/sitemap 域名改为环境变量生成策略
- [x] 增加 Search Console 验证与提交文档
- [x] 完成第四轮 check、test、build 与浏览器验证
- [ ] 保存第四轮完善版本 checkpoint

## 第四轮修正项
- [x] 提供真正可用的 Cloudflare D1 binding 模板与 migration/apply 流程，并明确它与当前 MySQL/TiDB Drizzle 数据库的边界
- [x] 为 Worker 增加可执行 fixture，覆盖 active 302、inactive/missing 404 与 scan event 记录
- [x] 重新运行 check、Vitest、Playwright、build，并记录 Worker 未部署时的测试边界
