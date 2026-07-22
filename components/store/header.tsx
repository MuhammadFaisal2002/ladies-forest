"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchBox } from "@/components/store/search-box";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeName: string;
  categories: { name: string; slug: string }[];
};

export function Header({ storeName, categories }: HeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openMiniCart = useCartStore((s) => s.openMiniCart);
  const count = mounted ? cartCount(items) : 0;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const links = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left font-heading text-xl">
                {storeName}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base transition-colors hover:bg-accent hover:text-primary",
                    pathname === l.href && "text-primary",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/"
          className="mr-4 shrink-0 font-heading text-2xl tracking-tight"
        >
          Ladies <span className="text-primary">Forest</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === l.href
                  ? "text-primary"
                  : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Search — inline on desktop, full-width bar below header on mobile */}
          {searchOpen ? (
            <>
              <div className="hidden items-center gap-1 sm:flex">
                <SearchBox onClose={() => setSearchOpen(false)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="absolute inset-x-0 top-full z-50 flex items-center gap-2 border-b bg-background p-3 shadow-sm sm:hidden">
                <div className="relative flex-1">
                  <SearchBox mobile onClose={() => setSearchOpen(false)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                className="sm:hidden"
                onClick={() => setSearchOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>
          )}

          {/* Account */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account"
            render={<Link href="/account" />}
          >
            <User className="size-5" />
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            className="relative"
            onClick={openMiniCart}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
