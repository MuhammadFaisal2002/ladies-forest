"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";

/** Responsive admin chrome: fixed forest sidebar on lg, sheet drawer below. */
export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-forest lg:block">
        <AdminNav userName={userName} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-forest px-4 py-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Open menu"
                  className="rounded-md p-1.5 text-forest-foreground hover:bg-white/10"
                >
                  <Menu className="size-5" />
                </button>
              }
            />
            <SheetContent side="left" className="w-64 bg-forest p-0">
              <SheetTitle className="sr-only">Admin menu</SheetTitle>
              <AdminNav userName={userName} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="font-heading text-lg text-forest-foreground">
            Ladies <span className="text-primary">Forest</span>{" "}
            <span className="text-sm text-forest-foreground/60">admin</span>
          </p>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
