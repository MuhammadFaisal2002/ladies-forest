"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPKR } from "@/lib/format";

type SearchResult = {
  slug: string;
  title: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
};

/**
 * Live search: suggestions appear as you type (250ms debounce); Enter goes
 * to the full results page (/shop?q=).
 */
export function SearchBox({
  onClose,
  mobile = false,
}: {
  onClose: () => void;
  /** Full-width layout inside the mobile search bar. */
  mobile?: boolean;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = (await res.json()) as { results?: SearchResult[] };
        setResults(json.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Close the panel when clicking anywhere outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    onClose();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div ref={rootRef} className="relative">
      <form onSubmit={submit}>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder="Search products..."
          aria-label="Search products"
          className={mobile ? "h-10 w-full" : "h-9 w-44 sm:w-64"}
        />
      </form>

      {open && (
        <div
          className={
            mobile
              ? "absolute inset-x-0 top-12 z-50 overflow-hidden rounded-lg border bg-popover shadow-xl"
              : "absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-lg border bg-popover shadow-xl"
          }
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul>
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/product/${r.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        {r.image && (
                          <Image
                            src={r.image}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {r.title}
                        </p>
                        <p className="text-xs">
                          <span className="font-semibold text-primary">
                            {formatPKR(r.price)}
                          </span>
                          {r.compareAtPrice && (
                            <span className="ml-1.5 text-muted-foreground line-through">
                              {formatPKR(r.compareAtPrice)}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="flex w-full items-center justify-center gap-1.5 border-t bg-muted/40 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
              >
                <Search className="size-3.5" />
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No products found for &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
