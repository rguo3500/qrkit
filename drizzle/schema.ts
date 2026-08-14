import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, unique } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const dynamicLinks = mysqlTable("dynamic_links", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  destination: varchar("destination", { length: 2048 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userIdx: index("dynamic_links_user_idx").on(table.userId) }));

export const scanEvents = mysqlTable("scan_events", {
  id: int("id").autoincrement().primaryKey(),
  dynamicLinkId: int("dynamicLinkId").notNull().references(() => dynamicLinks.id, { onDelete: "cascade" }),
  country: varchar("country", { length: 8 }),
  userAgent: varchar("userAgent", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ linkIdx: index("scan_events_link_idx").on(table.dynamicLinkId) }));

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ ownerIdx: index("teams_owner_idx").on(table.ownerUserId) }));

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("viewer").notNull(),
  status: mysqlEnum("status", ["pending", "active", "revoked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ teamEmailUnique: unique("team_members_team_email_unique").on(table.teamId, table.email), teamIdx: index("team_members_team_idx").on(table.teamId), userIdx: index("team_members_user_idx").on(table.userId) }));

export const dynamicLinkShares = mysqlTable("dynamic_link_shares", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  dynamicLinkId: int("dynamicLinkId").notNull().references(() => dynamicLinks.id, { onDelete: "cascade" }),
  grantedByUserId: int("grantedByUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ shareUnique: unique("dynamic_link_shares_unique").on(table.teamId, table.dynamicLinkId), teamIdx: index("dynamic_link_shares_team_idx").on(table.teamId), linkIdx: index("dynamic_link_shares_link_idx").on(table.dynamicLinkId) }));

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: varchar("plan", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DynamicLink = typeof dynamicLinks.$inferSelect;
export type InsertDynamicLink = typeof dynamicLinks.$inferInsert;
export type ScanEvent = typeof scanEvents.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type DynamicLinkShare = typeof dynamicLinkShares.$inferSelect;
