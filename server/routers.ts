import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDynamicLink, deleteDynamicLink, getDynamicLinkStats, listDynamicLinks, updateDynamicLink } from "./dynamicQr";
import { createTeam, inviteMember, listMembers, listSharedLinks, listTeams, shareDynamicLink, unshareDynamicLink, updateMemberRole } from './team';

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

  team: router({
    list: protectedProcedure.query(({ ctx }) => listTeams(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().min(2).max(160) })).mutation(({ ctx, input }) => createTeam(ctx.user.id, input.name, ctx.user.email ?? null)),
    members: protectedProcedure.input(z.object({ teamId: z.number().int().positive() })).query(({ ctx, input }) => listMembers(ctx.user.id, input.teamId)),
    invite: protectedProcedure.input(z.object({ teamId: z.number().int().positive(), email: z.string().email(), role: z.enum(['editor', 'viewer']) })).mutation(({ ctx, input }) => inviteMember(ctx.user.id, input.teamId, input.email, input.role)),
    updateRole: protectedProcedure.input(z.object({ teamId: z.number().int().positive(), memberId: z.number().int().positive(), role: z.enum(['owner', 'editor', 'viewer']) })).mutation(({ ctx, input }) => updateMemberRole(ctx.user.id, input.teamId, input.memberId, input.role)),
    shareLink: protectedProcedure.input(z.object({ teamId: z.number().int().positive(), dynamicLinkId: z.number().int().positive() })).mutation(({ ctx, input }) => shareDynamicLink(ctx.user.id, input.teamId, input.dynamicLinkId)),
    unshareLink: protectedProcedure.input(z.object({ teamId: z.number().int().positive(), dynamicLinkId: z.number().int().positive() })).mutation(({ ctx, input }) => unshareDynamicLink(ctx.user.id, input.teamId, input.dynamicLinkId)),
    sharedLinks: protectedProcedure.input(z.object({ teamId: z.number().int().positive() })).query(({ ctx, input }) => listSharedLinks(ctx.user.id, input.teamId)),
  }),

  dynamicQr: router({
    list: protectedProcedure.query(async ({ ctx }) => listDynamicLinks(ctx.user.id)),
    stats: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => getDynamicLinkStats(ctx.user.id, input.id)),
    create: protectedProcedure.input(z.object({ slug: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/), label: z.string().min(1).max(160), destination: z.string().url().max(2048), active: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { try { return await createDynamicLink({ ...input, userId: ctx.user.id }); } catch (error) { throw new TRPCError({ code: "CONFLICT", message: "Unable to create this Dynamic QR link." }); } }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), label: z.string().min(1).max(160).optional(), destination: z.string().url().max(2048).optional(), active: z.boolean().optional() })).mutation(async ({ ctx, input }) => { const { id, ...changes } = input; const result = await updateDynamicLink(ctx.user.id, id, changes); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Dynamic QR link not found." }); return result; }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => deleteDynamicLink(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
