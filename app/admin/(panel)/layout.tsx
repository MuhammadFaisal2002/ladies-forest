import { Inter } from "next/font/google";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

// Admin pages always render fresh — never cache management data.
export const dynamic = "force-dynamic";

// Admin uses Inter (a clear UI font) at a slightly larger size — easier to
// scan dense tables than the storefront's display fonts.
const inter = Inter({ subsets: ["latin"], variable: "--font-admin" });

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return (
    <div className={`${inter.variable} admin-ui`}>
      <AdminShell userName={session.name}>{children}</AdminShell>
    </div>
  );
}
