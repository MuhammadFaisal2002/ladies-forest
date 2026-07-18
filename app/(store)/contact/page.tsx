import type { Metadata } from "next";
import { Mail, MapPin, Phone, Truck } from "lucide-react";
import { Reveal } from "@/components/store/reveal";
import { formatPKR } from "@/lib/format";
import { getSettings } from "@/lib/queries";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — Ladies Forest",
  description:
    "Questions about sizing, delivery or your order? Get in touch with Ladies Forest.",
};

// Store info & social links are admin-editable settings — refresh every 60s.
export const revalidate = 60;

export default async function ContactPage() {
  const { storeInfo, socialLinks, freeDeliveryThreshold } =
    await getSettings();

  const methods = [
    {
      icon: Mail,
      label: "Email us",
      value: storeInfo.email,
      href: `mailto:${storeInfo.email}`,
    },
    {
      icon: Phone,
      label: "Call us",
      value: storeInfo.phone,
      href: `tel:${storeInfo.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Visit us",
      value: storeInfo.address,
      href: null,
    },
  ].filter((m) => m.value);

  const socials = [
    { label: "Instagram", href: socialLinks.instagram },
    { label: "Facebook", href: socialLinks.facebook },
  ].filter((s) => s.href);

  return (
    <>
      {/* Heading band */}
      <section className="bg-blush">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 md:py-16 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            We&apos;re here for you
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Questions about sizing, delivery or your order? We&apos;d love to
            hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            {/* Contact methods */}
            <div>
              <h2 className="text-xl">Contact details</h2>
              <ul className="mt-6 space-y-5">
                {methods.map((method) => (
                  <li key={method.label} className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush">
                      <method.icon className="size-4.5 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{method.label}</p>
                      {method.href ? (
                        <a
                          href={method.href}
                          className="break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {method.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {socials.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm font-medium">Follow us</p>
                  <div className="mt-2 flex gap-5">
                    {socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* COD & delivery note */}
              <div className="mt-8 flex items-start gap-3 rounded-xl border p-4">
                <Truck className="mt-0.5 size-5 shrink-0 text-forest" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Cash on Delivery
                  </span>{" "}
                  available across Pakistan — and delivery is FREE on orders
                  over{" "}
                  <span className="font-medium text-forest">
                    {formatPKR(freeDeliveryThreshold)}
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Message form */}
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </>
  );
}
