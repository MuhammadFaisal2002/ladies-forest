"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: string };

const fail = (error: string): Result => ({ ok: false, error });

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
}

// ---------- Categories ----------

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  description: z.string().trim().optional(),
  bannerImage: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
});

export async function upsertCategory(
  input: z.input<typeof categorySchema>,
): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid category");
  const { id, ...data } = parsed.data;
  const payload = {
    ...data,
    description: data.description || null,
    bannerImage: data.bannerImage || null,
  };
  try {
    if (id) await prisma.category.update({ where: { id }, data: payload });
    else await prisma.category.create({ data: payload });
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string }).code === "P2002")
      return fail("Slug already in use");
    return fail("Failed to save category");
  }
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch {
    return fail("Failed to delete category");
  }
}

// ---------- Discounts ----------

const discountSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(3)
    .transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1),
  minOrderValue: z.number().int().min(0).nullable(),
  usageLimit: z.number().int().min(1).nullable(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  active: z.boolean(),
});

export async function upsertDiscount(
  input: z.input<typeof discountSchema>,
): Promise<Result> {
  await requireAdmin();
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid discount");
  const { id, startsAt, endsAt, ...data } = parsed.data;
  if (data.type === "PERCENT" && data.value > 100)
    return fail("Percent discount cannot exceed 100");
  const payload = {
    ...data,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
  };
  try {
    if (id) await prisma.discount.update({ where: { id }, data: payload });
    else await prisma.discount.create({ data: payload });
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string }).code === "P2002")
      return fail("This code already exists");
    return fail("Failed to save discount");
  }
}

export async function deleteDiscount(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.discount.delete({ where: { id } });
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch {
    return fail("Failed to delete discount");
  }
}

// ---------- Hero slides ----------

const slideSchema = z.object({
  id: z.string().optional(),
  image: z.string().trim().min(1, "Image URL required"),
  heading: z.string().trim().optional(),
  subheading: z.string().trim().optional(),
  ctaText: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export async function upsertHeroSlide(
  input: z.input<typeof slideSchema>,
): Promise<Result> {
  await requireAdmin();
  const parsed = slideSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid slide");
  const { id, ...data } = parsed.data;
  const payload = {
    ...data,
    heading: data.heading || null,
    subheading: data.subheading || null,
    ctaText: data.ctaText || null,
    ctaHref: data.ctaHref || null,
  };
  try {
    if (id) await prisma.heroSlide.update({ where: { id }, data: payload });
    else await prisma.heroSlide.create({ data: payload });
    revalidateStorefront();
    revalidatePath("/admin/cms");
    return { ok: true };
  } catch {
    return fail("Failed to save slide");
  }
}

export async function deleteHeroSlide(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.heroSlide.delete({ where: { id } });
    revalidateStorefront();
    revalidatePath("/admin/cms");
    return { ok: true };
  } catch {
    return fail("Failed to delete slide");
  }
}

// ---------- Settings ----------

const settingsSchema = z.object({
  freeDeliveryThreshold: z.number().int().min(0),
  shippingFee: z.number().int().min(0),
  announcementText: z.string().trim(),
  whatsappNumber: z.string().trim(),
  storeInfo: z.object({
    name: z.string().trim().min(1),
    email: z.string().trim(),
    phone: z.string().trim(),
    address: z.string().trim(),
  }),
  socialLinks: z.object({
    facebook: z.string().trim(),
    instagram: z.string().trim(),
  }),
});

export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<Result> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid settings");

  try {
    const entries = Object.entries(parsed.data);
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object },
        }),
      ),
    );
    revalidateStorefront();
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return fail("Failed to save settings");
  }
}
