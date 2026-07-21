"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteHeroSlide, upsertHeroSlide } from "@/lib/actions/admin/store";

export type SlideData = {
  id?: string;
  image: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaHref: string;
  sortOrder: number;
  active: boolean;
};

export function HeroSlideDialog({
  initial,
  trigger,
}: {
  initial?: SlideData;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<SlideData>(
    initial ?? {
      image: "",
      heading: "",
      subheading: "",
      ctaText: "Shop Now",
      ctaHref: "/shop",
      sortOrder: 0,
      active: true,
    },
  );

  const set = (key: keyof SlideData, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () =>
    startTransition(async () => {
      const result = await upsertHeroSlide({
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      });
      if (result.ok) {
        toast.success("Slide saved");
        setOpen(false);
      } else toast.error(result.error);
    });

  const remove = () => {
    if (!initial?.id) return;
    startTransition(async () => {
      const result = await deleteHeroSlide(initial.id!);
      if (result.ok) {
        toast.success("Slide deleted");
        setOpen(false);
      } else toast.error(result.error);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit slide" : "New slide"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Image URL *</Label>
            <Input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="/hero1.webp or https://..."
            />
            <p className="text-xs text-muted-foreground">
              Wide banner, ~1600×600 works best. Leave heading empty if the
              artwork already has text.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Heading (overlay text)</Label>
            <Input
              value={form.heading}
              onChange={(e) => set("heading", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={form.subheading}
              onChange={(e) => set("subheading", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Button text</Label>
              <Input
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Button link</Label>
              <Input
                value={form.ctaHref}
                onChange={(e) => set("ctaHref", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.active}
                onCheckedChange={(c) => set("active", c === true)}
              />
              Visible
            </label>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {initial?.id ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={remove}
              disabled={pending}
            >
              <Trash2 /> Delete
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={pending || !form.image}>
            {pending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
