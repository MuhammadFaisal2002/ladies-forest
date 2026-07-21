import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

const ACTIVE_ORDER: Prisma.OrderWhereInput = {
  status: { notIn: ["CANCELLED", "RETURNED"] },
};

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    todayCount,
    todayRevenue,
    monthRevenue,
    pendingCount,
    lowStock,
    recentOrders,
    topSellers,
  ] = await Promise.all([
    prisma.order.count({
      where: { ...ACTIVE_ORDER, createdAt: { gte: startOfDay } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { ...ACTIVE_ORDER, createdAt: { gte: startOfDay } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { ...ACTIVE_ORDER, createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.variant.findMany({
      where: { stock: { lte: prisma.variant.fields.lowStockThreshold } },
      include: { product: { select: { title: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        shipName: true,
        shipCity: true,
        grandTotal: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productTitle"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    todayCount,
    todayRevenue: todayRevenue._sum.grandTotal ?? 0,
    monthRevenue: monthRevenue._sum.grandTotal ?? 0,
    pendingCount,
    lowStock,
    recentOrders,
    topSellers: topSellers.map((t) => ({
      title: t.productTitle,
      sold: t._sum.quantity ?? 0,
    })),
  };
}

export function getAdminProducts() {
  return prisma.product.findMany({
    include: { category: { select: { name: true } }, variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export function getAdminOrders(status?: string) {
  return prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: { items: { select: { quantity: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export function getAdminVariants() {
  return prisma.variant.findMany({
    include: { product: { select: { title: true, status: true } } },
    orderBy: [{ product: { title: "asc" } }, { createdAt: "asc" }],
  });
}

export function getRecentAdjustments() {
  return prisma.stockAdjustment.findMany({
    include: {
      variant: {
        select: { title: true, sku: true, product: { select: { title: true } } },
      },
      adminUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export function getAdminCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export function getAdminDiscounts() {
  return prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
}

export function getAdminHeroSlides() {
  return prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getAllSettings() {
  return prisma.setting.findMany();
}

/** COD store: "customers" aggregated from orders by phone number. */
export async function getAdminCustomers() {
  const groups = await prisma.order.groupBy({
    by: ["shipPhone", "shipName"],
    _count: { _all: true },
    _sum: { grandTotal: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 200,
  });
  return groups.map((g) => ({
    phone: g.shipPhone,
    name: g.shipName,
    orders: g._count._all,
    totalSpent: g._sum.grandTotal ?? 0,
    lastOrderAt: g._max.createdAt,
  }));
}
