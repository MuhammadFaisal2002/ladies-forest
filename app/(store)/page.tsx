import Link from "next/link";
import { BadgeCheck, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { CategoryShowcase } from "@/components/store/home/category-showcase";
import { HeroSlider } from "@/components/store/home/hero-slider";
import { SectionHeading } from "@/components/store/home/section-heading";
import { formatPKR } from "@/lib/format";
import {
  getCategories,
  getFeaturedProducts,
  getHeroSlides,
  getNewArrivals,
  getSaleProducts,
  getSettings,
} from "@/lib/queries";

export const revalidate = 60;

const PRODUCT_GRID =
  "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6";

export default async function HomePage() {
  const [slides, settings, categories, featured, saleProducts, newArrivals] =
    await Promise.all([
      getHeroSlides(),
      getSettings(),
      getCategories(),
      getFeaturedProducts(8),
      getSaleProducts(4),
      getNewArrivals(8),
    ]);

  const heroSlides = slides.map((s) => ({
    id: s.id,
    image: s.image,
    heading: s.heading,
    subheading: s.subheading,
    ctaText: s.ctaText,
    ctaHref: s.ctaHref,
  }));

  const categoryTiles = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));

  const trustItems = [
    {
      icon: Truck,
      label: `Free delivery over ${formatPKR(settings.freeDeliveryThreshold)}`,
    },
    { icon: BadgeCheck, label: "Cash on Delivery" },
    { icon: RotateCcw, label: "Easy returns" },
  ];

  return (
    <>
      {/* 1 — Hero */}
      {heroSlides.length > 0 ? (
        <HeroSlider slides={heroSlides} />
      ) : (
        <section className="flex h-[70vh] max-h-[640px] min-h-[420px] flex-col items-center justify-center bg-blush px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            {settings.storeInfo.name}
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl">
            Comfort you can live in
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Everyday essentials, forever-shine jewellery and signature
            fragrances — delivered across Pakistan.
          </p>
          <Button size="lg" className="mt-8 px-6" render={<Link href="/shop" />}>
            Shop now
          </Button>
        </section>
      )}

      {/* 2 — Trust strip */}
      <section className="bg-blush">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-4 py-4 sm:px-6 lg:px-8">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:gap-2"
            >
              <Icon className="size-4 shrink-0 text-forest" aria-hidden />
              <span className="text-xs font-medium text-foreground/80 sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — Shop by category */}
      {categoryTiles.length > 0 && (
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Curated for you"
                title="Shop by Category"
                subtitle="Three edits, one promise — pieces you'll reach for every day."
              />
            </Reveal>
            <div className="mt-10 md:mt-12">
              <CategoryShowcase categories={categoryTiles} />
            </div>
          </div>
        </section>
      )}

      {/* 4 — Bestsellers */}
      {featured.length > 0 && (
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Customer favourites"
                title="Bestsellers"
                subtitle="The pieces our customers keep coming back for."
              />
            </Reveal>
            <Reveal stagger className={`mt-10 md:mt-12 ${PRODUCT_GRID}`}>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Reveal>
            <Reveal className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="px-6"
                render={<Link href="/shop" />}
              >
                View all
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* 5 — Sale band (skipped entirely when nothing is on sale) */}
      {saleProducts.length > 0 && (
        <section className="bg-blush py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Limited time"
                accent="primary"
                title="On Sale"
                subtitle="Loved styles, lighter prices — while they last."
              />
            </Reveal>
            <Reveal stagger className={`mt-10 md:mt-12 ${PRODUCT_GRID}`}>
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 6 — New arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Just landed"
                title="New Arrivals"
                subtitle="Fresh additions to the forest — straight from this week."
              />
            </Reveal>
            <Reveal stagger className={`mt-10 md:mt-12 ${PRODUCT_GRID}`}>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 7 — Brand promise */}
      <section className="bg-forest py-16 text-forest-foreground md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-forest-foreground/70">
              The Ladies Forest promise
            </p>
            <h2 className="mt-3 text-3xl text-forest-foreground md:text-4xl">
              Essentials made for every day
            </h2>
            <p className="mt-4 text-sm text-forest-foreground/80 md:text-base">
              Thoughtfully chosen fits, honest prices and cash on delivery
              across Pakistan — so you can shop with complete peace of mind.
            </p>
            <Button
              size="lg"
              className="mt-8 px-6"
              render={<Link href="/shop" />}
            >
              Shop the collection
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
