import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commands } from "@/db/schema";
import { logActivity } from "@/lib/seed";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (typeof body.description === "string" && body.description.trim()) {
      patch.description = body.description.trim().slice(0, 200);
    }
    if (typeof body.response === "string" && body.response.trim()) {
      patch.response = body.response.trim().slice(0, 2000);
    }
    if (typeof body.cooldown === "number") patch.cooldown = Math.max(0, Math.min(3600, body.cooldown));

    const [updated] = await db.update(commands).set(patch).where(eq(commands.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (typeof patch.enabled === "boolean") {
      await logActivity(
        "toggle",
        `/${updated.name} ${patch.enabled ? "brought back online" : "paused"} (${updated.category}).`
      );
    }
    return NextResponse.json({ command: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const [existing] = await db.select().from(commands).where(eq(commands.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!existing.custom) {
      return NextResponse.json({ error: "Built-in commands can be paused, not deleted" }, { status: 403 });
    }
    await db.delete(commands).where(eq(commands.id, id));
    await logActivity("delete", `Custom command /${existing.name} deleted from the library.`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
