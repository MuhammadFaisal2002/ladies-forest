import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/store/shop/product-listing";
import { getCategoryBySlug } from "@/lib/queries";
import { parseShopFilters, type RawSearchParams } from "@/lib/shop-params";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} at Ladies Forest — free delivery across Pakistan on orders over Rs. 3,000.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseShopFilters(sp, slug);

  return (
    <div>
      {/* Category banner: image when set in admin, brand gradient otherwise */}
      <section className="relative overflow-hidden bg-blush">
        {category.bannerImage && (
          <>
            <Image
              src={category.bannerImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </>
        )}
        <div
          className={`relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8 ${
            category.bannerImage ? "text-white" : ""
          }`}
        >
          <p
            className={`text-xs uppercase tracking-[0.3em] ${
              category.bannerImage ? "text-white/80" : "text-forest"
            }`}
          >
            Ladies Forest
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl">{category.name}</h1>
          {category.description && (
            <p
              className={`mx-auto mt-3 max-w-md text-sm md:text-base ${
                category.bannerImage ? "text-white/85" : "text-muted-foreground"
              }`}
            >
              {category.description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <ProductListing
          basePath={`/category/${slug}`}
          filters={filters}
          showCategoryFilter={false}
        />
      </div>
    </div>
  );
}
