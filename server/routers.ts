import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDynamicLink, deleteDynamicLink, getDynamicLinkStats, listDynamicLinks, updateDynamicLink } from "./dynamicQr";

const idInput = z.string().min(1);
const apiId = (value: number | string) => String(value);

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),


  dynamicQr: router({
    list: protectedProcedure.query(async ({ ctx }) => (await listDynamicLinks(ctx.user.id)).map(link => ({ ...link, id: apiId(link.id) }))),
    stats: protectedProcedure.input(z.object({ id: idInput })).query(async ({ ctx, input }) => getDynamicLinkStats(ctx.user.id, Number(input.id))),
    create: protectedProcedure.input(z.object({ slug: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/), label: z.string().min(1).max(160), destination: z.string().url().max(2048), active: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { try { const record = await createDynamicLink({ ...input, userId: ctx.user.id }); return { ...record, id: apiId(record.id) }; } catch { throw new TRPCError({ code: "CONFLICT", message: "Unable to create this Dynamic QR link." }); } }),
    update: protectedProcedure.input(z.object({ id: idInput, label: z.string().min(1).max(160).optional(), destination: z.string().url().max(2048).optional(), active: z.boolean().optional() })).mutation(async ({ ctx, input }) => { const { id, ...changes } = input; const result = await updateDynamicLink(ctx.user.id, Number(id), changes); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Dynamic QR link not found." }); return { ...result, id: apiId(result.id) }; }),
    remove: protectedProcedure.input(z.object({ id: idInput })).mutation(async ({ ctx, input }) => deleteDynamicLink(ctx.user.id, Number(input.id))),
  }),
});

export type AppRouter = typeof appRouter;
