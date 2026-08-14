import { readFile, writeFile } from 'node:fs/promises';

const siteUrl=(process.env.PUBLIC_SITE_URL||process.env.VITE_SITE_URL||'https://qrkit.example').replace(/\/$/,'');
for(const file of ['client/public/feed.xml','client/public/sitemap.xml']){const source=await readFile(file,'utf8');await writeFile(file,source.replaceAll('https://qrkit.example',siteUrl));}
console.log(`[SEO] Generated feed.xml and sitemap.xml for ${siteUrl}`);
