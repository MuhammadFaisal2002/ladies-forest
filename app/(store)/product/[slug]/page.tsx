import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product/gallery";
import {
  ProductInfo,
  type ProductInfoData,
} from "@/components/store/product/product-info";
import { Reveal } from "@/components/store/reveal";
import { SectionHeading } from "@/components/store/home/section-heading";
import {
  getProductBySlug,
  getRelatedProducts,
  getSettings,
} from "@/lib/queries";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const isSizeChart = (src: string) => /sizechart/i.test(src);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.split("\n")[0].slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getSettings(),
  ]);

  const galleryImages = product.images.filter((src) => !isSizeChart(src));
  const sizeChartImage = product.images.find(isSizeChart) ?? null;

  const info: ProductInfoData = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    categoryName: product.category?.name ?? null,
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    image: galleryImages[0] ?? null,
    sizeChartImage,
    options: product.options.map((o) => ({ name: o.name, values: o.values })),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      optionValues: v.optionValues as Record<string, string>,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={<Link href={`/category/${product.category.slug}`} />}
                >
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/shop" />}>
                  Shop
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={galleryImages} title={product.title} />
        <ProductInfo
          product={info}
          freeDeliveryThreshold={settings.freeDeliveryThreshold}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-24" aria-label="Related products">
          <Reveal>
            <SectionHeading
              eyebrow="Keep exploring"
              title="You may also like"
            />
          </Reveal>
          <Reveal
            stagger
            className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          >
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
        </section>
      )}
    </div>
  );
}
