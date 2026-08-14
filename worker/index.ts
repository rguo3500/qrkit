/* QRKit Signal Paper: Dynamic QR is an explicit redirect boundary. Static generation remains browser-local; this Worker only handles /r/:id when a D1 binding is configured. */
export interface Env { ASSETS: Fetcher; DB?: D1Database; }
type DynamicRow = { id:string; qr_code_id:string; destination:string; active:number };

async function getDynamicLink(id:string, db?:D1Database){
  if(!db) return null;
  return db.prepare('SELECT id, qr_code_id, destination, active FROM dynamic_links WHERE id = ?1 LIMIT 1').bind(id).first<DynamicRow>();
}

async function recordScan(request:Request, row:DynamicRow, db?:D1Database){
  if(!db) return;
  const url=new URL(request.url);
  const userAgent=request.headers.get('user-agent')?.slice(0,300) ?? null;
  const referrer=request.headers.get('referer')?.slice(0,500) ?? null;
  await db.prepare('INSERT INTO scans (id, qr_code_id, country, device, browser, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(crypto.randomUUID(), row.qr_code_id, request.cf?.country ?? null, userAgent, referrer, new Date().toISOString()).run();
  void url;
}

export default { async fetch(request:Request, env:Env, ctx:ExecutionContext){
  const url=new URL(request.url);
  const match=url.pathname.match(/^\/r\/([A-Za-z0-9_-]+)$/);
  if(match){
    const link=await getDynamicLink(match[1], env.DB);
    if(!link || !link.active || !/^https?:\/\//i.test(link.destination)) return new Response('Dynamic QR link not found', {status:404, headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    ctx.waitUntil(recordScan(request, link, env.DB));
    return Response.redirect(link.destination, 302);
  }
  return env.ASSETS.fetch(request);
} };
