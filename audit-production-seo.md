# Production SEO Audit Evidence

正式 `https://lovexiaoyue.dpdns.org/robots.txt` 可访问，并指向 `/sitemap.xml`；Cloudflare 自动插入了 Content-Signal 规则，允许 search/reference、禁止若干 AI crawler。项目自己的规则允许 `/`，屏蔽 `/admin`、`/api`、`/test`。

正式 `https://lovexiaoyue.dpdns.org/sitemap.xml` 返回有效的 sitemap XML，当前列出的 URL 均使用正式域名 `lovexiaoyue.dpdns.org`，未观察到旧 Pages 域名。sitemap 覆盖首页、QR/条码工具、Dynamic QR、博客、隐私和条款页面，但不包含 `/teams`，这对需要登录的工作区通常是合理的；仍需在审核报告中检查 HTML canonical、Open Graph、页面可抓取内容以及 Cloudflare 注入的 robots 信号是否符合增长目标。
