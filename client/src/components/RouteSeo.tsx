/* QRKit Signal Paper: SEO metadata mirrors the visible editorial content and never emits FAQ schema for undisplayed questions. */
import { useEffect } from 'react';
import type { ToolConfig } from '../lib/tools';
import { trackSeoRoute } from '../lib/seoAnalytics';

type FaqItem = { question:string; answer:string };
type RouteSeoProps = { title:string; description:string; path:string; type?:'website'|'article'; breadcrumbs?:{name:string;path:string}[]; tool?:ToolConfig; faq?:FaqItem[]; };

function upsertMeta(attribute:'name'|'property', key:string, content:string){let el=document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.setAttribute(attribute,key);document.head.appendChild(el)}el.content=content}
function upsertLink(rel:string, href:string){let el=document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement|null;if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el)}el.href=href}
function upsertJsonLd(id:string,data:unknown){let el=document.head.querySelector(`script[data-qrkit-schema="${id}"]`) as HTMLScriptElement|null;if(!el){el=document.createElement('script');el.type='application/ld+json';el.dataset.qrkitSchema=id;document.head.appendChild(el)}el.textContent=JSON.stringify(data)}

export default function RouteSeo({title,description,path,type='website',breadcrumbs=[],tool,faq=[]}:RouteSeoProps){useEffect(()=>{const origin=window.location.origin;const canonical=new URL(path,origin).toString();document.title=title;upsertMeta('name','description',description);upsertMeta('property','og:title',title);upsertMeta('property','og:description',description);upsertMeta('property','og:type',type);upsertMeta('property','og:url',canonical);upsertMeta('property','og:site_name','QRKit');upsertMeta('name','twitter:card','summary');upsertMeta('name','twitter:title',title);upsertMeta('name','twitter:description',description);upsertLink('canonical',canonical);
 const graph=[{ '@context':'https://schema.org','@type':'WebSite','name':'QRKit','url':origin,'description':'Free QR code and barcode tools with browser-local generation.' }];
 if(tool)graph.push({'@context':'https://schema.org','@type':'WebApplication','name':tool.name,'url':canonical,'applicationCategory':tool.kind==='qr'?'UtilitiesApplication':'BusinessApplication','operatingSystem':'Any','description':description,'offers':{'@type':'Offer','price':'0','priceCurrency':'USD'}} as never);
 if(breadcrumbs.length)graph.push({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':breadcrumbs.map((b,i)=>({'@type':'ListItem','position':i+1,'name':b.name,'item':new URL(b.path,origin).toString()}))} as never);
 if(faq.length)graph.push({'@context':'https://schema.org','@type':'FAQPage','mainEntity':faq.map(item=>({'@type':'Question','name':item.question,'acceptedAnswer':{'@type':'Answer','text':item.answer}}))} as never);
 upsertJsonLd('route',graph);trackSeoRoute(path,title); return()=>{document.title='Free QR Code & Barcode Generator | QRKit'}},[breadcrumbs,description,faq,path,title,tool,type]); return null}
