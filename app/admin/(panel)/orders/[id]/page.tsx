import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderActions } from "@/components/admin/order-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrder } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link
            href="/admin/orders"
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Orders
          </Link>
          <h1 className="flex items-center gap-3 font-heading text-3xl">
            {order.orderNumber} <StatusBadge value={order.status} />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.createdAt.toLocaleString("en-PK", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Printable invoice area */}
        <div id="invoice" className="space-y-6">
          {/* Print-only letterhead */}
          <div className="hidden print:block">
            <h1 className="font-heading text-2xl">Ladies Forest</h1>
            <p className="text-sm">
              Invoice — {order.orderNumber} ·{" "}
              {order.createdAt.toLocaleDateString("en-PK", {
                dateStyle: "long",
              })}
            </p>
            <hr className="my-4" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted print:hidden">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.productTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.variantTitle}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sku ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPKR(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPKR(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPKR(order.subtotal)}</dd>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                    </dt>
                    <dd>-{formatPKR(order.discountTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>
                    {order.shippingTotal === 0
                      ? "FREE"
                      : formatPKR(order.shippingTotal)}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-1.5 text-base font-semibold">
                  <dt>Total ({order.paymentMethod})</dt>
                  <dd>{formatPKR(order.grandTotal)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.shipName}</p>
              <p className="text-muted-foreground">{order.shipPhone}</p>
              {order.shipEmail && (
                <p className="text-muted-foreground">{order.shipEmail}</p>
              )}
              <p className="mt-2">
                {order.shipAddress}, {order.shipCity}
                {order.shipProvince ? `, ${order.shipProvince}` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <OrderActions
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
          notes={order.notes ?? ""}
        />
      </div>
    </>
  );
}
