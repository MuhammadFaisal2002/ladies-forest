"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPKR } from "@/lib/format";
import type { ShopFilters } from "@/lib/queries";
import { filtersToSearch, hasActiveFilters } from "@/lib/shop-params";
import { cn } from "@/lib/utils";

export type FilterPanelProps = {
  basePath: string;
  filters: ShopFilters;
  /** Omit to hide the category section (category pages). */
  categories?: { name: string; slug: string }[];
  options: { name: string; values: string[] }[];
  priceRange: { min: number; max: number };
};

/**
 * Filter controls driven entirely by the URL: every change navigates to
 * basePath with updated search params and resets to page 1, so the server
 * refetches and the state stays shareable/bookmarkable.
 */
export function FilterPanel({
  basePath,
  filters,
  categories,
  options,
  priceRange,
}: FilterPanelProps) {
  const router = useRouter();
  const [minInput, setMinInput] = useState(filters.minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(filters.maxPrice?.toString() ?? "");

  useEffect(() => {
    setMinInput(filters.minPrice?.toString() ?? "");
    setMaxInput(filters.maxPrice?.toString() ?? "");
  }, [filters.minPrice, filters.maxPrice]);

  const apply = (patch: Partial<ShopFilters>) => {
    const next = { ...filters, ...patch, page: 1 };
    router.push(`${basePath}${filtersToSearch(next, Boolean(categories))}`, {
      scroll: false,
    });
  };

  const applyPrice = () => {
    const min = minInput ? Number(minInput) : undefined;
    const max = maxInput ? Number(maxInput) : undefined;
    apply({
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
    });
  };

  return (
    <div className="space-y-7">
      {categories && categories.length > 0 && (
        <section aria-label="Category">
          <h3 className="font-sans text-sm font-semibold">Category</h3>
          <ul className="mt-3 space-y-1.5">
            {categories.map((c) => {
              const active = filters.category === c.slug;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      apply({ category: active ? undefined : c.slug })
                    }
                    className={cn(
                      "text-sm transition-colors duration-150 hover:text-primary",
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {options.map((option) => (
        <section key={option.name} aria-label={option.name}>
          <h3 className="font-sans text-sm font-semibold">{option.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = filters.option === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply({ option: active ? undefined : value })}
                  className={cn(
                    "min-w-10 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/60",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section aria-label="Price">
        <h3 className="font-sans text-sm font-semibold">Price</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatPKR(priceRange.min)} – {formatPKR(priceRange.max)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={applyPrice}
        >
          Apply price
        </Button>
      </section>

      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() =>
            apply({
              category: categories ? undefined : filters.category,
              q: undefined,
              option: undefined,
              minPrice: undefined,
              maxPrice: undefined,
            })
          }
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
