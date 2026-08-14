import { describe, expect, it } from "vitest";

const productionOrigin = process.env.PUBLIC_SITE_URL;

describe("production site configuration", () => {
  it("uses a valid reachable HTTPS origin", async () => {
    expect(productionOrigin).toBe("https://lovexiaoyue.dpdns.org");
    const response = await fetch(productionOrigin!, { method: "HEAD", redirect: "manual" });
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
