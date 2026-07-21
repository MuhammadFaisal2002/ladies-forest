import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin-queries";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
