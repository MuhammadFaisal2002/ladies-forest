import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { StockAdjustDialog } from "@/components/admin/stock-adjust-dialog";
import { getAdminVariants, getRecentAdjustments } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminInventoryPage() {
  const [variants, adjustments] = await Promise.all([
    getAdminVariants(),
    getRecentAdjustments(),
  ]);

  const lowCount = variants.filter((v) => v.stock <= v.lowStockThreshold).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${variants.length} variants · ${lowCount} low on stock`}
      />

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => {
                const low = v.stock <= v.lowStockThreshold;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-56">
                      <span className="line-clamp-1">{v.product.title}</span>
                    </TableCell>
                    <TableCell>{v.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.sku ?? "—"}
                    </TableCell>
                    <TableCell>{formatPKR(v.price)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          v.stock === 0
                            ? "text-destructive"
                            : low
                              ? "text-primary"
                              : "",
                        )}
                      >
                        {v.stock}
                      </span>
                      {low && (
                        <Badge className="ml-2 border-transparent bg-primary/10 text-primary">
                          {v.stock === 0 ? "Out" : "Low"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <StockAdjustDialog
                        variantId={v.id}
                        label={`${v.product.title} · ${v.title}`}
                        stock={v.stock}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent stock changes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {adjustments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No stock movements yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {a.createdAt.toLocaleString("en-PK", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="max-w-64">
                      <span className="line-clamp-1">
                        {a.variant.product.title} · {a.variant.title}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        a.change > 0 ? "text-forest" : "text-destructive",
                      )}
                    >
                      {a.change > 0 ? `+${a.change}` : a.change}
                    </TableCell>
                    <TableCell>{a.reason}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.adminUser?.name ?? "System"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
