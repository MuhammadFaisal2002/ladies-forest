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
import { getAdminCustomers } from "@/lib/admin-queries";
import { formatPKR } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has placed an order (grouped by phone number)"
      />

      <Card>
        <CardContent className="overflow-x-auto">
          {customers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No customers yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total spent</TableHead>
                  <TableHead>Last order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={`${c.phone}-${c.name}`}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell>{formatPKR(c.totalSpent)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.lastOrderAt?.toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) ?? "—"}
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
