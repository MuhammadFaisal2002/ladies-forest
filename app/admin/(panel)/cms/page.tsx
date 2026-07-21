import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroSlideDialog } from "@/components/admin/hero-slide-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminHeroSlides } from "@/lib/admin-queries";

export default async function AdminCmsPage() {
  const slides = await getAdminHeroSlides();

  return (
    <>
      <PageHeader
        title="Homepage & CMS"
        description="Hero slider and homepage content"
      >
        <HeroSlideDialog
          trigger={
            <Button>
              <Plus /> New slide
            </Button>
          }
        />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((s) => (
          <Card key={s.id} className="overflow-hidden pt-0">
            <div className="relative aspect-[8/3] bg-muted">
              <Image
                src={s.image}
                alt=""
                fill
                sizes="400px"
                className="object-cover"
              />
              {!s.active && (
                <Badge className="absolute left-2 top-2 border-transparent bg-stone-800/80 text-white">
                  Hidden
                </Badge>
              )}
            </div>
            <CardContent className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {s.heading || "(artwork text)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Order {s.sortOrder} · {s.ctaText ?? "no button"}
                </p>
              </div>
              <HeroSlideDialog
                initial={{
                  id: s.id,
                  image: s.image,
                  heading: s.heading ?? "",
                  subheading: s.subheading ?? "",
                  ctaText: s.ctaText ?? "",
                  ctaHref: s.ctaHref ?? "",
                  sortOrder: s.sortOrder,
                  active: s.active,
                }}
                trigger={
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Other homepage content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              Announcement bar
            </span>{" "}
            text lives in{" "}
            <Link href="/admin/settings" className="text-primary hover:underline">
              Settings
            </Link>
            .
          </p>
          <p>
            <span className="font-medium text-foreground">Bestsellers</span>{" "}
            shows products marked as{" "}
            <span className="font-medium text-foreground">Featured</span> —
            toggle that on each product&apos;s edit page.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
