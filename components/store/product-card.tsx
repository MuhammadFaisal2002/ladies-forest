"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPKR, discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

const CYCLE_MS = 2000;

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  /** Above-the-fold grids should prioritize the first images. */
  priority?: boolean;
};

/**
 * Hover behaviour (owner's call, 2026-07-18): while the cursor stays on the
 * card the photos keep cycling — next image immediately on hover, then the
 * next every 2s, looping. Leaving resets to the first photo. Never zooms.
 */
export function ProductCard({ product, className, priority }: ProductCardProps) {
  const images = product.images;
  const [active, setActive] = useState(0);
  // Extra photos mount only after the first hover, so grids don't preload
  // every image of every product.
  const [warm, setWarm] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => stop, []);

  const handleEnter = () => {
    if (images.length < 2) return;
    setWarm(true);
    setActive(1);
    stop();
    timer.current = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      CYCLE_MS,
    );
  };

  const handleLeave = () => {
    stop();
    setActive(0);
  };

  const off = product.compareAtPrice
    ? discountPercent(product.compareAtPrice, product.price)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("group block", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {(warm ? images : images.slice(0, 1)).map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={i === 0 ? product.title : ""}
            fill
            priority={priority && i === 0}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500 ease-out",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        {/* Cycle position dots — visible only while hovering */}
        {warm && images.length > 1 && (
          <div
            aria-hidden
            className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full bg-white/50 transition-colors duration-200",
                  i === active && "bg-white",
                )}
              />
            ))}
          </div>
        )}

        {off > 0 && !product.outOfStock && (
          <Badge className="absolute left-2 top-2 z-10 bg-primary text-primary-foreground">
            -{off}%
          </Badge>
        )}
        {product.outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
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
