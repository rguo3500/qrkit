import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  data?: { code?: unknown; data?: { code?: unknown } };
  shape?: { data?: { code?: unknown } };
};

export const isUnauthorizedError = (error: unknown) => {
  if (!(error instanceof Error) && !(error instanceof TRPCClientError) && typeof error !== "object") return false;
  const value = error as ErrorLike;
  const message = typeof value.message === "string" ? value.message : "";
  const code = value.code ?? value.data?.code ?? value.data?.data?.code ?? value.shape?.data?.code;
  return code === "UNAUTHORIZED" || message === UNAUTHED_ERR_MSG || message.includes("Please login");
};
