import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

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
