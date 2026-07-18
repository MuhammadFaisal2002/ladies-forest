"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPKR, discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  /** Above-the-fold grids should prioritize the first images. */
  priority?: boolean;
};

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const off = product.compareAtPrice
    ? discountPercent(product.compareAtPrice, product.price)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {/* Hover behaviour: swap to the product's second photo when there is
            one; zoom is only the fallback for single-image products. */}
        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500 ease-out",
              product.hoverImage
                ? "group-hover:opacity-0"
                : "transition-transform group-hover:scale-[1.04]",
            )}
          />
        )}
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="scale-[1.06] object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {off > 0 && !product.outOfStock && (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
            -{off}%
          </Badge>
        )}
        {product.outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium uppercase tracking-wide text-background">
              Out of stock
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 font-sans text-sm font-medium leading-snug">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-semibold",
              off > 0 ? "text-primary" : "text-foreground",
            )}
          >
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice && off > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
