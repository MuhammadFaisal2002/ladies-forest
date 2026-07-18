import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout/checkout-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Secure checkout with Cash on Delivery across Pakistan — free delivery on orders over Rs. 3,000.",
};

export const revalidate = 60;

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-forest">
          Almost there
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl">Checkout</h1>
      </header>

      <div className="mt-8 md:mt-10">
        <CheckoutForm
          freeDeliveryThreshold={settings.freeDeliveryThreshold}
          shippingFee={settings.shippingFee}
        />
      </div>
    </div>
  );
}
