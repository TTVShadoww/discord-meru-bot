import { NextResponse } from "next/server";
import { COMMAND_LIBRARY } from "@/lib/command-data";
import { forceReseed } from "@/lib/seed";

export async function POST() {
  try {
    await forceReseed();
    return NextResponse.json({ ok: true, count: COMMAND_LIBRARY.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to reseed" }, { status: 500 });
  }
}
