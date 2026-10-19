import { randomBytes } from "node:crypto";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { ensureSeeded, logActivity } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();
    const keys = await db.select().from(apiKeys).orderBy(desc(apiKeys.id));
    // Never ship full keys back to the client list view — prefix + id is the handle.
    return NextResponse.json({
      keys: keys.map((k) => ({
        id: k.id,
        label: k.label,
        prefix: k.prefix,
        active: k.active,
        requests: k.requests,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json().catch(() => ({}));
    const label = String(body.label ?? "Production key").trim().slice(0, 60) || "Production key";
    const secret = randomBytes(24).toString("base64url");
    const keyValue = `orb_live_${secret}`;
    const prefix = keyValue.slice(0, 15);

    const [created] = await db.insert(apiKeys).values({ label, keyValue, prefix }).returning();
    await logActivity("create", `API key "${label}" minted (${prefix}…).`);

    // Full key is returned exactly once, at creation time.
    return NextResponse.json(
      { key: { id: created.id, label, prefix, keyValue, createdAt: created.createdAt } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
