import { type NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    // The Browser Echo client may send arbitrary fields; include all for visibility.
    logger.info({ source: "browser-echo", ...body }, "Client log event");
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "client-logs route error");
    return NextResponse.json(
      { ok: false, error: "invalid payload" },
      { status: 400 }
    );
  }
}
