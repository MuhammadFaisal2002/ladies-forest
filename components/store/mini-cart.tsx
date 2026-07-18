"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { formatPKR } from "@/lib/format";

export function MiniCart({ freeDeliveryThreshold }: { freeDeliveryThreshold: number }) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isMiniCartOpen);
  const closeMiniCart = useCartStore((s) => s.closeMiniCart);
  const openMiniCart = useCartStore((s) => s.openMiniCart);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress =
    freeDeliveryThreshold > 0
      ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100)
      : 100;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openMiniCart() : closeMiniCart())}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button
              size="lg"
              onClick={closeMiniCart}
              render={<Link href="/shop" />}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {freeDeliveryThreshold > 0 && (
              <div className="px-4">
                <p className="mb-2 text-sm">
                  {remaining > 0 ? (
                    <>
                      Add <span className="font-semibold text-primary">{formatPKR(remaining)}</span>{" "}
                      more for <span className="font-semibold text-forest">FREE delivery</span>
                    </>
                  ) : (
                    <span className="font-semibold text-forest">
                      🎉 You&apos;ve unlocked FREE delivery!
                    </span>
                  )}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-forest transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeMiniCart}
                    className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                    {item.variantTitle !== "Default" && (
                      <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                    )}
                    <p className="mt-0.5 text-sm font-semibold text-primary">
                      {formatPKR(item.price)}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove item"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-semibold">{formatPKR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout. Cash on Delivery available.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={closeMiniCart}
                render={<Link href="/checkout" />}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={closeMiniCart}
                render={<Link href="/cart" />}
              >
                View Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
