"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Tag, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  placeOrder,
  previewCoupon,
  type CheckoutInput,
} from "@/lib/actions/checkout";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";

type CheckoutFormProps = {
  freeDeliveryThreshold: number;
  shippingFee: number;
};

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
  notes: "",
};

export function CheckoutForm({
  freeDeliveryThreshold,
  shippingFee,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discountTotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, startCoupon] = useTransition();
  const [submitting, startSubmit] = useTransition();

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const discountTotal = coupon?.discountTotal ?? 0;
  const shippingTotal =
    subtotal - discountTotal >= freeDeliveryThreshold ? 0 : shippingFee;
  const grandTotal = subtotal - discountTotal + shippingTotal;
  const remainingForFree = freeDeliveryThreshold - (subtotal - discountTotal);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    startCoupon(async () => {
      const result = await previewCoupon(
        code,
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      );
      if (result.ok) {
        setCoupon({ code, discountTotal: result.discountTotal });
        setCouponError(null);
      } else {
        setCoupon(null);
        setCouponError(result.error);
      }
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startSubmit(async () => {
      const input: CheckoutInput = {
        ...form,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };
      const result = await placeOrder(input);
      if (result.ok) {
        clear();
        router.push(`/order/${result.orderNumber}`);
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        toast.error(result.error);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Add something you love, then come back to check out.
        </p>
        <Button size="lg" className="mt-8 px-6" render={<Link href="/shop" />}>
          Continue shopping
        </Button>
      </div>
    );
  }

  const field = (
    key: keyof FormState,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        aria-invalid={fieldErrors[key] ? true : undefined}
        {...props}
      />
      {fieldErrors[key] && (
        <p className="text-sm text-destructive">{fieldErrors[key]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      {/* Left: address + payment */}
      <div>
        <section aria-label="Delivery details">
          <h2 className="font-sans text-lg font-semibold">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("fullName", "Full name *", {
              autoComplete: "name",
              placeholder: "e.g. Ayesha Khan",
            })}
            {field("phone", "Mobile number *", {
              autoComplete: "tel",
              inputMode: "tel",
              placeholder: "03XX XXXXXXX",
            })}
          </div>
          <div className="mt-4">
            {field("email", "Email (optional)", {
              autoComplete: "email",
              inputMode: "email",
              placeholder: "For your order confirmation",
            })}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="address">Complete address *</Label>
            <Textarea
              id="address"
              rows={3}
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
              aria-invalid={fieldErrors.address ? true : undefined}
              placeholder="House / street / area"
              autoComplete="street-address"
            />
            {fieldErrors.address && (
              <p className="text-sm text-destructive">{fieldErrors.address}</p>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("city", "City *", {
              autoComplete: "address-level2",
              placeholder: "e.g. Lahore",
            })}
            {field("province", "Province (optional)", {
              placeholder: "e.g. Punjab",
            })}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Anything we should know?"
            />
          </div>
        </section>

        <section aria-label="Payment method" className="mt-8">
          <h2 className="font-sans text-lg font-semibold">Payment</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary bg-blush/60 p-4">
            <Wallet className="size-5 shrink-0 text-forest" />
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground">
                Pay in cash when your order arrives at your door.
              </p>
            </div>
            <BadgeCheck className="ml-auto size-5 shrink-0 text-primary" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            JazzCash &amp; Easypaisa coming soon.
          </p>
        </section>
      </div>

      {/* Right: order summary */}
      <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-sans text-lg font-semibold">Your order</h2>

          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute -right-0 -top-0 flex size-5 items-center justify-center rounded-bl-md bg-foreground/80 text-[11px] font-medium text-background">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantTitle}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatPKR(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          {/* Coupon */}
          <div>
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="uppercase placeholder:normal-case"
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={couponPending || !couponInput.trim()}
              >
                {couponPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Tag />
                )}
                Apply
              </Button>
            </div>
            {coupon && (
              <p className="mt-2 flex items-center justify-between text-sm text-forest">
                <span>
                  Coupon <span className="font-medium">{coupon.code}</span>{" "}
                  applied
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                >
                  Remove
                </button>
              </p>
            )}
            {couponError && (
              <p className="mt-2 text-sm text-destructive">{couponError}</p>
            )}
          </div>

          <Separator className="my-4" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPKR(subtotal)}</dd>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-forest">
                <dt>Discount</dt>
                <dd>-{formatPKR(discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className={cn(shippingTotal === 0 && "font-medium text-forest")}>
                {shippingTotal === 0 ? "FREE" : formatPKR(shippingTotal)}
              </dd>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <dt>Total (COD)</dt>
              <dd>{formatPKR(grandTotal)}</dd>
            </div>
          </dl>

          {shippingTotal > 0 && remainingForFree > 0 && (
            <p className="mt-3 flex items-center gap-1.5 rounded-md bg-blush px-3 py-2 text-xs text-muted-foreground">
              <Truck className="size-3.5 shrink-0 text-forest" />
              Add {formatPKR(remainingForFree)} more for free delivery
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            disabled={submitting}
          >
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? "Placing order..." : `Place order — ${formatPKR(grandTotal)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By placing your order you agree to pay the total in cash on
            delivery.
          </p>
        </div>
      </aside>
    </form>
  );
}
