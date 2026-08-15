import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";

export const isUnauthorizedError = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return false;
  const code = (error.data as { code?: string } | undefined)?.code;
  return code === "UNAUTHORIZED" || error.message === UNAUTHED_ERR_MSG || error.message.includes("Please login");
};
