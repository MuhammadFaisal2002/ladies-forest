"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  deleteProduct,
  upsertProduct,
  type ProductInput,
} from "@/lib/actions/admin/products";
import { variantTitle } from "@/lib/format";

type OptionRow = { name: string; valuesText: string };

type VariantRow = {
  id?: string;
  optionValues: Record<string, string>;
  sku: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
};

export type ProductFormInitial = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  basePrice: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  status: "ACTIVE" | "DRAFT";
  featured: boolean;
  tags: string[];
  options: { name: string; values: string[] }[];
  variants: {
    id: string;
    optionValues: Record<string, string>;
    sku: string | null;
    price: number;
    stock: number;
    lowStockThreshold: number;
  }[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseOptions = (rows: OptionRow[]) =>
  rows
    .map((r) => ({
      name: r.name.trim(),
      values: [...new Set(r.valuesText.split(",").map((v) => v.trim()).filter(Boolean))],
    }))
    .filter((o) => o.name && o.values.length > 0);

const signature = (ov: Record<string, string>) =>
  Object.entries(ov)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");

/** Cartesian combos of option values, preserving edits of matching rows. */
function regenerateVariants(
  options: { name: string; values: string[] }[],
  prev: VariantRow[],
  defaultPrice: string,
): VariantRow[] {
  const prevBySig = new Map(prev.map((v) => [signature(v.optionValues), v]));
  if (options.length === 0) {
    const kept = prevBySig.get("") ?? prev[0];
    return [
      kept ?? {
        optionValues: {},
        sku: "",
        price: defaultPrice,
        stock: "0",
        lowStockThreshold: "5",
      },
    ];
  }
  let combos: Record<string, string>[] = [{}];
  for (const option of options) {
    combos = combos.flatMap((c) =>
      option.values.map((v) => ({ ...c, [option.name]: v })),
    );
  }
  return combos.map(
    (ov) =>
      prevBySig.get(signature(ov)) ?? {
        optionValues: ov,
        sku: "",
        price: defaultPrice,
        stock: "0",
        lowStockThreshold: "5",
      },
  );
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imagesText, setImagesText] = useState(
    initial?.images.join("\n") ?? "",
  );
  const [basePrice, setBasePrice] = useState(
    initial ? String(initial.basePrice) : "",
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice ? String(initial.compareAtPrice) : "",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">(
    initial?.status ?? "ACTIVE",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");

  const [optionRows, setOptionRows] = useState<OptionRow[]>(
    initial?.options.map((o) => ({
      name: o.name,
      valuesText: o.values.join(", "),
    })) ?? [],
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      id: v.id,
      optionValues: v.optionValues,
      sku: v.sku ?? "",
      price: String(v.price),
      stock: String(v.stock),
      lowStockThreshold: String(v.lowStockThreshold),
    })) ?? [
      {
        optionValues: {},
        sku: "",
        price: "",
        stock: "0",
        lowStockThreshold: "5",
      },
    ],
  );

  const updateOptions = (rows: OptionRow[]) => {
    setOptionRows(rows);
    setVariants((prev) =>
      regenerateVariants(parseOptions(rows), prev, basePrice || "0"),
    );
  };

  const setVariantField = (
    index: number,
    field: keyof Omit<VariantRow, "optionValues" | "id">,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const images = imagesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const save = () => {
    const payload: ProductInput = {
      id: initial?.id,
      title,
      slug,
      description,
      images,
      basePrice: Number(basePrice) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      categoryId: categoryId || null,
      status,
      featured,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      options: parseOptions(optionRows),
      variants: variants.map((v) => ({
        id: v.id,
        optionValues: v.optionValues,
        sku: v.sku,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        lowStockThreshold: Number(v.lowStockThreshold) || 0,
      })),
    };
    startTransition(async () => {
      const result = await upsertProduct(payload);
      if (result.ok) {
        toast.success(initial ? "Product updated" : "Product created");
        router.push("/admin/products");
      } else {
        toast.error(result.error);
      }
    });
  };

  const remove = () => {
    if (!initial) return;
    startTransition(async () => {
      const result = await deleteProduct(initial.id);
      if (result.ok) {
        toast.success("Product deleted");
        router.push("/admin/products");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugEdited) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Soft Cotton Light Padded Bra - Black"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugEdited(true);
                }}
              />
              <p className="text-xs text-muted-foreground">
                /product/{slug || "..."}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Separate paragraphs with a blank line"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Images</CardTitle>
            <ImageUploader
              onUploaded={(urls) =>
                setImagesText((prev) =>
                  [prev.trim(), ...urls].filter(Boolean).join("\n"),
                )
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={4}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder={"Upload photos above, or paste one image URL per line — first one is the main photo"}
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative size-16 overflow-hidden rounded-md border bg-muted"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <span className="absolute left-0 top-0 rounded-br bg-foreground/70 px-1 text-[10px] text-background">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Options</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={optionRows.length >= 3}
              onClick={() =>
                updateOptions([...optionRows, { name: "", valuesText: "" }])
              }
            >
              <Plus /> Add option
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {optionRows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No options — this product has a single variant. Add an option
                like <span className="font-medium">Size</span> or{" "}
                <span className="font-medium">Volume</span> to sell multiple
                variants.
              </p>
            )}
            {optionRows.map((row, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input
                  className="w-36"
                  placeholder="Name (e.g. Size)"
                  value={row.name}
                  onChange={(e) =>
                    updateOptions(
                      optionRows.map((r, ri) =>
                        ri === i ? { ...r, name: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Input
                  className="flex-1"
                  placeholder="Values, comma separated (e.g. 32, 34, 36)"
                  value={row.valuesText}
                  onChange={(e) =>
                    updateOptions(
                      optionRows.map((r, ri) =>
                        ri === i ? { ...r, valuesText: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove option"
                  onClick={() =>
                    updateOptions(optionRows.filter((_, ri) => ri !== i))
                  }
                >
                  <X />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Variants{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({variants.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price (Rs.)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Low-stock at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v, i) => (
                  <TableRow key={signature(v.optionValues) || "default"}>
                    <TableCell className="font-medium">
                      {variantTitle(v.optionValues)}
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-36"
                        value={v.sku}
                        onChange={(e) => setVariantField(i, "sku", e.target.value)}
                        placeholder="Optional"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-24"
                        type="number"
                        min={0}
                        value={v.price}
                        onChange={(e) => setVariantField(i, "price", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-20"
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => setVariantField(i, "stock", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-20"
                        type="number"
                        min={0}
                        value={v.lowStockThreshold}
                        onChange={(e) =>
                          setVariantField(i, "lowStockThreshold", e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Side column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                items={[
                  { value: "ACTIVE", label: "Active (visible in store)" },
                  { value: "DRAFT", label: "Draft (hidden)" },
                ]}
                value={status}
                onValueChange={(v) => setStatus(v === "DRAFT" ? "DRAFT" : "ACTIVE")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (visible in store)</SelectItem>
                  <SelectItem value="DRAFT">Draft (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={featured}
                onCheckedChange={(c) => setFeatured(c === true)}
              />
              Featured (shows in Bestsellers)
            </label>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                items={[
                  { value: "", label: "No category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ? String(v) : "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">Base price (Rs.) *</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAt">Compare-at price (Rs.)</Label>
              <Input
                id="compareAt"
                type="number"
                min={0}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Old price, for sale display"
              />
              <p className="text-xs text-muted-foreground">
                Set higher than the price to show a sale badge.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="bra, cotton, daily wear"
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={save} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {initial ? "Save changes" : "Create product"}
          </Button>
          {initial && (
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="outline" className="text-destructive">
                    <Trash2 /> Delete product
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this product?</DialogTitle>
                  <DialogDescription>
                    &ldquo;{initial.title}&rdquo; and all its variants will be
                    removed from the store. Past orders keep their records.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={remove} disabled={pending}>
                    {pending && <Loader2 className="animate-spin" />}
                    Yes, delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
