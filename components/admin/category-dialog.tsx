"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ImageUploader } from "@/components/admin/image-uploader";
import { deleteCategory, upsertCategory } from "@/lib/actions/admin/store";

export type CategoryData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  sortOrder: number;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function CategoryDialog({
  initial,
  trigger,
}: {
  initial?: CategoryData;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<CategoryData>(
    initial ?? { name: "", slug: "", description: "", bannerImage: "", sortOrder: 0 },
  );

  const set = (key: keyof CategoryData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () =>
    startTransition(async () => {
      const result = await upsertCategory({
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      });
      if (result.ok) {
        toast.success("Category saved");
        setOpen(false);
      } else toast.error(result.error);
    });

  const remove = () => {
    if (!initial?.id) return;
    startTransition(async () => {
      const result = await deleteCategory(initial.id!);
      if (result.ok) {
        toast.success("Category deleted");
        setOpen(false);
      } else toast.error(result.error);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit category" : "New category"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!initial) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              /category/{form.slug || "..."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Banner image (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={form.bannerImage}
                onChange={(e) => set("bannerImage", e.target.value)}
              />
              <ImageUploader
                multiple={false}
                label="Upload"
                onUploaded={(urls) => urls[0] && set("bannerImage", urls[0])}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sort order</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
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
          <Button onClick={save} disabled={pending || !form.name || !form.slug}>
            {pending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
