import { describe, expect, it } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { getErrorMessage, isUnauthorizedError } from "./authErrors";

describe("getErrorMessage", () => {
  it("returns a safe fallback for null and undefined", () => {
    expect(getErrorMessage(null)).toBe("The request could not be completed.");
    expect(getErrorMessage(undefined)).toBe("The request could not be completed.");
  });

  it("reads messages from strings and serialized error objects", () => {
    expect(getErrorMessage("Network unavailable")).toBe("Network unavailable");
    expect(getErrorMessage({ message: "Please sign in" })).toBe("Please sign in");
  });
});

describe("isUnauthorizedError", () => {
  it("accepts the Cloudflare Functions UNAUTHORIZED code", () => {
    const error = new TRPCClientError("Request failed", { result: { error: { data: { code: "UNAUTHORIZED" } } } } as never);
    expect(isUnauthorizedError(error)).toBe(true);
  });

  it("accepts the legacy login message", () => {
    expect(isUnauthorizedError(new TRPCClientError("Please login (10001)"))).toBe(true);
  });

  it("accepts serialized Cloudflare error objects", () => {
    expect(isUnauthorizedError({ message: "Please login (10001)", data: { code: "UNAUTHORIZED" } })).toBe(true);
    expect(isUnauthorizedError({ message: "Request failed", shape: { data: { code: "UNAUTHORIZED" } } })).toBe(true);
  });

  it("rejects null and unrelated errors without throwing", () => {
    expect(isUnauthorizedError(null)).toBe(false);
    expect(isUnauthorizedError(new TRPCClientError("FORBIDDEN"))).toBe(false);
    expect(isUnauthorizedError(new Error("Something else"))).toBe(false);
  });
});
