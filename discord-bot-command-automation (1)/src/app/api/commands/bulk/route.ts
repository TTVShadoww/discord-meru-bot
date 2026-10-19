import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commands } from "@/db/schema";
import { logActivity } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = String(body.category ?? "");
    const enabled = Boolean(body.enabled);
    if (!category) return NextResponse.json({ error: "category required" }, { status: 400 });

    const updated = await db
      .update(commands)
      .set({ enabled })
      .where(eq(commands.category, category))
      .returning({ id: commands.id });

    await logActivity(
      "toggle",
      `Bulk ${enabled ? "armed" : "paused"} ${updated.length} ${category} commands.`
    );
    return NextResponse.json({ ok: true, affected: updated.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bulk operation failed" }, { status: 500 });
  }
}
