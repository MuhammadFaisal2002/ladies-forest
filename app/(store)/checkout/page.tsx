import type { Metadata } from "next";
import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout — Ladies Forest",
  description: "Secure checkout with Cash on Delivery — coming soon.",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">
        Almost there
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl">Checkout is coming soon</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We&apos;re putting the finishing touches on secure checkout with Cash
        on Delivery.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-1.5 text-xs font-medium text-forest-foreground">
        <Truck className="size-3.5" />
        Cash on Delivery across Pakistan
      </div>

      <Button size="lg" className="mt-10" render={<Link href="/cart" />}>
        Back to cart
      </Button>
    </section>
  );
}
