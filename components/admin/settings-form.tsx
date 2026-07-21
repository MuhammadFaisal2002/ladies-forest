"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings, type SettingsInput } from "@/lib/actions/admin/store";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [form, setForm] = useState<SettingsInput>(initial);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await saveSettings({
        ...form,
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
        shippingFee: Number(form.shippingFee) || 0,
      });
      if (result.ok) toast.success("Settings saved");
      else toast.error(result.error);
    });

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery & announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Free delivery over (Rs.)</Label>
              <Input
                type="number"
                min={0}
                value={form.freeDeliveryThreshold}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    freeDeliveryThreshold: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery fee (Rs.)</Label>
              <Input
                type="number"
                min={0}
                value={form.shippingFee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shippingFee: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Announcement bar text</Label>
            <Input
              value={form.announcementText}
              onChange={(e) =>
                setForm((f) => ({ ...f, announcementText: e.target.value }))
              }
              placeholder="Flat 20% OFF — Free Delivery on Orders Over Rs. 3,000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp number</Label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, whatsappNumber: e.target.value }))
              }
              placeholder="923001234567 (country code, no +)"
            />
            <p className="text-xs text-muted-foreground">
              Shown as the floating chat button on the store. Leave empty to
              hide it.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Store name</Label>
            <Input
              value={form.storeInfo.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storeInfo: { ...f.storeInfo, name: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={form.storeInfo.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storeInfo: { ...f.storeInfo, email: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.storeInfo.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storeInfo: { ...f.storeInfo, phone: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={form.storeInfo.address}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storeInfo: { ...f.storeInfo, address: e.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Facebook URL</Label>
            <Input
              value={form.socialLinks.facebook}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  socialLinks: { ...f.socialLinks, facebook: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Instagram URL</Label>
            <Input
              value={form.socialLinks.instagram}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  socialLinks: { ...f.socialLinks, instagram: e.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={save} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Save settings
      </Button>
    </div>
  );
}
