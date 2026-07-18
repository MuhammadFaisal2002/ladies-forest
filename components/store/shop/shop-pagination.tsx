import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { ShopFilters } from "@/lib/queries";
import { filtersToSearch } from "@/lib/shop-params";
import { cn } from "@/lib/utils";

type ShopPaginationProps = {
  basePath: string;
  filters: ShopFilters;
  page: number;
  pages: number;
  includeCategory?: boolean;
};

export function ShopPagination({
  basePath,
  filters,
  page,
  pages,
  includeCategory = true,
}: ShopPaginationProps) {
  if (pages <= 1) return null;

  const href = (p: number) =>
    `${basePath}${filtersToSearch({ ...filters, page: p }, includeCategory)}`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          aria-label="Previous page"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            buttonVariants({
              variant: p === page ? "default" : "ghost",
              size: "icon-sm",
            }),
            "tabular-nums",
          )}
        >
          {p}
        </Link>
      ))}
      {page < pages && (
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
