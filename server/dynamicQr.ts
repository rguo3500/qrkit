import { and, desc, eq } from 'drizzle-orm';
import { dynamicLinks, type InsertDynamicLink } from '../drizzle/schema';
import { getDb } from './db';

export async function listDynamicLinks(userId:number){const db=await getDb();if(!db)throw new Error('Database unavailable');return db.select().from(dynamicLinks).where(eq(dynamicLinks.userId,userId)).orderBy(desc(dynamicLinks.updatedAt));}
export async function createDynamicLink(input:Pick<InsertDynamicLink,'userId'|'slug'|'label'|'destination'|'active'>){const db=await getDb();if(!db)throw new Error('Database unavailable');const result=await db.insert(dynamicLinks).values(input);const rows=await db.select().from(dynamicLinks).where(eq(dynamicLinks.id,Number(result[0].insertId))).limit(1);return rows[0];}
export async function updateDynamicLink(userId:number,id:number,input:Partial<Pick<InsertDynamicLink,'label'|'destination'|'active'>>){const db=await getDb();if(!db)throw new Error('Database unavailable');await db.update(dynamicLinks).set(input).where(and(eq(dynamicLinks.id,id),eq(dynamicLinks.userId,userId)));const rows=await db.select().from(dynamicLinks).where(and(eq(dynamicLinks.id,id),eq(dynamicLinks.userId,userId))).limit(1);return rows[0];}
export async function deleteDynamicLink(userId:number,id:number){const db=await getDb();if(!db)throw new Error('Database unavailable');await db.delete(dynamicLinks).where(and(eq(dynamicLinks.id,id),eq(dynamicLinks.userId,userId)));return {success:true as const};}
