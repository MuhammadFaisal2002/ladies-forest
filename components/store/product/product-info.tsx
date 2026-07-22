"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  VariantSelector,
  type ProductOptionData,
} from "@/components/store/product/variant-selector";
import { SizeGuideDialog } from "@/components/store/product/size-guide-dialog";
import { useCartStore } from "@/lib/cart-store";
import { discountPercent, formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type VariantData = {
  id: string;
  title: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  optionValues: Record<string, string>;
};

export type ProductInfoData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryName: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  /** First gallery image — used as the cart line-item thumbnail. */
  image: string | null;
  /** The product's size-chart image (URL containing "SizeChart"), if any. */
  sizeChartImage: string | null;
  options: ProductOptionData[];
  variants: VariantData[];
};

type ProductInfoProps = {
  product: ProductInfoData;
  freeDeliveryThreshold: number;
  /** Store WhatsApp number — empty string hides the WhatsApp order button. */
  whatsappNumber?: string;
};

export function ProductInfo({
  product,
  freeDeliveryThreshold,
  whatsappNumber = "",
}: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { options, variants } = product;

  // Default-select the first fully in-stock variant's values.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const defaultVariant = variants.find((v) => v.stock > 0) ?? variants[0];
    return defaultVariant ? { ...defaultVariant.optionValues } : {};
  });
  const [rawQty, setRawQty] = useState(1);

  // The variant whose optionValues match ALL currently selected values.
  const selectedVariant = useMemo(() => {
    if (options.length === 0) return variants[0];
    return variants.find((v) =>
      options.every((o) => v.optionValues[o.name] === selected[o.name]),
    );
  }, [options, variants, selected]);

  const stock = selectedVariant?.stock ?? 0;
  const outOfStock = stock <= 0;
  const lowStock =
    !outOfStock && stock <= (selectedVariant?.lowStockThreshold ?? 5);
  const maxQty = Math.max(1, stock);
  const qty = Math.min(rawQty, maxQty);

  const price = selectedVariant?.price ?? product.basePrice;
  const off = product.compareAtPrice
    ? discountPercent(product.compareAtPrice, price)
    : 0;

  // A value is "available" when at least one in-stock variant matches it
  // together with the other currently selected values.
  const isAvailable = (name: string, value: string) =>
    variants.some(
      (v) =>
        v.stock > 0 &&
        v.optionValues[name] === value &&
        options.every(
          (o) => o.name === name || v.optionValues[o.name] === selected[o.name],
        ),
    );

  const handleSelect = (name: string, value: string) => {
    setSelected((prev) => ({ ...prev, [name]: value }));
    setRawQty(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        image: product.image,
        stock: selectedVariant.stock,
      },
      qty,
    );
    toast.success("Added to cart");
  };

  // "Order on WhatsApp": opens the store's chat with the order pre-written —
  // many PK customers prefer this over the checkout form.
  const orderOnWhatsApp = () => {
    let digits = whatsappNumber.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
    if (!digits) return;
    const lines = [
      "Assalam o Alaikum! I would like to order:",
      "",
      product.title,
      selectedVariant && options.length > 0
        ? `Variant: ${selectedVariant.title}`
        : "",
      `Quantity: ${qty}`,
      `Price: ${formatPKR(price * qty)}`,
      "",
      window.location.href,
    ].filter(Boolean);
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const hasSizeOption = options.some((o) => o.name === "Size");
  const paragraphs = product.description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      {product.categoryName && (
        <p className="text-xs uppercase tracking-[0.3em] text-forest">
          {product.categoryName}
        </p>
      )}
      <h1 className="mt-2 text-3xl md:text-4xl">{product.title}</h1>

      {/* Price of the selected variant */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "text-2xl font-semibold",
            off > 0 ? "text-primary" : "text-foreground",
          )}
        >
          {formatPKR(price)}
        </span>
        {product.compareAtPrice && off > 0 && (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
            <Badge className="bg-primary text-primary-foreground">
              -{off}%
            </Badge>
          </>
        )}
      </div>

      {/* Variant selection */}
      {options.length > 0 && (
        <div className="mt-6">
          <VariantSelector
            options={options}
            selected={selected}
            onSelect={handleSelect}
            isAvailable={isAvailable}
            sizeGuide={
              hasSizeOption ? (
                <SizeGuideDialog image={product.sizeChartImage} />
              ) : undefined
            }
          />
        </div>
      )}

      {/* Stock status */}
      <p
        className={cn(
          "mt-4 text-sm",
          outOfStock
            ? "text-destructive"
            : lowStock
              ? "font-medium text-primary"
              : "text-forest",
        )}
        aria-live="polite"
      >
        {outOfStock
          ? "Out of stock"
          : lowStock
            ? `Only ${stock} left — order soon`
            : "In stock"}
      </p>

      {/* Quantity + add to cart */}
      <div className="mt-4 flex items-stretch gap-3">
        <div className="flex shrink-0 items-center rounded-lg border">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Decrease quantity"
            disabled={outOfStock || qty <= 1}
            onClick={() => setRawQty(Math.max(1, qty - 1))}
          >
            <Minus />
          </Button>
          <span
            className="w-8 text-center text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Increase quantity"
            disabled={outOfStock || qty >= maxQty}
            onClick={() => setRawQty(Math.min(maxQty, qty + 1))}
          >
            <Plus />
          </Button>
        </div>
        <Button
          size="lg"
          className="w-full flex-1"
          disabled={outOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>

      {/* WhatsApp ordering */}
      {whatsappNumber && (
        <Button
          size="lg"
          variant="outline"
          className="mt-3 w-full border-[#25D366]/60 text-[#128C7E] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
          onClick={orderOnWhatsApp}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4.5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Order on WhatsApp
        </Button>
      )}

      {/* Trust row */}
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-blush p-3 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <BadgeCheck className="size-5 text-forest" />
          <span className="text-xs text-muted-foreground">
            Cash on Delivery
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Truck className="size-5 text-forest" />
          <span className="text-xs text-muted-foreground">
            {freeDeliveryThreshold > 0
              ? `Free delivery over ${formatPKR(freeDeliveryThreshold)}`
              : "Fast nationwide delivery"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <RotateCcw className="size-5 text-forest" />
          <span className="text-xs text-muted-foreground">Easy returns</span>
        </div>
      </div>

      {/* Description & shipping */}
      <Accordion defaultValue={["description"]} className="mt-8">
        {paragraphs.length > 0 && (
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Cash on Delivery available nationwide across Pakistan.</p>
            <p>
              Orders are delivered within 2–4 working days.
              {freeDeliveryThreshold > 0 && (
                <>
                  {" "}
                  Delivery is free on orders over{" "}
                  {formatPKR(freeDeliveryThreshold)}.
                </>
              )}
            </p>
            <p>
              Wrong size or changed your mind? We offer easy returns and
              exchanges — just reach out within 7 days of delivery.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
