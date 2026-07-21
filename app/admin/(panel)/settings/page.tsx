import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const s = await getSettings();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Delivery rules, announcement bar, store info"
      />
      <SettingsForm
        initial={{
          freeDeliveryThreshold: s.freeDeliveryThreshold,
          shippingFee: s.shippingFee,
          announcementText: s.announcementText,
          whatsappNumber: s.whatsappNumber,
          storeInfo: s.storeInfo,
          socialLinks: s.socialLinks,
        }}
      />
    </>
  );
}
