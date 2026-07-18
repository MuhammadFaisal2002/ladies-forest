// Verifies the E2E checkout result: order row, snapshots, stock decrement,
// audit log and coupon usage. Run: npx tsx scripts/verify-order.ts LF-1001
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const orderNumber = process.argv[2] ?? "LF-1001";
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) throw new Error(`Order ${orderNumber} not found`);

  console.log("ORDER:", {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    grandTotal: order.grandTotal,
    couponCode: order.couponCode,
    shipName: order.shipName,
    shipPhone: order.shipPhone,
    shipCity: order.shipCity,
  });
  console.log(
    "ITEMS:",
    order.items.map((i) => ({
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      sku: i.sku,
      price: i.price,
      quantity: i.quantity,
    })),
  );

  const variantIds = order.items
    .map((i) => i.variantId)
    .filter((v): v is string => Boolean(v));
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    select: { sku: true, stock: true },
  });
  console.log("VARIANT STOCK NOW:", variants);

  const adjustments = await prisma.stockAdjustment.findMany({
    where: { reason: `Order ${orderNumber}` },
    select: { change: true, reason: true },
  });
  console.log("STOCK ADJUSTMENTS:", adjustments);

  const coupon = await prisma.discount.findUnique({
    where: { code: "WELCOME10" },
    select: { code: true, usedCount: true },
  });
  console.log("COUPON:", coupon);

  await prisma.$disconnect();
}

main();
