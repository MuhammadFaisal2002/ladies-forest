import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Health check: confirms the deployment can reach the database.
// Returns the error class/code/message (never credentials) on failure.
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const [settings, products, heroSlides] = await Promise.all([
      prisma.setting.count(),
      prisma.product.count(),
      prisma.heroSlide.count(),
    ]);
    return NextResponse.json({
      ok: true,
      ms: Date.now() - started,
      counts: { settings, products, heroSlides },
    });
  } catch (e) {
    const err = e as { message?: unknown; code?: unknown; name?: unknown };
    return NextResponse.json(
      {
        ok: false,
        ms: Date.now() - started,
        name: String(err.name ?? "Error"),
        code: err.code ? String(err.code) : undefined,
        message: String(err.message ?? e).slice(0, 500),
      },
      { status: 500 },
    );
  }
}
