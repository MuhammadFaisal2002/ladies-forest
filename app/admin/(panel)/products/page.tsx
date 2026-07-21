import Image from "next/image";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminProducts } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products in your catalog`}
      >
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus /> Add product
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {p.variants.length} variant
                        {p.variants.length === 1 ? "" : "s"}
                        {p.featured && (
                          <Star className="size-3 fill-gold text-gold" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{p.category?.name ?? "—"}</TableCell>
                    <TableCell>
                      {formatPKR(p.basePrice)}
                      {p.compareAtPrice && (
                        <span className="block text-xs text-muted-foreground line-through">
                          {formatPKR(p.compareAtPrice)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        stock === 0 ? "font-semibold text-destructive" : ""
                      }
                    >
                      {stock}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={p.status} />
                    </TableCell>
                    <TableCell>
                      <ProductDeleteButton productId={p.id} title={p.title} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
