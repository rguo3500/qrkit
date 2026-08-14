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
