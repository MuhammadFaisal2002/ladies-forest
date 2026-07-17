// Seeds the database with the real Ladies Forest catalog (pulled from the
// live Shopify store on 2026-07-18) plus default settings, hero slides and a
// sample coupon. Idempotent: wipes and recreates catalog/CMS data on each run.
// NOTE: images hotlink Shopify's CDN for now — migrate to our own storage
// (Cloudinary/UploadThing) before the old store is shut down.
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SIZES = ["32", "34", "36", "38", "40", "42"];

const FOAM_DESC =
  "Indulge in the ultimate in comfort and style with our Women's Foam Bra. Designed with soft, lightweight foam, this bra provides gentle support while accentuating your natural curves.\n\nFabric: Cotton. Provides comfortable support for daily activities, making it a versatile choice for all-day wear. The smooth foam cups offer a seamless look under fitted clothing, perfect for T-shirts and tight tops. The foam padding offers a gentle lift without adding extra weight, ideal for those who prefer a lighter feel.";

const NON_PADDED_DESC =
  "Non-Padded Design: provides natural support and shape. Soft & Breathable Fabric: ensures all-day comfort. Adjustable Straps: offer a secure and customizable fit. Wire-Free Comfort: ideal for long hours of wear.\n\nUses: perfect for everyday wear, work, or lounging. Suitable for pairing with casual and formal outfits. A great addition to your collection for natural and lightweight comfort.\n\nPlease note: colour may vary slightly due to screen settings.";

const CDN = "https://cdn.shopify.com/s/files/1/0958/9620/7675/files";

