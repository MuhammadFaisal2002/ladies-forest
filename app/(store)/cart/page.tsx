import type { Metadata } from "next";
import { CartView } from "@/components/store/cart/cart-view";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Your Cart — Ladies Forest",
  description:
    "Review your bag before checkout. Cash on Delivery available across Pakistan.",
};

// Settings (free-delivery threshold, shipping fee) refresh at most every 60s.
export const revalidate = 60;

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <CartView
      freeDeliveryThreshold={settings.freeDeliveryThreshold}
      shippingFee={settings.shippingFee}
    />
  );
}
