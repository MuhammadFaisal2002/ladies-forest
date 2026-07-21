"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  TicketPercent,
  Users,
} from "lucide-react";
import { logout } from "@/lib/actions/admin/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/discounts", label: "Discounts", icon: TicketPercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/cms", label: "Homepage & CMS", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({
  userName,
  onNavigate,
}: {
  userName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-forest-foreground/50">
          Admin Panel
        </p>
        <p className="mt-1 font-heading text-2xl text-forest-foreground">
          Ladies <span className="text-primary">Forest</span>
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-forest-foreground/75 hover:bg-white/10 hover:text-forest-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-forest-foreground">
              {userName}
            </p>
            <p className="text-xs text-forest-foreground/50">Signed in</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-md p-2 text-forest-foreground/70 transition-colors hover:bg-white/10 hover:text-forest-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
