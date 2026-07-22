import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSizeChartImage } from "@/lib/queries";

// Live search suggestions for the header (max 6, active products only).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      slug: true,
      title: true,
      images: true,
      basePrice: true,
      compareAtPrice: true,
    },
    orderBy: { featured: "desc" },
    take: 6,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.images.find((src) => !isSizeChartImage(src)) ?? null,
      price: p.basePrice,
      compareAtPrice: p.compareAtPrice,
    })),
  });
}