type SeedProduct = {
  title: string;
  slug: string;
  description: string;
  images: string[];
  basePrice: number;
  compareAtPrice: number | null;
  featured: boolean;
  tags: string[];
  skuPrefix: string;
  cups: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    title: "Soft Cotton Light Padded Bra - Skinny",
    slug: "soft-cotton-light-padded-bra-skinny",
    description: FOAM_DESC,
    images: [
      `${CDN}/IMG_5345.webp?v=1781476895`,
      `${CDN}/IMG_5347.webp?v=1781476895`,
      `${CDN}/IMG_5346.webp?v=1781476895`,
      `${CDN}/IMG_5348.webp?v=1781476895`,
      `${CDN}/IMG_5349.webp?v=1781476895`,
      `${CDN}/IMG_5350.webp?v=1781476895`,
    ],
    basePrice: 480,
    compareAtPrice: 600,
    featured: false,
    tags: ["bra", "cotton", "light padded", "daily wear", "sale"],
    skuPrefix: "SC-SKN",
    cups: ["B"],
  },
  {
    title: "Soft Cotton Light Padded Bra - Mahroon",
    slug: "soft-cotton-light-padded-bra-mahroon",
    description: FOAM_DESC,
    images: [
      `${CDN}/IMG_5354_fcaa9c63-4b3e-4ff9-b161-fed3eb284cdd.webp?v=1781477033`,
      `${CDN}/IMG_5356_4aabef41-1e78-47b4-9c52-fea0f4c276a5.webp?v=1781477033`,
      `${CDN}/IMG_5355_bf6a656d-28c7-4a15-a20f-ad1d63f5e54b.webp?v=1781477033`,
      `${CDN}/IMG_5357_5a9153d0-a68c-4589-b4ca-ceabe9a75fb8.webp?v=1781477033`,
      `${CDN}/IMG_5358_65eb5fa6-04aa-441a-b963-a20318385dad.webp?v=1781477033`,
      `${CDN}/IMG_5359.webp?v=1781477033`,
    ],
    basePrice: 480,
    compareAtPrice: 600,
    featured: false,
    tags: ["bra", "cotton", "light padded", "daily wear", "sale"],
    skuPrefix: "SC-MRN",
    cups: ["B"],
  },
  {
    title: "Soft Cotton Light Padded Bra - Blue",
    slug: "soft-cotton-light-padded-bra-blue",
    description: FOAM_DESC,
    images: [
      `${CDN}/IMG_5333_7a255c78-40cd-4daf-aef9-0143c52a67a6.webp?v=1781477399`,
      `${CDN}/IMG_5336_4529d9a8-b7cb-4bca-9a9c-afe5568ebae7.webp?v=1781477399`,
      `${CDN}/IMG_5340_cc9918f8-b238-4e1d-bcd9-96b595dd4682.webp?v=1781477399`,
      `${CDN}/IMG_5337_03459790-1078-45ae-8150-77f3d06658e1.webp?v=1781477399`,
      `${CDN}/IMG_5341_ea7cb431-b104-427b-a169-c070ece4f5f8.webp?v=1781477399`,
      `${CDN}/IMG_5339_16b947f0-279a-4151-aeb4-8eba16a84399.webp?v=1781477399`,
    ],
    basePrice: 480,
    compareAtPrice: 600,
    featured: false,
    tags: ["bra", "cotton", "light padded", "daily wear", "sale"],
    skuPrefix: "SC-BLU",
    cups: ["B"],
  },
  {
    title: "Soft Cotton Light Padded Bra - Black",
    slug: "soft-cotton-light-padded-bra-black",
    description: FOAM_DESC,
    images: [
      `${CDN}/IMG_5365.webp?v=1781477315`,
      `${CDN}/IMG_5367.webp?v=1781477315`,
      `${CDN}/IMG_5365_20260607230152882.webp?v=1781477316`,
      `${CDN}/IMG_5368.webp?v=1781477315`,
      `${CDN}/IMG_5369.webp?v=1781477315`,
    ],
    basePrice: 480,
    compareAtPrice: 600,
    featured: false,
    tags: ["bra", "cotton", "light padded", "daily wear", "sale"],
    skuPrefix: "SC-BLK",
    cups: ["B"],
  },
  {
    title: "Maroon Non-Padded Bra For Women FG LB24",
    slug: "maroon-non-padded-bra-for-women-fg-lb24",
    description: NON_PADDED_DESC,
    images: [
      `${CDN}/1_a4fcfdab-7a9e-4271-9655-21b6258de0e2.jpg?v=1778426652`,
      `${CDN}/2_131919e2-f2a8-4aab-879f-9e701318af38.jpg?v=1778426652`,
      `${CDN}/11_2e8ca71f-738c-4bec-b260-c1cfb72e6936.jpg?v=1778426651`,
    ],
    basePrice: 899,
    compareAtPrice: null,
    featured: true,
    tags: ["bra", "non padded", "wire-free", "best-selling"],
    skuPrefix: "LB24-MRN",
    cups: ["B", "D"],
  },
  {
    title: "Pink Non-Padded Bra For Women FG LB23",
    slug: "pink-non-padded-bra-for-women-fg-lb23",
    description: NON_PADDED_DESC,
    images: [
      `${CDN}/1_8bfa436b-a4b6-419c-8a8b-bf963b4946d0.jpg?v=1778426695`,
      `${CDN}/2_8f80fc21-efce-4775-b550-20a167049e69.jpg?v=1778426695`,
      `${CDN}/11_8a17f827-5ea7-476f-a4c1-045bedf59497.jpg?v=1778426694`,
    ],
    basePrice: 899,
    compareAtPrice: null,
    featured: true,
    tags: ["bra", "non padded", "wire-free", "best-selling"],
    skuPrefix: "LB23-PNK",
    cups: ["B", "D"],
  },
  {
    title: "Skin Bra For Women FG LB21",
    slug: "skin-bra-for-women-fg-lb21",
    description: FOAM_DESC,
    images: [
      `${CDN}/4_e7174ce1-6f17-4288-995d-19c961e6933c.jpg?v=1778427969`,
      `${CDN}/6_00e1c6dc-728d-4a26-853e-14fc290f7dbe.jpg?v=1778427969`,
      `${CDN}/5_794f110f-463f-40fa-83af-d66a5f0b4706.jpg?v=1778427969`,
      `${CDN}/11_ab4a2d51-da7e-4f3d-9a17-60f36bd792f2.jpg?v=1778427969`,
      `${CDN}/Women_sBraSizeChart_Simple_477f121e-d5cf-4da5-ba52-615d9bbccd41.jpg?v=1778427969`,
    ],
    basePrice: 899,
    compareAtPrice: null,
    featured: true,
    tags: ["bra", "cotton", "daily wear", "best-selling"],
    skuPrefix: "LB21-SKN",
    cups: ["B", "D"],
  },
  {
    title: "Black Bra For Women FG LB20",
    slug: "black-bra-for-women-fg-lb20",
    description: FOAM_DESC,
    images: [
      `${CDN}/1_b568691b-ba76-422c-9c37-fee7b165b5f1.jpg?v=1778428077`,
      `${CDN}/2_96fbae8f-7f1c-43d7-ba27-a1389b7c64c9.jpg?v=1778428077`,
      `${CDN}/3_a2c55d03-601d-48a4-ba60-8dc84e802819.jpg?v=1778428077`,
      `${CDN}/11_8008c9fb-96ad-4a84-af95-25f71214baf2.jpg?v=1778428077`,
      `${CDN}/Women_sBraSizeChart_Simple_15a8b7e0-8ee1-44ba-9c3f-64062ee3397d.jpg?v=1778428077`,
    ],
    basePrice: 899,
    compareAtPrice: null,
    featured: true,
    tags: ["bra", "cotton", "daily wear", "best-selling"],
    skuPrefix: "LB20-BLK",
    cups: ["B", "D"],
  },
];

