"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCartStore,
  cartSubtotal,
  cartCount,
  type CartItem,
} from "@/lib/cart-store";
import { formatPKR } from "@/lib/format";

type CartViewProps = {
  freeDeliveryThreshold: number;
  shippingFee: number;
};

export function CartView({ freeDeliveryThreshold, shippingFee }: CartViewProps) {
  // Cart lives in localStorage (zustand persist) — render only after mount
  // to avoid a server/client hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <CartSkeleton />;

  if (items.length === 0) return <EmptyCart />;

  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl md:text-4xl">Your Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {count} {count === 1 ? "item" : "items"} in your bag
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        {/* Item rows */}
        <div>
          {items.map((item) => (
            <CartRow key={item.variantId} item={item} />
          ))}
        </div>

        <OrderSummary
          subtotal={subtotal}
          freeDeliveryThreshold={freeDeliveryThreshold}
          shippingFee={shippingFee}
        />
      </div>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4 border-b py-5 first:pt-0">
      <Link
        href={`/product/${item.slug}`}
        className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${item.slug}`}
            className="line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-primary"
          >
            {item.title}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${item.title}`}
            className="-mr-1.5 -mt-1 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.variantId)}
          >
            <Trash2 />
          </Button>
        </div>

        {item.variantTitle !== "Default" && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.variantTitle}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPKR(item.price)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
            >
              <Minus />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Increase quantity"
              disabled={item.quantity >= item.stock}
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
          <span className="font-semibold">
            {formatPKR(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  subtotal,
  freeDeliveryThreshold,
  shippingFee,
}: {
  subtotal: number;
  freeDeliveryThreshold: number;
  shippingFee: number;
}) {
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress =
    freeDeliveryThreshold > 0
      ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100)
      : 100;
  const total = subtotal + (isFreeDelivery ? 0 : shippingFee);

  return (
    <div className="sticky top-24 rounded-xl border p-6">
      <h2 className="text-xl">Order Summary</h2>

      {/* Free delivery progress — same pattern as the mini-cart */}
      {freeDeliveryThreshold > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm">
            {remaining > 0 ? (
              <>
                Add{" "}
                <span className="font-semibold text-primary">
                  {formatPKR(remaining)}
                </span>{" "}
                more for{" "}
                <span className="font-semibold text-forest">FREE delivery</span>
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

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPKR(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Delivery</span>
          {isFreeDelivery ? (
            <span className="font-medium text-forest">FREE</span>
          ) : (
            <span className="font-medium">{formatPKR(shippingFee)}</span>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatPKR(total)}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Cash on Delivery available across Pakistan.
      </p>

      <Button
        size="lg"
        className="mt-5 w-full"
        render={<Link href="/checkout" />}
      >
        Checkout
      </Button>
      <div className="mt-3 text-center">
        <Link
          href="/shop"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-blush">
        <ShoppingBag className="size-7 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl md:text-4xl">Your cart is empty</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Comfort you can live in is just a click away — go find your new
        favourites.
      </p>
      <Button size="lg" className="mt-8" render={<Link href="/shop" />}>
        Start Shopping
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <Skeleton className="h-9 w-44" />
      <Skeleton className="mt-3 h-4 w-28" />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="aspect-[3/4] w-24 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
