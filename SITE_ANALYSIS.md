# Ladies Forest — Existing Shopify Site Analysis

> Analyzed 2026-07-18 from https://ladiesforest.com/. This documents what the current site has,
> what the rebuild must replicate, and what we're adding on top. Read together with `PROJECT_CONTEXT.md`.

---

## 1. Current Site Structure (Shopify — simple/minimal theme)

### Homepage sections (in order)
1. **Announcement bar** — "Flat 20% OFF" · "Free Delivery of Order over Rs 3000"
2. **Header** — logo, nav (Home / Categories dropdown / Contact), search, account, cart
3. **Hero slideshow** (autoplay carousel)
4. **Category cards** — Comfortable & Stylish Women's Essentials · Forever Shine Jewellery · Signature Fragrances
5. **Bestsellers** product grid
6. **Collection section** — "Comfortable & Stylish Bras for Every Day"
7. **Collection section** — "Breathable Luxury & Attractive FG Bra"
8. **Newsletter signup** — "Get exclusive deals and early access"
9. **Footer** — © Ladies Forest, privacy policy, Facebook + Instagram links

### Navigation / pages that exist
- `/collections/all` — all products (sort: featured, relevance, popularity, A-Z/Z-A, price; filter: availability, price only)
- `/collections/comfortable-stylish-bras-for-every-day`
- `/collections/cozy-elegant-nightwear-for-relaxed-nights`
- `/collections/soft-breathable-panties-for-all-day-comfort`
- Collection: "Breathable Luxury & Attractive FG Bra"
- `/pages/contact`
- `/policies/privacy-policy`

---

## 2. Live Catalog Snapshot (2026-07-18)

**10 products, all bras.** Jewellery ("Forever Shine") and Fragrances ("Signature") are advertised
as categories on the homepage but currently have no products listed.

| Product line | Colors (as separate products) | Price |
|---|---|---|
| Soft Cotton Light Padded Bra | Black, Blue, Mahroon, Skinny | Rs. 600 → **Rs. 480 (sale)** |
| FG Non-Padded / FG Bra (LB20–LB24) | Black, Maroon, Pink, Skin | Rs. 899 (some 999) |

### ⭐ Real variant structure (critical for our schema)
Product pages have **TWO option dropdowns**:
- **Size:** 32, 34, 36, 38, 40, 42
- **Cup:** B, D

→ One bra = up to **12 variant combinations** (Size × Cup). This confirms the flexible
multi-option variant system in `PROJECT_CONTEXT.md` §4 — and it must support **multiple options
per product** (combination matrix), not just a single option list.

**Colors are separate products** on the current site (e.g. "Black Bra FG LB20" vs "Pink Non-Padded
FG LB23"), each with 5–6 images (product angles + a size-chart image in the gallery).

---

## 3. Current Design Language

- **Font:** Inter (body + headings)
- **Theme colors (extracted from CSS):** mostly neutral —
  - Backgrounds: white `#FFFFFF`, off-white `#F5F5F5`, **dusty pink `#D3C2C2`** (rgb 211 194 194), pale blue `#E1EDF5`, sage-ish `#EEF1EA`, dark `#333333`
  - Buttons: plain black/white (no brand color on CTAs)
  - Stock badges: in-stock `#3ED660`, low-stock `#EE9441`, out-of-stock `#C8C8C8`, error `#8B0000`
- The "pink" brand feel comes mainly from **product photography** and the dusty-pink section
  background — the theme itself is generic. Big opportunity to build a real pink identity.

### New color direction (decided with owner)
- Keep **pink** as the brand base, but add **contrast** for a catchy look (exact palette to be
  finalized in design phase — candidate contrasts: deep forest green (on-brand with "Forest"),
  deep charcoal, or gold accents for jewellery).
- **Animations: GSAP** (owner's choice — overrides the Framer Motion default in PROJECT_CONTEXT.md;
  Framer Motion may still be used for small component transitions if convenient).

---

## 4. Gaps in Current Site → What the Rebuild Adds

| Missing today | Rebuild feature |
|---|---|
| No shop-wide filter page (only availability/price) | `/shop` with category, size/volume, price filters + sorting + pagination |
| No reviews | Reviews w/ admin moderation (optional phase) |
| No WhatsApp button | Floating WhatsApp chat/order button |
| No wishlist | Wishlist |
| No order tracking | Customer accounts + order tracking |
| Thin info pages (only privacy policy + contact) | About, FAQ, Size Guide, Return/Refund, Shipping Policy |
| Colors as separate products | Keep same approach initially (matches owner's workflow); Color could become a third option later |
| Generic theme, no animations | Pink+contrast identity, GSAP animations, hero slider, hover effects, skeletons |
| Shopify admin | Custom `/admin` panel (products, variants, inventory, orders, discounts, CMS, settings) |

---

## 5. Must-Replicate Behaviors

- Announcement bar text (admin-editable via Settings)
- Free delivery over Rs 3000 (admin-configurable threshold)
- Sale pricing display (compare-at price, e.g. ~~Rs. 600~~ **Rs. 480**)
- Size-chart reference on bra product pages (→ becomes a proper Size Guide modal)
- Newsletter signup, Facebook + Instagram links
- Search, account, cart in header
- Sorting options on collection pages
- PKR currency formatting ("Rs. 899.00" style)
