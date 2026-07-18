// Shared between the shop/category server pages and the client filter
// controls: parsing URL search params into ShopFilters and back.
import type { ShopFilters } from "@/lib/queries";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const SORT_VALUES = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
] as const;
export type SortValue = (typeof SORT_VALUES)[number];

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export function parseShopFilters(
  sp: RawSearchParams,
  fixedCategory?: string,
): ShopFilters {
  const num = (v: string | undefined) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  };
  const sort = first(sp.sort) ?? "";
  const page = num(first(sp.page));
  return {
    category: fixedCategory ?? (first(sp.category) || undefined),
    q: first(sp.q)?.trim() || undefined,
    option: first(sp.option) || undefined,
    minPrice: num(first(sp.min)),
    maxPrice: num(first(sp.max)),
    sort: (SORT_VALUES as readonly string[]).includes(sort)
      ? (sort as SortValue)
      : "featured",
    page: page && page > 0 ? page : 1,
  };
}

/**
 * Serializes filters into a query string, dropping defaults so URLs stay
 * clean. `includeCategory: false` for category pages (slug is in the path).
 */
export function filtersToSearch(
  filters: ShopFilters,
  includeCategory = true,
): string {
  const p = new URLSearchParams();
  if (includeCategory && filters.category) p.set("category", filters.category);
  if (filters.q) p.set("q", filters.q);
  if (filters.option) p.set("option", filters.option);
  if (filters.minPrice != null) p.set("min", String(filters.minPrice));
  if (filters.maxPrice != null) p.set("max", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "featured") p.set("sort", filters.sort);
  if (filters.page && filters.page > 1) p.set("page", String(filters.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function hasActiveFilters(filters: ShopFilters): boolean {
  return Boolean(
    filters.category ||
      filters.q ||
      filters.option ||
      filters.minPrice != null ||
      filters.maxPrice != null,
  );
}
