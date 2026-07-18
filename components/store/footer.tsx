import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

type FooterProps = {
  storeName: string;
  categories: { name: string; slug: string }[];
  socialLinks: { facebook: string; instagram: string };
};

export function Footer({ storeName, categories, socialLinks }: FooterProps) {
  return (
    <footer className="bg-forest text-forest-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <p className="font-heading text-2xl">{storeName}</p>
            <p className="text-sm leading-relaxed text-forest-foreground/70">
              Comfortable &amp; stylish women&apos;s essentials, forever-shine
              jewellery and signature fragrances — delivered across Pakistan.
            </p>
            <div className="flex gap-2 pt-1">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full border border-forest-foreground/20 p-2 transition-colors hover:bg-forest-foreground/10"
                >
                  <FacebookIcon className="size-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full border border-forest-foreground/20 p-2 transition-colors hover:bg-forest-foreground/10"
                >
                  <InstagramIcon className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Shop</p>
            <ul className="space-y-2 text-sm text-forest-foreground/70">
              <li>
                <Link href="/shop" className="transition-colors hover:text-forest-foreground">
                  All Products
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="transition-colors hover:text-forest-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Help</p>
            <ul className="space-y-2 text-sm text-forest-foreground/70">
              <li>
                <Link href="/contact" className="transition-colors hover:text-forest-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/pages/size-guide" className="transition-colors hover:text-forest-foreground">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-policy" className="transition-colors hover:text-forest-foreground">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/return-policy" className="transition-colors hover:text-forest-foreground">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="transition-colors hover:text-forest-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Get exclusive deals
            </p>
            <p className="mb-3 text-sm text-forest-foreground/70">
              Sign up for early access to sales and new arrivals.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="border-forest-foreground/20 bg-forest-foreground/10 text-forest-foreground placeholder:text-forest-foreground/50"
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/85"
              >
                Join
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-forest-foreground/15 pt-6 text-xs text-forest-foreground/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p>Cash on Delivery available nationwide 🇵🇰</p>
        </div>
      </div>
    </footer>
  );
}
