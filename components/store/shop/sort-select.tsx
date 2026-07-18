"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShopFilters } from "@/lib/queries";
import { filtersToSearch, SORT_VALUES, type SortValue } from "@/lib/shop-params";

const LABELS: Record<SortValue, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

type SortSelectProps = {
  basePath: string;
  filters: ShopFilters;
  /** false on category pages where the slug lives in the path. */
  includeCategory?: boolean;
};

export function SortSelect({
  basePath,
  filters,
  includeCategory = true,
}: SortSelectProps) {
  const router = useRouter();
  const value = filters.sort ?? "featured";

  return (
    <Select
      items={SORT_VALUES.map((v) => ({ value: v, label: LABELS[v] }))}
      value={value}
      onValueChange={(v) => {
        const sort = (v ?? "featured") as SortValue;
        router.push(
          `${basePath}${filtersToSearch({ ...filters, sort, page: 1 }, includeCategory)}`,
          { scroll: false },
        );
      }}
    >
      <SelectTrigger size="sm" aria-label="Sort products">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_VALUES.map((v) => (
          <SelectItem key={v} value={v}>
            {LABELS[v]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
