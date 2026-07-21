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
import { CategoryDialog } from "@/components/admin/category-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminCategories } from "@/lib/admin-queries";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <PageHeader
        title="Categories"
        description="Collections shown in the storefront navigation"
      >
        <CategoryDialog
          trigger={
            <Button>
              <Plus /> New category
            </Button>
          }
        />
      </PageHeader>

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    /category/{c.slug}
                  </TableCell>
                  <TableCell>{c._count.products}</TableCell>
                  <TableCell>{c.sortOrder}</TableCell>
                  <TableCell>
                    <CategoryDialog
                      initial={{
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        description: c.description ?? "",
                        bannerImage: c.bannerImage ?? "",
                        sortOrder: c.sortOrder,
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
        </CardContent>
      </Card>
    </>
  );
}
