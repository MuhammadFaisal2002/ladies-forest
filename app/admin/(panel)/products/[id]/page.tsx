import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/components/admin/product-form";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    images: product.images,
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    categoryId: product.categoryId,
    status: product.status,
    featured: product.featured,
    tags: product.tags,
    options: product.options.map((o) => ({ name: o.name, values: o.values })),
    variants: product.variants.map((v) => ({
      id: v.id,
      optionValues: v.optionValues as Record<string, string>,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
    })),
  };

  return (
    <>
      <PageHeader title="Edit product" description={product.title} />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={initial}
      />
    </>
  );
}
