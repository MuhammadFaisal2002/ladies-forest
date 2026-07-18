import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, MapPin, Phone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/format";
import { getOrderByNumber } from "@/lib/queries";

// Always render fresh: the owner updates order status from the admin panel.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}`, robots: { index: false } };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      {/* Success header */}
      <header className="text-center">
        <CircleCheck className="mx-auto size-14 text-forest" aria-hidden />
        <h1 className="mt-4 text-3xl md:text-4xl">Shukriya! Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Your order number is{" "}
          <span className="font-semibold text-foreground">
            {order.orderNumber}
          </span>
          {" — "}save it to track your order.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Status:{" "}
          <span className="font-medium text-forest">
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </p>
      </header>

      {/* COD reminder */}
      <div className="mt-8 flex items-center gap-3 rounded-lg bg-blush p-4">
        <Wallet className="size-5 shrink-0 text-forest" />
        <p className="text-sm">
          <span className="font-medium">Cash on Delivery:</span> please keep{" "}
          <span className="font-semibold text-primary">
            {formatPKR(order.grandTotal)}
          </span>{" "}
          ready — our rider will collect it at your door within 2–4 working
          days.
        </p>
      </div>

      {/* Items */}
      <section aria-label="Items" className="mt-8 rounded-xl border bg-card p-5">
        <h2 className="font-sans text-lg font-semibold">Your items</h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">
                  {item.productTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.variantTitle} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium">
                {formatPKR(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPKR(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-forest">
              <dt>
                Discount
                {order.couponCode && (
                  <span className="ml-1 text-xs">({order.couponCode})</span>
                )}
              </dt>
              <dd>-{formatPKR(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>
              {order.shippingTotal === 0
                ? "FREE"
                : formatPKR(order.shippingTotal)}
            </dd>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPKR(order.grandTotal)}</dd>
          </div>
        </dl>
      </section>

      {/* Delivery address */}
      <section
        aria-label="Delivery address"
        className="mt-6 rounded-xl border bg-card p-5"
      >
        <h2 className="font-sans text-lg font-semibold">Delivering to</h2>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{order.shipName}</p>
          <p className="flex items-center gap-1.5">
            <Phone className="size-3.5" /> {order.shipPhone}
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {order.shipAddress}, {order.shipCity}
              {order.shipProvince ? `, ${order.shipProvince}` : ""}
            </span>
          </p>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Button size="lg" className="px-6" render={<Link href="/shop" />}>
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
