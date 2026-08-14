import { and, eq } from 'drizzle-orm';
import { dynamicLinkShares, dynamicLinks, teamMembers, teams, users } from '../drizzle/schema';
import { getDb } from './db';

export type TeamRole = 'owner' | 'editor' | 'viewer';
export function canInvite(role: TeamRole) { return role === 'owner'; }
export function canShare(role: TeamRole) { return role === 'owner' || role === 'editor'; }
export function canManageTeam(role: TeamRole) { return role === 'owner'; }
export function canUnshare(role: TeamRole) { return role === 'owner' || role === 'editor'; }
export function isSameTeam(resourceTeamId: number, requestedTeamId: number) { return resourceTeamId === requestedTeamId; }

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  return db;
}

async function membership(userId: number, teamId: number) {
  const db = await requireDb();
  const rows = await db.select().from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId), eq(teamMembers.status, 'active'))).limit(1);
  return rows[0];
}

export async function listTeams(userId: number) {
  const db = await requireDb();
  return db.select({ id: teams.id, name: teams.name, role: teamMembers.role, status: teamMembers.status, createdAt: teams.createdAt }).from(teamMembers).innerJoin(teams, eq(teamMembers.teamId, teams.id)).where(and(eq(teamMembers.userId, userId), eq(teamMembers.status, 'active')));
}

export async function createTeam(userId: number, name: string, email: string | null) {
  const db = await requireDb();
  const created = await db.insert(teams).values({ name, ownerUserId: userId });
  const teamId = Number(created[0].insertId);
  await db.insert(teamMembers).values({ teamId, userId, email: email ?? `user-${userId}@local.invalid`, role: 'owner', status: 'active' });
  return { id: teamId, name, role: 'owner' as const };
}

export async function listMembers(userId: number, teamId: number) {
  const current = await membership(userId, teamId);
  if (!current) throw new Error('FORBIDDEN');
  const db = await requireDb();
  return db.select({ id: teamMembers.id, email: teamMembers.email, role: teamMembers.role, status: teamMembers.status, userId: teamMembers.userId, createdAt: teamMembers.createdAt }).from(teamMembers).where(eq(teamMembers.teamId, teamId));
}

export async function inviteMember(userId: number, teamId: number, email: string, role: 'editor' | 'viewer') {
  const current = await membership(userId, teamId);
  if (!current || !canInvite(current.role as TeamRole)) throw new Error('FORBIDDEN');
  const db = await requireDb();
  await db.insert(teamMembers).values({ teamId, email: email.toLowerCase(), role, status: 'pending' }).onDuplicateKeyUpdate({ set: { role, status: 'pending' } });
  return { email: email.toLowerCase(), role, status: 'pending' as const };
}

export async function updateMemberRole(userId: number, teamId: number, memberId: number, role: 'editor' | 'viewer' | 'owner') {
  const current = await membership(userId, teamId);
  if (!current || !canInvite(current.role as TeamRole)) throw new Error('FORBIDDEN');
  const db = await requireDb();
  const result = await db.update(teamMembers).set({ role }).where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)));
  return { updated: result[0].affectedRows > 0 };
}

export async function shareDynamicLink(userId: number, teamId: number, dynamicLinkId: number) {
  const current = await membership(userId, teamId);
  if (!current || !canShare(current.role as TeamRole)) throw new Error('FORBIDDEN');
  const db = await requireDb();
  const owned = await db.select({ id: dynamicLinks.id }).from(dynamicLinks).where(and(eq(dynamicLinks.id, dynamicLinkId), eq(dynamicLinks.userId, userId))).limit(1);
  if (!owned[0]) throw new Error('NOT_FOUND');
  await db.insert(dynamicLinkShares).values({ teamId, dynamicLinkId, grantedByUserId: userId }).onDuplicateKeyUpdate({ set: { grantedByUserId: userId } });
  return { teamId, dynamicLinkId, shared: true };
}

export async function unshareDynamicLink(userId: number, teamId: number, dynamicLinkId: number) {
  const current = await membership(userId, teamId);
  if (!current || !canUnshare(current.role as TeamRole)) throw new Error('FORBIDDEN');
  const db = await requireDb();
  const result = await db.delete(dynamicLinkShares).where(and(eq(dynamicLinkShares.teamId, teamId), eq(dynamicLinkShares.dynamicLinkId, dynamicLinkId)));
  return { teamId, dynamicLinkId, removed: result[0].affectedRows > 0 };
}

export async function listSharedLinks(userId: number, teamId: number) {
  const current = await membership(userId, teamId);
  if (!current) throw new Error('FORBIDDEN');
  const db = await requireDb();
  return db.select({ id: dynamicLinks.id, slug: dynamicLinks.slug, label: dynamicLinks.label, destination: dynamicLinks.destination, active: dynamicLinks.active }).from(dynamicLinkShares).innerJoin(dynamicLinks, eq(dynamicLinkShares.dynamicLinkId, dynamicLinks.id)).where(eq(dynamicLinkShares.teamId, teamId));
}
