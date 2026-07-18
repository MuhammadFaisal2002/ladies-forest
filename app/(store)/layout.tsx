import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MiniCart } from "@/components/store/mini-cart";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { getCategories, getSettings } from "@/lib/queries";

// ISR: storefront chrome refreshes at most every 60s (announcement text,
// categories etc. come from the admin-editable Settings).
export const revalidate = 60;

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);
  const cats = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar text={settings.announcementText} />
      <Header storeName={settings.storeInfo.name} categories={cats} />
      <main className="flex-1">{children}</main>
      <Footer
        storeName={settings.storeInfo.name}
        categories={cats}
        socialLinks={settings.socialLinks}
      />
      <MiniCart freeDeliveryThreshold={settings.freeDeliveryThreshold} />
      <WhatsAppButton number={settings.whatsappNumber} />
      <Toaster position="bottom-center" />
    </div>
  );
}
