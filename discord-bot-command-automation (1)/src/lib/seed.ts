import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, commands } from "@/db/schema";
import { COMMAND_LIBRARY } from "@/lib/command-data";

let seedingInFlight: Promise<void> | null = null;

export async function logActivity(kind: string, message: string) {
  try {
    await db.insert(activityLogs).values({ kind, message });
  } catch {
    // logging must never break the request path
  }
}

async function doSeed() {
  const [{ value }] = await db.select({ value: count() }).from(commands);
  if (Number(value) >= COMMAND_LIBRARY.length) return;

  await db
    .insert(commands)
    .values(
      COMMAND_LIBRARY.map((c, i) => ({
        ...c,
        uses: (i * 37) % 1900,
      }))
    )
    .onConflictDoNothing();

  await logActivity(
    "seed",
    `Auto-mind v2 compiled — ${COMMAND_LIBRARY.length.toLocaleString()} commands across 31 categories deployed.`
  );
}

/** Idempotent seeding: runs once per server lifetime, safe under concurrency. */
export function ensureSeeded() {
  if (!seedingInFlight) {
    seedingInFlight = doSeed().catch((e) => {
      seedingInFlight = null;
      throw e;
    });
  }
  return seedingInFlight;
}

/** Wipe non-custom commands and reseed the full 400-command library. */
export async function forceReseed() {
  await db.delete(commands).where(eq(commands.custom, false));
  await db
    .insert(commands)
    .values(COMMAND_LIBRARY.map((c, i) => ({ ...c, enabled: true, uses: (i * 37) % 1900 })))
    .onConflictDoNothing();
  await logActivity(
    "seed",
    `Library resealed — all ${COMMAND_LIBRARY.length.toLocaleString()} built-in commands restored to factory state.`
  );
}
