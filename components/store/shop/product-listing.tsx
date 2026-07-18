import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { FilterPanel } from "@/components/store/shop/filter-panel";
import { FiltersSheet } from "@/components/store/shop/filters-sheet";
import { ShopPagination } from "@/components/store/shop/shop-pagination";
import { SortSelect } from "@/components/store/shop/sort-select";
import {
  getCategories,
  getFilterOptions,
  getPriceRange,
  getShopProducts,
  type ShopFilters,
} from "@/lib/queries";

const PRODUCT_GRID =
  "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4";

type ProductListingProps = {
  basePath: string;
  filters: ShopFilters;
  /** true on /shop; false on category pages (category fixed by the path). */
  showCategoryFilter?: boolean;
};

/**
 * Server-rendered listing shared by /shop and /category/[slug]: filter
 * sidebar (sheet on mobile), sort, product grid and pagination — all state
 * lives in the URL.
 */
export async function ProductListing({
  basePath,
  filters,
  showCategoryFilter = true,
}: ProductListingProps) {
  const [result, options, priceRange, categories] = await Promise.all([
    getShopProducts(filters),
    getFilterOptions(filters.category),
    getPriceRange(filters.category),
    showCategoryFilter ? getCategories() : Promise.resolve(null),
  ]);

  const panelProps = {
    basePath,
    filters,
    categories: categories?.map((c) => ({ name: c.name, slug: c.slug })),
    options: options.map((o) => ({
      name: o.name,
      values: [...o.values].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    })),
    priceRange,
  };

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside className="hidden lg:block" aria-label="Filters">
        <FilterPanel {...panelProps} />
      </aside>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <FiltersSheet {...panelProps} />
            </div>
            <SortSelect
              basePath={basePath}
              filters={filters}
              includeCategory={showCategoryFilter}
            />
          </div>
        </div>

        {result.products.length > 0 ? (
          <Reveal stagger className={`mt-6 ${PRODUCT_GRID}`}>
            {result.products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </Reveal>
        ) : (
          <div className="mt-6 rounded-lg bg-blush px-6 py-16 text-center">
            <h2 className="text-2xl">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              No products match your selection. Try removing a filter — or
              check back soon, new pieces are always arriving.
            </p>
          </div>
        )}

        <ShopPagination
          basePath={basePath}
          filters={filters}
          page={result.page}
          pages={result.pages}
          includeCategory={showCategoryFilter}
        />
      </div>
    </div>
  );
}
