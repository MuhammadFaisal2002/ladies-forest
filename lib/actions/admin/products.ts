"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { variantTitle } from "@/lib/format";

const optionSchema = z.object({
  name: z.string().trim().min(1, "Option name required").max(30),
  values: z.array(z.string().trim().min(1)).min(1, "Add at least one value"),
});

const variantSchema = z.object({
  id: z.string().optional(),
  optionValues: z.record(z.string(), z.string()),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  price: z.number().int().min(0),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
});

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Title is too short"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().trim(),
  images: z.array(z.string().trim().min(1)),
  basePrice: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullable(),
  categoryId: z.string().nullable(),
  status: z.enum(["ACTIVE", "DRAFT"]),
  featured: z.boolean(),
  tags: z.array(z.string().trim().min(1)),
  options: z.array(optionSchema).max(3, "Maximum 3 options"),
  variants: z.array(variantSchema).min(1, "At least one variant required"),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function revalidateStorefront(slug: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
}

export async function upsertProduct(
  input: ProductInput,
): Promise<ProductActionResult> {
  const session = await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product data",
    };
  }
  const data = parsed.data;

  // Slug must be unique (excluding the product being edited)
  const clash = await prisma.product.findFirst({
    where: { slug: data.slug, ...(data.id ? { id: { not: data.id } } : {}) },
    select: { id: true },
  });
  if (clash) return { ok: false, error: "This slug is already in use" };

  const productData = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    images: data.images,
    basePrice: data.basePrice,
    compareAtPrice: data.compareAtPrice,
    categoryId: data.categoryId,
    status: data.status,
    featured: data.featured,
    tags: data.tags,
  };

  try {
    const productId = await prisma.$transaction(async (tx) => {
      const product = data.id
        ? await tx.product.update({ where: { id: data.id }, data: productData })
        : await tx.product.create({ data: productData });

      // Options: simplest correct reconciliation — replace the set.
      await tx.productOption.deleteMany({ where: { productId: product.id } });
      if (data.options.length) {
        await tx.productOption.createMany({
          data: data.options.map((o, i) => ({
            productId: product.id,
            name: o.name,
            values: o.values,
            sortOrder: i,
          })),
        });
      }

      // Variants: update matched ids, create new, delete removed.
      const existing = await tx.variant.findMany({
        where: { productId: product.id },
      });
      const existingById = new Map(existing.map((v) => [v.id, v]));
      const incomingIds = new Set(
        data.variants.map((v) => v.id).filter(Boolean),
      );

      const toDelete = existing.filter((v) => !incomingIds.has(v.id));
      if (toDelete.length) {
        await tx.variant.deleteMany({
          where: { id: { in: toDelete.map((v) => v.id) } },
        });
      }

      for (const v of data.variants) {
        const payload = {
          optionValues: v.optionValues,
          title: variantTitle(v.optionValues),
          sku: v.sku || null,
          price: v.price,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold,
        };
        const current = v.id ? existingById.get(v.id) : undefined;
        if (current) {
          await tx.variant.update({ where: { id: current.id }, data: payload });
          if (current.stock !== v.stock) {
            await tx.stockAdjustment.create({
              data: {
                variantId: current.id,
                change: v.stock - current.stock,
                reason: "Manual edit (product form)",
                adminUserId: session.sub,
              },
            });
          }
        } else {
          const created = await tx.variant.create({
            data: { ...payload, productId: product.id },
          });
          if (v.stock > 0) {
            await tx.stockAdjustment.create({
              data: {
                variantId: created.id,
                change: v.stock,
                reason: "Initial stock",
                adminUserId: session.sub,
              },
            });
          }
        }
      }

      return product.id;
    });

    revalidateStorefront(data.slug);
    revalidatePath("/admin/products");
    return { ok: true, id: productId };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return { ok: false, error: "Duplicate SKU or slug" };
    console.error("upsertProduct failed:", e);
    return { ok: false, error: "Failed to save the product — try again" };
  }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  await requireAdmin();
  try {
    const product = await prisma.product.delete({ where: { id } });
    revalidateStorefront(product.slug);
    revalidatePath("/admin/products");
    return { ok: true, id };
  } catch (e) {
    console.error("deleteProduct failed:", e);
    return { ok: false, error: "Failed to delete the product" };
  }
}
