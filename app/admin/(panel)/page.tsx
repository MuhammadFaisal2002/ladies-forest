import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDashboardStats } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Today's orders",
      value: String(stats.todayCount),
      icon: CalendarDays,
    },
    {
      label: "Today's revenue",
      value: formatPKR(stats.todayRevenue),
      icon: Wallet,
    },
    {
      label: "This month",
      value: formatPKR(stats.monthRevenue),
      icon: TrendingUp,
    },
    {
      label: "Pending orders",
      value: String(stats.pendingCount),
      icon: Clock,
      href: "/admin/orders?status=PENDING",
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What's happening in your store today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const card = (
            <Card key={label} className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-forest" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          );
          return href ? (
            <Link key={label} href={href} className="block">
              {card}
            </Link>
          ) : (
            card
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {o.shipName}
                        <span className="block text-xs text-muted-foreground">
                          {o.shipCity}
                        </span>
                      </TableCell>
                      <TableCell>{formatPKR(o.grandTotal)}</TableCell>
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

        <div className="space-y-6">
          {/* Low stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-primary" /> Low stock
              </CardTitle>
              <Link
                href="/admin/inventory"
                className="text-sm text-primary hover:underline"
              >
                Inventory
              </Link>
            </CardHeader>
            <CardContent>
              {stats.lowStock.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  All stocked up 🎉
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {stats.lowStock.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {v.product.title}
                        <span className="text-muted-foreground">
                          {" "}
                          · {v.title}
                        </span>
                      </span>
                      <span
                        className={
                          v.stock === 0
                            ? "font-semibold text-destructive"
                            : "font-semibold text-primary"
                        }
                      >
                        {v.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Top sellers */}
          <Card>
            <CardHeader>
              <CardTitle>Top sellers</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topSellers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No sales yet.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {stats.topSellers.map((t, i) => (
                    <li
                      key={t.title}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        <span className="mr-2 text-muted-foreground">
                          {i + 1}.
                        </span>
                        {t.title}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {t.sold} sold
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
