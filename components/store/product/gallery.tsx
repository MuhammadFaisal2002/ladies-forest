"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  /** Gallery images only — size-chart images are filtered out by the page. */
  images: string[];
  title: string;
};

/**
 * Product image gallery: main image with CSS crossfade between shots,
 * subtle hover zoom, and a thumbnail rail (active thumb ring-primary).
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[3/4] rounded-lg bg-muted" />;
  }

  return (
    <div>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {images.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={i === active ? title : ""}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-300 group-hover:scale-105",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md bg-muted transition-opacity duration-150 sm:w-20",
                i === active
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
