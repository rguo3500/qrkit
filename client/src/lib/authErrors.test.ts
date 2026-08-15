import { describe, expect, it } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { isUnauthorizedError } from "./authErrors";

describe("isUnauthorizedError", () => {
  it("accepts the Cloudflare Functions UNAUTHORIZED code", () => {
    const error = new TRPCClientError("Request failed", { result: { error: { data: { code: "UNAUTHORIZED" } } } } as never);
    expect(isUnauthorizedError(error)).toBe(true);
  });

  it("accepts the legacy login message", () => {
    expect(isUnauthorizedError(new TRPCClientError("Please login (10001)"))).toBe(true);
  });

  it("rejects unrelated errors", () => {
    expect(isUnauthorizedError(new TRPCClientError("FORBIDDEN"))).toBe(false);
    expect(isUnauthorizedError(new Error("Please login (10001)"))).toBe(false);
  });
});
