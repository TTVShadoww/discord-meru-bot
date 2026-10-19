import { count, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, commands } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();

    const [totals] = await db
      .select({
        total: count(),
        enabled: count(sql`CASE WHEN ${commands.enabled} THEN 1 END`),
        custom: count(sql`CASE WHEN ${commands.custom} THEN 1 END`),
        premium: count(sql`CASE WHEN ${commands.premium} THEN 1 END`),
        uses: sql<number>`COALESCE(SUM(${commands.uses}), 0)`,
      })
      .from(commands);

    const catCounts = await db
      .select({ category: commands.category, value: count() })
      .from(commands)
      .groupBy(commands.category);

    const top = await db
      .select({ name: commands.name, uses: commands.uses, category: commands.category })
      .from(commands)
      .where(eq(commands.enabled, true))
      .orderBy(desc(commands.uses))
      .limit(6);

    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.id))
      .limit(8);

    return NextResponse.json({
      total: Number(totals.total),
      enabled: Number(totals.enabled),
      paused: Number(totals.total) - Number(totals.enabled),
      custom: Number(totals.custom),
      premium: Number(totals.premium),
      uses: Number(totals.uses),
      categories: catCounts.length,
      categoryCounts: Object.fromEntries(catCounts.map((c) => [c.category, Number(c.value)])),
      top,
      logs: logs.reverse(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
