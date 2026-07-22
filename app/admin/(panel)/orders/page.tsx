import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderWhatsApp } from "@/components/admin/order-whatsapp";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrders } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = TABS.includes(status ?? "") ? status! : "ALL";
  const orders = await getAdminOrders(active === "ALL" ? undefined : active);

  return (
    <>
      <PageHeader title="Orders" description={`${orders.length} orders`} />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "ALL" ? "/admin/orders" : `/admin/orders?status=${tab}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active === tab
                ? "bg-forest text-forest-foreground"
                : "bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No orders here yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {o.createdAt.toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div>
                          {o.shipName}
                          <span className="block text-xs text-muted-foreground">
                            {o.shipCity} · {o.shipPhone}
                          </span>
                        </div>
                        <OrderWhatsApp
                          phone={o.shipPhone}
                          message={`Assalam o Alaikum ${o.shipName.trim().split(/\s+/)[0]}! Ladies Forest se raabta kar rahe hain. 🌸 Aap ka order *${o.orderNumber}* (Total: ${formatPKR(o.grandTotal)}, ${o.paymentMethod}) confirm karna hai. Kya ye order confirm hai? Baraye meharbani *YES* reply kar dein. Shukriya!`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPKR(o.grandTotal)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{o.paymentMethod}</span>{" "}
                      <StatusBadge value={o.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={o.status} />
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
