import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { automations, commands } from "@/db/schema";
import { ensureSeeded, logActivity } from "@/lib/seed";

export const dynamic = "force-dynamic";

const CADENCES = ["5m", "15m", "1h", "6h", "12h", "24h", "weekly"];

export async function GET() {
  try {
    await ensureSeeded();
    const rows = await db.select().from(automations).orderBy(desc(automations.id));
    return NextResponse.json({ automations: rows, cadences: CADENCES });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load automations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 60);
    const commandName = String(body.commandName ?? "").trim().toLowerCase();
    const cadence = CADENCES.includes(body.cadence) ? body.cadence : "1h";
    const channel = String(body.channel ?? "general").trim().replace(/^#/, "").slice(0, 40) || "general";

    if (!name || !commandName) {
      return NextResponse.json({ error: "name and commandName are required" }, { status: 400 });
    }
    const [cmd] = await db.select({ name: commands.name }).from(commands).where(eq(commands.name, commandName)).limit(1);
    if (!cmd) return NextResponse.json({ error: `/${commandName} does not exist` }, { status: 400 });

    const [created] = await db
      .insert(automations)
      .values({ name, commandName, cadence, channel, enabled: true })
      .returning();

    await logActivity("create", `Automation "${name}" scheduled: /${commandName} every ${cadence} in #${channel}.`);
    return NextResponse.json({ automation: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
