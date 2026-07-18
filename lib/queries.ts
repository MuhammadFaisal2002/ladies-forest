import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

// ---------- Serializers (safe to pass to client components) ----------

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  hoverImage: string | null;
  price: number;
  compareAtPrice: number | null;
  outOfStock: boolean;
};

type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

export function toProductCard(p: ProductWithVariants): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.images[0] ?? null,
    hoverImage: p.images[1] ?? null,
    price: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    outOfStock: p.variants.length > 0 && p.variants.every((v) => v.stock <= 0),
  };
}

// ---------- Settings ----------

export type StoreSettings = {
  freeDeliveryThreshold: number;
  shippingFee: number;
  announcementText: string;
  storeInfo: { name: string; email: string; phone: string; address: string };
  whatsappNumber: string;
  socialLinks: { facebook: string; instagram: string };
  paymentMethodsEnabled: Record<string, boolean>;
};

const SETTING_DEFAULTS: StoreSettings = {
  freeDeliveryThreshold: 3000,
  shippingFee: 250,
  announcementText: "",
  storeInfo: { name: "Ladies Forest", email: "", phone: "", address: "" },
  whatsappNumber: "",
  socialLinks: { facebook: "", instagram: "" },
  paymentMethodsEnabled: { COD: true },
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...SETTING_DEFAULTS, ...map } as StoreSettings;
}

// ---------- Catalog ----------

export function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getNewArrivals(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getSaleProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", compareAtPrice: { not: null } },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toProductCard);
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      options: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toProductCard);
}

// ---------- Orders ----------

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

// ---------- Shop listing with filters ----------

export type ShopFilters = {
  category?: string; // category slug
  q?: string; // search query
  option?: string; // an option value, e.g. "34" or "200ml"
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "featured";
  page?: number;
  perPage?: number;
};

export async function getShopProducts(filters: ShopFilters) {
  const {
    category,
    q,
    option,
    minPrice,
    maxPrice,
    sort = "featured",
    page = 1,
    perPage = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(option ? { options: { some: { values: { has: option } } } } : {}),
    ...(minPrice != null || maxPrice != null
      ? {
          basePrice: {
            ...(minPrice != null ? { gte: minPrice } : {}),
            ...(maxPrice != null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { basePrice: "asc" }
      : sort === "price-desc"
        ? { basePrice: "desc" }
        : sort === "newest"
          ? { createdAt: "desc" }
          : { featured: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toProductCard),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Distinct option values across active products, for filter UI (e.g. sizes). */
export async function getFilterOptions(categorySlug?: string) {
  const options = await prisma.productOption.findMany({
    where: {
      product: {
        status: "ACTIVE",
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
    },
    select: { name: true, values: true },
  });
  const map = new Map<string, Set<string>>();
  for (const o of options) {
    const set = map.get(o.name) ?? new Set<string>();
    o.values.forEach((v) => set.add(v));
    map.set(o.name, set);
  }
  return Array.from(map.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
}

export async function getPriceRange(categorySlug?: string) {
  const agg = await prisma.product.aggregate({
    where: {
      status: "ACTIVE",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    _min: { basePrice: true },
    _max: { basePrice: true },
  });
  return { min: agg._min.basePrice ?? 0, max: agg._max.basePrice ?? 0 };
}
