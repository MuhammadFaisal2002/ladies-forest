# Ladies Forest — E-Commerce Rebuild (Project Context)

> Hand this file to Claude / any AI assistant as project context before starting development.
> It describes what we are building, the chosen stack, the data model, and every feature for both the admin panel and the customer site.

---

## 1. Project Overview

We are rebuilding an existing Shopify store (**Ladies Forest** — https://ladiesforest.com) as a custom, self-owned application. It is a small-to-medium **women's essentials store in Pakistan** (currency: PKR).

**Why rebuild:** move off Shopify (recurring fees), get full control over the code, custom UI/UX, and smooth animations.

**Product categories (small catalog):**
1. **Bras / Women's Essentials** — variant option is **Size** (S, M, L)
2. **Perfumes / Fragrances** — variant option is **Volume** (200ml, 400ml)
3. **Jewellery** — usually no variants (or color)

**Goals:**
- Fast, responsive, attractive customer-facing storefront with smooth animations
- A full admin panel to manage products, variants, stock, orders, and discounts
- Own the full stack, deploy on a single domain

---

## 2. Tech Stack (Decided)

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router)** — full-stack, single codebase |
| Backend | Next.js **Route Handlers + Server Actions** (no separate backend service) |
| ORM | **Prisma** |
| Database | **PostgreSQL** |
| Styling | **Tailwind CSS** |
| UI components | **shadcn/ui** |
| Animations | **Framer Motion** (GSAP only if a heavy effect needs it) |
| Auth | Auth.js (NextAuth) or Lucia — email/password + sessions |
| Image storage | Cloudinary or UploadThing (or S3-compatible) |
| Deployment | Single domain (Vercel, or VPS with Docker) |
| Dev infra | Docker only for PostgreSQL locally + for production deploy |

**Decision rationale:** the catalog is small and this is a single storefront. A full-stack Next.js app (not a separate NestJS backend) is the industry-standard approach at this scale — simpler, one deploy, no CORS. A separate backend would only be justified by enterprise scale, multiple sales channels, or a planned mobile app.

---

## 3. Architecture & Deployment

- **One domain, one deployment.** No separate frontend/backend domains needed.
  - `ladiesforest.com` → storefront pages
  - `ladiesforest.com/api/*` → API route handlers
  - `ladiesforest.com/admin` → admin panel (protected route group)
- **Rendering pattern:** pages are **Server Components** that fetch data directly from the DB; only interactive pieces (add-to-cart button, cart, filters) are small **Client Components** marked `'use client'`.
- **Docker:** run PostgreSQL in a container for local dev; use a `docker-compose` / Dockerfile for production deploy if self-hosting.

---

## 4. ⭐ Core Concept: Flexible Product Options & Variants

**This is the most important architectural decision. Get this right first.**

Different categories have different variant types (Bras → Size, Perfumes → Volume). So we do **NOT** hardcode a "Size" field. Instead we use a flexible option system (Shopify-style):

- A **Product** can have **0 or more Options** (e.g. an Option named `"Size"` or `"Volume"`).
- Each Option has multiple **values** (e.g. Size: S, M, L).
- Each combination of option values = one **Variant**.
- **Each Variant owns its own `price`, `stock`, and `SKU`.**

**Examples:**
- Bra product → Option `"Size"` with values `S, M, L` → 3 variants
- Perfume product → Option `"Volume"` with values `200ml, 400ml` → 2 variants
- Jewellery product → no options → 1 default variant

This single system handles all current and future product types without code changes.

---

## 5. Data Model (Entities)

High-level entities (implement as Prisma models). Adjust field names as needed.

**Product**
- id, title, slug, description, images[] (array of URLs), basePrice, compareAtPrice (for sale display), status (ACTIVE / DRAFT), tags[], categoryId, createdAt, updatedAt

**Category** (Collection)
- id, name, slug, bannerImage, sortOrder

**ProductOption**
- id, productId, name (e.g. "Size" / "Volume"), values[] (e.g. ["S","M","L"])

**Variant**
- id, productId, optionValues (JSON map, e.g. { "Size": "M" }), sku, price, stock, lowStockThreshold

**StockAdjustment** (audit log)
- id, variantId, change (+/-), reason, createdAt, adminUserId

**Order**
- id, orderNumber, customerId (nullable for guest), items[] (variant + qty + priceAtPurchase), subtotal, discountTotal, shippingTotal, grandTotal, status (PENDING / CONFIRMED / PACKED / SHIPPED / DELIVERED / CANCELLED / RETURNED), paymentMethod (COD / JAZZCASH / EASYPAISA / PAID), paymentStatus, shippingAddress, notes, createdAt

**Customer**
- id, name, email, phone, passwordHash, addresses[], createdAt

**Discount / Coupon**
- id, code, type (PERCENT / FIXED), value, minOrderValue, appliesTo (ALL / CATEGORY / PRODUCT), targetId (nullable), startsAt, endsAt, usageLimit, usedCount, active

**Setting** (key-value store)
- freeDeliveryThreshold (e.g. 3000), announcementText, shippingRules, storeInfo, paymentMethodsEnabled, seoDefaults

**AdminUser**
- id, name, email, passwordHash, role (ADMIN / STAFF), permissions

**Review** (optional)
- id, productId, customerId, rating, comment, approved, createdAt

---

## 6. PART 1 — Admin Panel

Route base: `/admin` (protected).

### 6.1 Dashboard
Today's orders, total revenue, low-stock alerts, top-selling products — at-a-glance overview.

