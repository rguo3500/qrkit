type DynamicLinkRow = {
  id: string;
  qr_code_id: string;
  destination: string;
  active: number;
};

type PagesEnv = {
  DB: D1Database;
};

function safeHeader(request: Request, name: string, limit: number) {
  return request.headers.get(name)?.slice(0, limit) || undefined;
}

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env, params }) => {
  const id = typeof params.id === "string" ? params.id : "";
  if (!id) return new Response("Dynamic QR link not found", { status: 404 });

  const link = await env.DB.prepare(
    "SELECT id, qr_code_id, destination, active FROM dynamic_links WHERE id = ?1 LIMIT 1",
  )
    .bind(id)
    .first<DynamicLinkRow>();

  if (!link || link.active !== 1 || !/^https?:\/\//i.test(link.destination)) {
    return new Response("Dynamic QR link not found", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }

  const eventId = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO scan_events (id, dynamic_link_id, country, user_agent, referrer, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
  )
    .bind(
      eventId,
      link.id,
      request.cf?.country || null,
      safeHeader(request, "user-agent", 300) || null,
      safeHeader(request, "referer", 500) || null,
      new Date().toISOString(),
    )
    .run();

  return Response.redirect(link.destination, 302);
};