// Deterministic stock spread so the storefront can demo low-stock ("only 3
// left") and out-of-stock states without randomness.
const STOCKS = [12, 8, 25, 3, 0, 18, 6, 22, 4, 15, 9, 30];

async function main() {
  console.log("Wiping catalog & CMS data...");
  await prisma.stockAdjustment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.heroSlide.deleteMany();

  console.log("Creating categories...");
  const bras = await prisma.category.create({
    data: {
      name: "Bras & Essentials",
      slug: "bras",
      description: "Comfortable & stylish bras for every day.",
      sortOrder: 0,
    },
  });
  await prisma.category.create({
    data: {
      name: "Fragrances",
      slug: "fragrances",
      description: "Signature fragrances that stay with you.",
      sortOrder: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Jewellery",
      slug: "jewellery",
      description: "Forever shine jewellery for every occasion.",
      sortOrder: 2,
    },
  });

  console.log("Creating products with options & variants...");
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        images: p.images,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        status: "ACTIVE",
        featured: p.featured,
        tags: p.tags,
        categoryId: bras.id,
        options: {
          create: [
            { name: "Size", values: SIZES, sortOrder: 0 },
            { name: "Cup Size", values: p.cups, sortOrder: 1 },
          ],
        },
      },
    });

    let i = 0;
    for (const size of SIZES) {
      for (const cup of p.cups) {
        await prisma.variant.create({
          data: {
            productId: product.id,
            optionValues: { Size: size, "Cup Size": cup },
            title: `${size} / ${cup}`,
            sku: `${p.skuPrefix}-${size}-${cup}`,
            price: p.basePrice,
            stock: STOCKS[i % STOCKS.length],
            lowStockThreshold: 5,
          },
        });
        i++;
      }
    }
  }

  console.log("Creating settings...");
  const settings: Record<string, unknown> = {
    freeDeliveryThreshold: 3000,
    shippingFee: 250,
    announcementText: "Flat 20% OFF — Free Delivery on Orders Over Rs. 3,000",
    storeInfo: {
      name: "Ladies Forest",
      email: "info@ladiesforest.com",
      phone: "",
      address: "Pakistan",
    },
    whatsappNumber: "",
    socialLinks: {
      facebook: "https://www.facebook.com/ladiesforest",
      instagram: "https://www.instagram.com/ladiesforest",
    },
    paymentMethodsEnabled: { COD: true, JAZZCASH: false, EASYPAISA: false },
    seoDefaults: {
      title: "Ladies Forest — Women's Essentials, Jewellery & Fragrances",
      description:
        "Comfortable & stylish women's essentials, forever-shine jewellery and signature fragrances. Free delivery across Pakistan on orders over Rs. 3,000.",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  console.log("Creating hero slides...");
  await prisma.heroSlide.createMany({
    data: [
      {
        image: `${CDN}/IMG_5345.webp?v=1781476895`,
        heading: "Comfort You Can Live In",
        subheading: "Soft cotton bras designed for all-day ease — now 20% off",
        ctaText: "Shop Bestsellers",
        ctaHref: "/shop",
        sortOrder: 0,
      },
      {
        image: `${CDN}/1_8bfa436b-a4b6-419c-8a8b-bf963b4946d0.jpg?v=1778426695`,
        heading: "Wire-Free. Worry-Free.",
        subheading: "Non-padded comfort for long hours of wear",
        ctaText: "Explore Collection",
        ctaHref: "/category/bras",
        sortOrder: 1,
      },
    ],
  });

  console.log("Creating sample coupon...");
  await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderValue: 1500,
      appliesTo: "ALL",
      active: true,
    },
  });

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.variant.count(),
    settings: await prisma.setting.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
