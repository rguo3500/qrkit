# QRKit Search Console checklist

QRKit generates absolute RSS and sitemap URLs from `PUBLIC_SITE_URL` at build time. Set it to the production origin without a trailing slash before building, for example `PUBLIC_SITE_URL=https://qrkit.example pnpm run build`. The default placeholder is retained only for local previews.

In Google Search Console, add the production domain as a Domain property when DNS access is available, or add the exact URL-prefix property when verification is managed at the site level. Complete the provided DNS, HTML, or analytics verification step in the hosting control panel, then submit `https://YOUR_DOMAIN/sitemap.xml`. The RSS endpoint is available at `https://YOUR_DOMAIN/feed.xml` for feed readers and secondary discovery.

After publishing, inspect the URL Inspection report for the homepage, `/qr-codes`, `/barcodes`, `/blog`, and at least three long-tail articles. Confirm that canonical URLs resolve to the production origin, the sitemap contains the same origin, and the Worker redirect route is excluded from indexing when it is used only as a Dynamic QR destination. Review `seo_route_view` and `code_export` events in the configured analytics dashboard; these events intentionally exclude QR payload values.

## QRKit 正式提交状态（2026-08-14）

正式 sitemap 地址为 `https://lovexiaoyue.dpdns.org/sitemap.xml`，正式站点域名为 `lovexiaoyue.dpdns.org`。推荐在 Google Search Console 中创建 **Domain property** `lovexiaoyue.dpdns.org`，完成 DNS TXT 验证后，在该属性的“站点地图”页面提交上述 sitemap；随后检查 sitemap 状态为“成功”，并使用网址检查工具检查首页与主要工具页。

本轮已确认 Search Console 登录入口和当前账号为 `rguo3500@gmail.com`，但当前浏览器会话跳转至 Google 登录页，无法代替用户输入登录凭据或验证码。因此本项保持待完成，不能把 sitemap 提交或域名验证记录为已成功。用户完成登录后，可从 Search Console 属性切换器添加正式域名，或直接打开 Search Console 的添加资源页面继续操作。
