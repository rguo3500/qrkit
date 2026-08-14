import { describe, expect, it, vi } from "vitest";
import { onRequestGet } from "./[id]";

function createDb(link: { id: string; qr_code_id: string; destination: string; active: number } | null) {
  const run = vi.fn().mockResolvedValue({ success: true });
  const first = vi.fn().mockResolvedValue(link);
  const bind = vi.fn(() => ({ first, run }));
  const prepare = vi.fn(() => ({ bind }));
  return { prepare, first, run } as unknown as D1Database;
}

describe("Pages Dynamic QR route", () => {
  it("redirects active links and records a scan event", async () => {
    const db = createDb({
      id: "link-1",
      qr_code_id: "qr-1",
      destination: "https://example.com/menu",
      active: 1,
    });

    const response = await onRequestGet({
      request: new Request("https://lovexiaoyue.dpdns.org/r/link-1", {
        headers: { "user-agent": "Vitest", referer: "https://example.com" },
      }),
      env: { DB: db },
      params: { id: "link-1" },
      data: {},
      functionPath: "functions/r/[id]",
      next: vi.fn(),
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    } as never);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/menu");
    expect((db as unknown as { prepare: ReturnType<typeof vi.fn> }).prepare).toHaveBeenCalledTimes(2);
  });

  it("returns 404 for missing links", async () => {
    const db = createDb(null);
    const response = await onRequestGet({
      request: new Request("https://lovexiaoyue.dpdns.org/r/missing"),
      env: { DB: db },
      params: { id: "missing" },
      data: {},
      functionPath: "functions/r/[id]",
      next: vi.fn(),
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    } as never);

    expect(response.status).toBe(404);
    expect((db as unknown as { prepare: ReturnType<typeof vi.fn> }).prepare).toHaveBeenCalledTimes(1);
  });
});
