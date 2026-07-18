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
};

export function ProductInfo({
  product,
  freeDeliveryThreshold,
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
