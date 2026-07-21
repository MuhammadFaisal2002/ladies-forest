import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DiscountDialog } from "@/components/admin/discount-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminDiscounts } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";

const toDateInput = (d: Date | null) =>
  d ? d.toISOString().slice(0, 10) : null;

export default async function AdminDiscountsPage() {
  const discounts = await getAdminDiscounts();

  return (
    <>
      <PageHeader
        title="Discounts"
        description="Coupon codes customers can apply at checkout"
      >
        <DiscountDialog
          trigger={
            <Button>
              <Plus /> New coupon
            </Button>
          }
        />
      </PageHeader>

      <Card>
        <CardContent className="overflow-x-auto">
          {discounts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No coupons yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min order</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">
                      {d.code}
                    </TableCell>
                    <TableCell>
                      {d.type === "PERCENT"
                        ? `${d.value}%`
                        : formatPKR(d.value)}
                    </TableCell>
                    <TableCell>
                      {d.minOrderValue ? formatPKR(d.minOrderValue) : "—"}
                    </TableCell>
                    <TableCell>
                      {d.usedCount}
                      {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.startsAt
                        ? d.startsAt.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Always"}
                      {" — "}
                      {d.endsAt
                        ? d.endsAt.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })
                        : "no end"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          d.active
                            ? "border-transparent bg-emerald-100 text-emerald-800"
                            : "border-transparent bg-stone-200 text-stone-700"
                        }
                      >
                        {d.active ? "Active" : "Off"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DiscountDialog
                        initial={{
                          id: d.id,
                          code: d.code,
                          type: d.type,
                          value: d.value,
                          minOrderValue: d.minOrderValue,
                          usageLimit: d.usageLimit,
                          startsAt: toDateInput(d.startsAt),
                          endsAt: toDateInput(d.endsAt),
                          active: d.active,
                        }}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
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
