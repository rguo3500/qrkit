/* QRKit Signal Paper: monitoring is anonymous, lightweight, and limited to route metadata health signals. */
declare global { interface Window { umami?: { track:(event:string,data?:Record<string,string>)=>void } } }
export function trackSeoRoute(path:string,title:string){if(typeof window==='undefined')return;window.umami?.track('seo_route_view',{path,title})}
export function trackExport(format:'png'|'svg',tool:string){if(typeof window==='undefined')return;window.umami?.track('code_export',{format,tool})}
