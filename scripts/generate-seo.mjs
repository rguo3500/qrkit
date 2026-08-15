import { readFile, writeFile } from "node:fs/promises";

const siteUrl = (process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL || "https://lovexiaoyue.dpdns.org").replace(/\/$/, "");
const sourceOrigins = ["https://qrkit.example", "https://qrkit-5az.pages.dev", "https://lovexiaoyue.dpdns.org"];

for (const file of ["client/public/feed.xml", "client/public/sitemap.xml"]) {
  const source = await readFile(file, "utf8");
  const replaced = sourceOrigins.reduce((content, origin) => content.replaceAll(origin, siteUrl), source);
  await writeFile(file, replaced);
}

console.log(`[SEO] Generated feed.xml and sitemap.xml for ${siteUrl}`);
