import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(_req: NextRequest) {
  try {
    const r = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const text = await r.text();
    return new NextResponse(text, { status: r.status });
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: e?.message || String(e), backend: `${BACKEND_URL}/health` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
