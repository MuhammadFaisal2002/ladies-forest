"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Discount, Prisma } from "@/lib/generated/prisma/client";
import { getSettings } from "@/lib/queries";

// ---------- Validation ----------

const itemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Please enter your full name"),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^(?:\+?92|0)?3\d{9}$/,
          "Enter a valid Pakistani mobile number (03XX XXXXXXX)",
        ),
    ),
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(10, "Please enter your complete address"),
  city: z.string().trim().min(2, "Please enter your city"),
  province: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().optional(),
  items: z.array(itemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// ---------- Coupon core (shared by preview + placeOrder) ----------

type PricedItem = {
  variantId: string;
  quantity: number;
  price: number;
  productId: string;
  categoryId: string | null;
};

function couponEligibleSubtotal(discount: Discount, items: PricedItem[]) {
  const eligible =
    discount.appliesTo === "PRODUCT"
      ? items.filter((i) => i.productId === discount.targetId)
      : discount.appliesTo === "CATEGORY"
        ? items.filter((i) => i.categoryId === discount.targetId)
        : items;
  return eligible.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function resolveCoupon(
  discount: Discount | null,
  items: PricedItem[],
): { ok: true; discountTotal: number } | { ok: false; error: string } {
  if (!discount || !discount.active)
    return { ok: false, error: "This coupon code is not valid" };
  const now = new Date();
  if (discount.startsAt && discount.startsAt > now)
    return { ok: false, error: "This coupon is not active yet" };
  if (discount.endsAt && discount.endsAt < now)
    return { ok: false, error: "This coupon has expired" };
  if (discount.usageLimit != null && discount.usedCount >= discount.usageLimit)
    return { ok: false, error: "This coupon has reached its usage limit" };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (discount.minOrderValue != null && subtotal < discount.minOrderValue)
    return {
      ok: false,
      error: `This coupon needs a minimum order of Rs. ${discount.minOrderValue.toLocaleString("en-PK")}`,
    };

  const eligible = couponEligibleSubtotal(discount, items);
  if (eligible <= 0)
    return {
      ok: false,
      error: "This coupon does not apply to the items in your cart",
    };

  const discountTotal =
    discount.type === "PERCENT"
      ? Math.round((eligible * discount.value) / 100)
      : Math.min(discount.value, eligible);
  return { ok: true, discountTotal };
}

type VariantWithProduct = Prisma.VariantGetPayload<{
  include: { product: true };
}>;

type LoadResult =
  | { error: string }
  | { priced: PricedItem[]; byId: Map<string, VariantWithProduct> };

async function loadPricedItems(
  items: { variantId: string; quantity: number }[],
): Promise<LoadResult> {
  const variants = await prisma.variant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  const priced: PricedItem[] = [];
  for (const item of items) {
    const variant = byId.get(item.variantId);
    if (!variant || variant.product.status !== "ACTIVE") {
      return {
        error: "An item in your cart is no longer available — please remove it and try again.",
      };
    }
    if (variant.stock < item.quantity) {
      return {
        error: `"${variant.product.title} (${variant.title})" has only ${variant.stock} left in stock — please adjust the quantity.`,
      };
    }
    priced.push({
      variantId: variant.id,
      quantity: item.quantity,
      price: variant.price,
      productId: variant.productId,
      categoryId: variant.product.categoryId,
    });
  }
  return { priced, byId };
}

/** Live "Apply coupon" preview on the checkout page. */
export async function previewCoupon(
  code: string,
  items: { variantId: string; quantity: number }[],
): Promise<{ ok: true; discountTotal: number } | { ok: false; error: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "Enter a coupon code" };
  const parsed = z.array(itemSchema).min(1).safeParse(items);
  if (!parsed.success) return { ok: false, error: "Your cart is empty" };

  const loaded = await loadPricedItems(parsed.data);
  if ("error" in loaded) return { ok: false, error: loaded.error };

  const discount = await prisma.discount.findUnique({
    where: { code: normalized },
  });
  return resolveCoupon(discount, loaded.priced);
}

// ---------- Place order ----------

export async function placeOrder(
  input: CheckoutInput,
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  const loaded = await loadPricedItems(data.items);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  const { priced, byId } = loaded;

  const subtotal = priced.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Coupon (optional)
  let discountTotal = 0;
  let discount: Discount | null = null;
  const couponCode = data.couponCode?.trim().toUpperCase();
  if (couponCode) {
    discount = await prisma.discount.findUnique({
      where: { code: couponCode },
    });
    const result = resolveCoupon(discount, priced);
    if (!result.ok) return { ok: false, error: result.error };
    discountTotal = result.discountTotal;
  }

  const settings = await getSettings();
  const shippingTotal =
    subtotal - discountTotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.shippingFee;
  const grandTotal = subtotal - discountTotal + shippingTotal;

  // Transaction: conditional stock decrements (guarding against oversell),
  // order + snapshot items, audit log, coupon usage. Retried a few times in
  // case two orders race for the same order number.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const item of priced) {
          const res = await tx.variant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            throw new Error("OUT_OF_STOCK");
          }
        }

        const count = await tx.order.count();
        const orderNumber = `LF-${1001 + count + attempt}`;

        const created = await tx.order.create({
          data: {
            orderNumber,
            subtotal,
            discountTotal,
            shippingTotal,
            grandTotal,
            couponCode: discountTotal > 0 ? couponCode : null,
            status: "PENDING",
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            shipName: data.fullName,
            shipPhone: data.phone,
            shipEmail: data.email || null,
            shipAddress: data.address,
            shipCity: data.city,
            shipProvince: data.province || null,
            notes: data.notes || null,
            items: {
              create: priced.map((item) => {
                const variant = byId.get(item.variantId)!;
                return {
                  variantId: variant.id,
                  productTitle: variant.product.title,
                  variantTitle: variant.title,
                  sku: variant.sku,
                  image: variant.product.images[0] ?? null,
                  price: item.price,
                  quantity: item.quantity,
                };
              }),
            },
          },
        });

        await tx.stockAdjustment.createMany({
          data: priced.map((item) => ({
            variantId: item.variantId,
            change: -item.quantity,
            reason: `Order ${orderNumber}`,
          })),
        });

        if (discount && discountTotal > 0) {
          await tx.discount.update({
            where: { id: discount.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        return created;
      });

      return { ok: true, orderNumber: order.orderNumber };
    } catch (e) {
      if (e instanceof Error && e.message === "OUT_OF_STOCK") {
        return {
          ok: false,
          error:
            "An item in your cart just sold out — please review your cart and try again.",
        };
      }
      // Unique collision on orderNumber (two orders at once) — retry.
      const code = (e as Prisma.PrismaClientKnownRequestError)?.code;
      if (code === "P2002" && attempt < 2) continue;
      console.error("placeOrder failed:", e);
      return {
        ok: false,
        error: "Something went wrong placing your order — please try again.",
      };
    }
  }
  return {
    ok: false,
    error: "Something went wrong placing your order — please try again.",
  };
}
