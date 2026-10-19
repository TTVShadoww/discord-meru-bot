import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  usage: text("usage").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  permissions: text("permissions").array().notNull().default([]),
  cooldown: integer("cooldown").notNull().default(3),
  response: text("response").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  premium: boolean("premium").notNull().default(false),
  custom: boolean("custom").notNull().default(false),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // run | toggle | create | delete | seed | system
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  commandName: text("command_name").notNull(),
  cadence: text("cadence").notNull(), // 5m | 15m | 1h | 6h | 12h | 24h | weekly
  channel: text("channel").notNull().default("general"),
  enabled: boolean("enabled").notNull().default(true),
  runs: integer("runs").notNull().default(0),
  lastRunAt: timestamp("last_run_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  keyValue: text("key_value").notNull().unique(),
  prefix: text("prefix").notNull(),
  active: boolean("active").notNull().default(true),
  requests: integer("requests").notNull().default(0),
  lastUsedAt: timestamp("last_used_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type Command = typeof commands.$inferSelect;
export type NewCommand = typeof commands.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Automation = typeof automations.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
