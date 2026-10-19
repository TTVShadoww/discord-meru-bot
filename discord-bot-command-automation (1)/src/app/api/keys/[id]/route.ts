import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { logActivity } from "@/lib/seed";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const [existing] = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    await logActivity("delete", `API key "${existing.label}" (${existing.prefix}…) revoked and destroyed.`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
}
