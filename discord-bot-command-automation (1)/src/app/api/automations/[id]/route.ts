import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { automations, commands } from "@/db/schema";
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
    if (typeof body.cadence === "string") patch.cadence = body.cadence;
    if (typeof body.channel === "string" && body.channel.trim()) {
      patch.channel = body.channel.trim().replace(/^#/, "").slice(0, 40);
    }
    if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 60);

    const [updated] = await db.update(automations).set(patch).where(eq(automations.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (typeof patch.enabled === "boolean") {
      await logActivity("toggle", `Automation "${updated.name}" ${patch.enabled ? "resumed" : "suspended"}.`);
    }
    return NextResponse.json({ automation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update automation" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const [auto] = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (!auto) return NextResponse.json({ error: "not found" }, { status: 404 });

    const [updated] = await db
      .update(automations)
      .set({ runs: sql`${automations.runs} + 1`, lastRunAt: sql`NOW()` })
      .where(eq(automations.id, id))
      .returning();

    await db
      .update(commands)
      .set({ uses: sql`${commands.uses} + 1` })
      .where(eq(commands.name, auto.commandName));

    await logActivity("run", `Automation "${auto.name}" fired /${auto.commandName} in #${auto.channel}.`);
    return NextResponse.json({ automation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to run automation" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params;
    const id = Number(raw);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

    const [existing] = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    await db.delete(automations).where(eq(automations.id, id));
    await logActivity("delete", `Automation "${existing.name}" decommissioned.`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 });
  }
}
