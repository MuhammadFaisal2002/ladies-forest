import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/store/reveal";

export type CategoryTileData = {
  name: string;
  slug: string;
  description: string | null;
};

/** Elegant gradient tiles for the "Shop by category" section (no banner images). */
export function CategoryShowcase({
  categories,
}: {
  categories: CategoryTileData[];
}) {
  return (
    <Reveal stagger className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="group relative flex min-h-52 flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-blush to-secondary p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-10 select-none font-heading text-[10rem] leading-none text-primary/[0.07] transition-transform duration-500 group-hover:scale-105"
          >
            {category.name.charAt(0).toUpperCase()}
          </span>
          <h3 className="relative text-2xl">{category.name}</h3>
          {category.description && (
            <p className="relative mt-2 line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
          <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Shop now
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </Reveal>
  );
}
