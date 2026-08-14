import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDynamicLink, deleteDynamicLink, listDynamicLinks, updateDynamicLink } from "./dynamicQr";

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
    list: protectedProcedure.query(async ({ ctx }) => listDynamicLinks(ctx.user.id)),
    create: protectedProcedure.input(z.object({ slug: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/), label: z.string().min(1).max(160), destination: z.string().url().max(2048), active: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { try { return await createDynamicLink({ ...input, userId: ctx.user.id }); } catch (error) { throw new TRPCError({ code: "CONFLICT", message: "Unable to create this Dynamic QR link." }); } }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), label: z.string().min(1).max(160).optional(), destination: z.string().url().max(2048).optional(), active: z.boolean().optional() })).mutation(async ({ ctx, input }) => { const { id, ...changes } = input; const result = await updateDynamicLink(ctx.user.id, id, changes); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Dynamic QR link not found." }); return result; }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => deleteDynamicLink(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
