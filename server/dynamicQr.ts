import { and, desc, eq, sql } from 'drizzle-orm';
import { dynamicLinks, scanEvents, type InsertDynamicLink } from '../drizzle/schema';
import { getDb } from './db';

export type DynamicQrStats = {
  totalScans: number;
  lastScanAt: Date | null;
  daily: Array<{ date: string; scans: number }>;
  recent: Array<{ createdAt: Date; country: string | null; referrer: string | null; userAgent: string | null }>;
};

export function buildDailyScanSeries(rows: Array<{ date: string; scans: number | string }>, days = 14) {
  const byDate = new Map(rows.map(row => [row.date, Number(row.scans)]));
  const result: Array<{ date: string; scans: number }> = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, scans: byDate.get(key) ?? 0 });
  }
  return result;
}

export async function listDynamicLinks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  return db.select().from(dynamicLinks).where(eq(dynamicLinks.userId, userId)).orderBy(desc(dynamicLinks.updatedAt));
}

export async function createDynamicLink(input: Pick<InsertDynamicLink, 'userId' | 'slug' | 'label' | 'destination' | 'active'>) {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  const result = await db.insert(dynamicLinks).values(input);
  const rows = await db.select().from(dynamicLinks).where(eq(dynamicLinks.id, Number(result[0].insertId))).limit(1);
  return rows[0];
}

export async function updateDynamicLink(userId: number, id: number, input: Partial<Pick<InsertDynamicLink, 'label' | 'destination' | 'active'>>) {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  await db.update(dynamicLinks).set(input).where(and(eq(dynamicLinks.id, id), eq(dynamicLinks.userId, userId)));
  const rows = await db.select().from(dynamicLinks).where(and(eq(dynamicLinks.id, id), eq(dynamicLinks.userId, userId))).limit(1);
  return rows[0];
}

export async function deleteDynamicLink(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  await db.delete(dynamicLinks).where(and(eq(dynamicLinks.id, id), eq(dynamicLinks.userId, userId)));
  return { success: true as const };
}

export async function getDynamicLinkStats(userId: number, id: number): Promise<DynamicQrStats> {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  const owned = await db.select({ id: dynamicLinks.id }).from(dynamicLinks).where(and(eq(dynamicLinks.id, id), eq(dynamicLinks.userId, userId))).limit(1);
  if (!owned[0]) return { totalScans: 0, lastScanAt: null, daily: buildDailyScanSeries([]), recent: [] };

  const [summary] = await db.select({ totalScans: sql<number>`count(*)`, lastScanAt: sql<Date | null>`max(${scanEvents.createdAt})` }).from(scanEvents).where(eq(scanEvents.dynamicLinkId, id));
  const dailyRows = await db.select({ date: sql<string>`date_format(${scanEvents.createdAt}, '%Y-%m-%d')`, scans: sql<number>`count(*)` }).from(scanEvents).where(and(eq(scanEvents.dynamicLinkId, id), sql`${scanEvents.createdAt} >= date_sub(current_timestamp(), interval 13 day)`)).groupBy(sql`date_format(${scanEvents.createdAt}, '%Y-%m-%d')`).orderBy(sql`date_format(${scanEvents.createdAt}, '%Y-%m-%d')`);
  const recent = await db.select({ createdAt: scanEvents.createdAt, country: scanEvents.country, referrer: scanEvents.referrer, userAgent: scanEvents.userAgent }).from(scanEvents).where(eq(scanEvents.dynamicLinkId, id)).orderBy(desc(scanEvents.createdAt)).limit(8);
  return { totalScans: Number(summary?.totalScans ?? 0), lastScanAt: summary?.lastScanAt ?? null, daily: buildDailyScanSeries(dailyRows), recent };
}
