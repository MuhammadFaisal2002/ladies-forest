import type { Metadata } from "next";
import { ProductListing } from "@/components/store/shop/product-listing";
import { parseShopFilters, type RawSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse every Ladies Forest piece — bras, essentials, jewellery and fragrances. Filter by category, size and price.",
};

type Props = { searchParams: Promise<RawSearchParams> };

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseShopFilters(sp);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-forest">
          The full collection
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl">Shop All</h1>
        {filters.q && (
          <p className="mt-3 text-sm text-muted-foreground">
            Showing results for{" "}
            <span className="font-medium text-foreground">
              &ldquo;{filters.q}&rdquo;
            </span>
          </p>
        )}
      </header>

      <div className="mt-8 md:mt-10">
        <ProductListing basePath="/shop" filters={filters} />
      </div>
    </div>
  );
}
