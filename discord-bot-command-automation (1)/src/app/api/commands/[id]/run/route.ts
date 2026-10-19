import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commands } from "@/db/schema";
import { logActivity } from "@/lib/seed";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const [updated] = await db
      .update(commands)
      .set({ uses: sql`${commands.uses} + 1` })
      .where(eq(commands.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (updated.uses % 10 === 0) {
      await logActivity("run", `/${updated.name} hit ${updated.uses.toLocaleString()} total executions.`);
    }
    return NextResponse.json({ command: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to record run" }, { status: 500 });
  }
}