### 6.2 Products (CRUD)
Add / edit / delete. Fields: title, multiple images, description, base price, compare-at price (for sale display), category, status (active/draft), tags.

### 6.3 Options & Variants ⭐
Define product options (Size / Volume), enter values, and set **per-variant price + stock + SKU**. Uses the flexible system from Section 4.

### 6.4 Categories / Collections
Create/edit the 3 categories (Bras, Perfumes, Jewellery). Ordering, banner image, assign products.

### 6.5 Inventory / Stock
Per-variant stock management, low-stock threshold + alerts, and a stock adjustment log (who changed what, when).

### 6.6 Orders
List + detail view. Status flow: PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED → CANCELLED/RETURNED. Mark COD vs Paid. Customer info, order notes, printable invoice.

### 6.7 Discounts / Coupons
Percentage or fixed discount, coupon codes, minimum order value, **free-delivery threshold (the "Rs 3000" rule)**, scheduled sales (start/end date), per-product or per-category discounts, usage limits.

### 6.8 Customers
Customer list, each customer's order history and contact details.

### 6.9 Content / CMS
Homepage slideshow images, announcement bar text (e.g. "Flat 20% OFF"), featured/bestseller product selection, contact page content. Goal: **the store owner can edit these without a developer.**

### 6.10 Settings
Shipping rules, free-delivery threshold, payment methods, store info (name, logo, contact), SEO defaults.

### 6.11 Users / Roles
Admin vs Staff with permission control.

### 6.12 Optional
Reviews moderation; basic reports (sales over time, best sellers).

---

## 7. PART 2 — Customer-Facing Site

### 7.1 Home
Animated hero slider, featured categories, bestsellers, new arrivals, sale section, newsletter signup, WhatsApp chat button.

### 7.2 Shop / All Products
All products with **filters** (category, size/volume, price range) + sorting + pagination. *(Missing in the original Shopify site — important to add.)*

### 7.3 Category Pages
Bras / Perfumes / Jewellery with a banner and filtered products.

### 7.4 Product Detail
Image gallery with zoom, **variant selector** (S/M/L buttons for bras, 200ml/400ml for perfumes), stock status ("only 2 left"), quantity selector, add to cart, description, related products. **Size Guide modal** for bras.

### 7.5 Cart
Cart page + slide-out mini cart, quantity update, and a **"Add Rs X more for free delivery" progress bar** (visualizing the Rs 3000 threshold).

### 7.6 Checkout
Clean checkout: address form, COD + local payment (JazzCash / Easypaisa), order confirmation page.

### 7.7 Account
Login / signup, order history, saved addresses, **order tracking**.

### 7.8 Wishlist
Save favorite products.

### 7.9 Info Pages
About, Contact, FAQ, Size Guide, Return/Refund Policy, Shipping Policy — important for trust in the PK market.

### 7.10 Search
Instant / autocomplete search (existed on original site).

---

## 8. Pakistan-Specific Considerations

- **Currency:** PKR everywhere.
- **Payments:** Shopify handled this before — now we must implement:
  - **COD (Cash on Delivery)** — dominant in Pakistan, must-have.
  - **JazzCash / Easypaisa** integration.
  - Note: Stripe is not directly available in Pakistan.
- **Free delivery** over Rs 3000 (configurable in admin settings).
- **WhatsApp** contact/ordering button converts well in the PK market.

---

## 9. Animations & UX Polish

Using Framer Motion:
- Page transitions
- Product card hover effects (image swap / zoom)
- Add-to-cart animation
- Skeleton loaders for perceived speed
- Scroll-reveal on sections
- Smooth autoplay hero slider

Site must be **fully responsive** (mobile-first — most PK traffic is mobile).

---

## 10. Suggested Folder Structure

```
/app
  /(store)              # customer-facing routes
    /page.tsx           # home
    /shop
    /product/[slug]
    /category/[slug]
    /cart
    /checkout
    /account
  /admin                # protected admin routes
    /dashboard
    /products
    /orders
    /discounts
    /inventory
    /settings
  /api                  # route handlers (webhooks, etc.)
/components
  /ui                   # shadcn components
  /store                # storefront components
  /admin                # admin components
/lib                    # prisma client, utils, auth
/prisma
  schema.prisma
```

---

## 11. Suggested Build Order (Roadmap)

1. **Foundation:** Next.js + Tailwind + shadcn + Prisma + PostgreSQL (Docker) setup.
2. **Data model:** implement the flexible Product/Option/Variant schema (Section 4 & 5) — do this first, everything depends on it.
3. **Admin auth + Products/Variants/Inventory CRUD.**
4. **Categories + CMS + Settings.**
5. **Storefront: home, category, product detail, shop with filters.**
6. **Cart + Checkout (COD first).**
7. **Orders in admin + order tracking for customers.**
8. **Discounts/Coupons + free-delivery logic.**
9. **Customer accounts + wishlist.**
10. **Animations, polish, responsiveness, SEO.**
11. **Local payments (JazzCash/Easypaisa), reviews (optional).**

---

## 12. Key Reminders for the AI Assistant

- The **flexible option/variant system** is the backbone — never hardcode "Size".
- Storefront pages = Server Components; interactive bits = small Client Components.
- All prices in PKR; free-delivery threshold and announcement text come from admin **Settings**, not hardcoded.
- COD is the primary payment method; build checkout around it first.
- Mobile-first, responsive, with smooth Framer Motion animations.
