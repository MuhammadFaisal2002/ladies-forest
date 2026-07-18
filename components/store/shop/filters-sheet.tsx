"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FilterPanel,
  type FilterPanelProps,
} from "@/components/store/shop/filter-panel";
import { hasActiveFilters } from "@/lib/shop-params";

/** Mobile-only wrapper: the same FilterPanel inside a slide-out sheet. */
export function FiltersSheet(props: FilterPanelProps) {
  const active = hasActiveFilters(props.filters);
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <SlidersHorizontal />
            Filters
            {active && (
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            )}
          </Button>
        }
      />
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <FilterPanel {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
