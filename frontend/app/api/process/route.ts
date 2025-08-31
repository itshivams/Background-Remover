import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const upstream = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      body: formData,
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return new NextResponse(
        JSON.stringify({
          error: "Upstream error",
          status: upstream.status,
          body: text?.slice(0, 1000),
          backend: `${BACKEND_URL}/process`,
        }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({
        error: "Fetch to backend failed",
        message: err?.message || String(err),
        backend: `${BACKEND_URL}/process`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
