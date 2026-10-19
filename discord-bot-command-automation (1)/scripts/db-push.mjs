// ---------------------------------------------------------------------------
// Production schema bootstrap (Railway-safe).
// Uses ONLY the `pg` runtime dependency — no drizzle-kit, no devDeps.
// Idempotent: safe to run on every deploy/start.
// Run automatically via startCommand:  node scripts/db-push.mjs && npm run start
// ---------------------------------------------------------------------------

import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[db] DATABASE_URL is missing — link the Postgres service and reference its variable.");
  process.exit(1);
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS commands (
    id          serial PRIMARY KEY,
    name        text NOT NULL UNIQUE,
    description text NOT NULL,
    category    text NOT NULL,
    usage       text NOT NULL,
    aliases     text[] NOT NULL DEFAULT '{}',
    permissions text[] NOT NULL DEFAULT '{}',
    cooldown    integer NOT NULL DEFAULT 3,
    response    text NOT NULL,
    enabled     boolean NOT NULL DEFAULT true,
    premium     boolean NOT NULL DEFAULT false,
    custom      boolean NOT NULL DEFAULT false,
    uses        integer NOT NULL DEFAULT 0,
    created_at  timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id         serial PRIMARY KEY,
    kind       text NOT NULL,
    message    text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS automations (
    id           serial PRIMARY KEY,
    name         text NOT NULL,
    command_name text NOT NULL,
    cadence      text NOT NULL,
    channel      text NOT NULL DEFAULT 'general',
    enabled      boolean NOT NULL DEFAULT true,
    runs         integer NOT NULL DEFAULT 0,
    last_run_at  timestamp,
    created_at   timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS api_keys (
    id           serial PRIMARY KEY,
    label        text NOT NULL,
    key_value    text NOT NULL UNIQUE,
    prefix       text NOT NULL,
    active       boolean NOT NULL DEFAULT true,
    requests     integer NOT NULL DEFAULT 0,
    last_used_at timestamp,
    created_at   timestamp NOT NULL DEFAULT now()
  )`,
];

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  for (const stmt of DDL) await client.query(stmt);
  console.log("[db] schema ensured (4 tables ready)");
} catch (e) {
  console.error("[db] schema bootstrap failed:", e.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
