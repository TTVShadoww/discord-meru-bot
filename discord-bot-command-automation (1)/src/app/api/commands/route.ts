import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commands } from "@/db/schema";
import { ensureSeeded, logActivity } from "@/lib/seed";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = [
  "moderation", "utility", "fun", "games", "economy", "music", "anime",
  "roleplay", "text", "image", "admin", "security", "leveling", "tickets",
  "giveaways", "custom",
];

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim().toLowerCase() ?? "";
    const category = sp.get("category") ?? "all";
    const status = sp.get("status") ?? "all";
    const sort = sp.get("sort") ?? "name";
    const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
    const pageSize = Math.min(1200, Math.max(8, Number(sp.get("pageSize") ?? "48") || 48));

    const filters = [];
    if (q) {
      filters.push(
        or(
          ilike(commands.name, `%${q}%`),
          ilike(commands.description, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM unnest(${commands.aliases}) a WHERE a ILIKE ${"%" + q + "%"})`
        )
      );
    }
    if (category !== "all") filters.push(eq(commands.category, category));
    if (status === "enabled") filters.push(eq(commands.enabled, true));
    if (status === "paused") filters.push(eq(commands.enabled, false));
    if (status === "premium") filters.push(eq(commands.premium, true));
    if (status === "custom") filters.push(eq(commands.custom, true));

    const where = filters.length ? and(...filters) : undefined;
    const orderBy =
      sort === "uses" ? desc(commands.uses) : sort === "category" ? sql`${commands.category}, ${commands.name}` : sql`${commands.name}`;

    const [rows, [{ value: total }], catCounts] = await Promise.all([
      db
        .select()
        .from(commands)
        .where(where)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ value: count() }).from(commands).where(where),
      db
        .select({ category: commands.category, value: count() })
        .from(commands)
        .groupBy(commands.category),
    ]);

    return NextResponse.json({
      commands: rows,
      total: Number(total),
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(Number(total) / pageSize)),
      categoryCounts: Object.fromEntries(catCounts.map((c) => [c.category, Number(c.value)])),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load commands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const name = String(body.name ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
    const description = String(body.description ?? "").trim().slice(0, 200);
    const category = ALLOWED_CATEGORIES.includes(body.category) ? body.category : "custom";
    const response = String(body.response ?? "").trim().slice(0, 2000);
    const cooldown = Math.min(3600, Math.max(0, Number(body.cooldown ?? 3) || 3));
    const aliases: string[] = Array.isArray(body.aliases)
      ? body.aliases.map((a: unknown) => String(a).trim().toLowerCase().replace(/[^a-z0-9-]/g, "")).filter(Boolean).slice(0, 5)
      : [];

    if (!name || !description || !response) {
      return NextResponse.json({ error: "name, description and response are required" }, { status: 400 });
    }

    const usage = `/${name}${body.usageHint ? ` ${String(body.usageHint).slice(0, 40)}` : ""}`;
    const [inserted] = await db
      .insert(commands)
      .values({
        name,
        description,
        category,
        usage,
        aliases,
        permissions: [],
        cooldown,
        response: response || "Acknowledged, {user}.",
        enabled: true,
        premium: false,
        custom: true,
        uses: 0,
      })
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      return NextResponse.json({ error: `/${name} already exists` }, { status: 409 });
    }

    await logActivity("create", `Custom command /${name} forged in the studio (${category}).`);
    return NextResponse.json({ command: inserted }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create command" }, { status: 500 });
  }
}
