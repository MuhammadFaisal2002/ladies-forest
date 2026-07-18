# Ladies Forest — Storefront Design Language

Every storefront page/component MUST follow this brief. It is the single source
of truth for look & feel. Read together with `SITE_ANALYSIS.md`.

## Brand personality
Feminine, soft, trustworthy — with confident contrast. Airy layouts, generous
whitespace, rounded-but-not-bubbly corners (`rounded-lg`/`rounded-xl`), subtle
shadows only on hover.

## Color usage rules (tokens from `app/globals.css`)
- `bg-background` — page base (warm near-white).
- `bg-blush` — alternating soft-pink section backgrounds (every 2nd home section).
- `text-primary` / `bg-primary` — raspberry pink. CTAs, active states, sale
  prices, badges, links on hover. The ONLY loud color; use sparingly.
- `bg-forest text-forest-foreground` — deep green contrast. Footer, secondary
  buttons (outline hover fill), small accent chips ("Free Delivery"), section
  eyebrows. This is the "catchy contrast" — pair it against pink, never mix
  both as backgrounds side-by-side in one component.
- `text-gold` — star ratings and jewellery accents only.
- `text-muted-foreground` — supporting copy.
- Sale pattern: price in `text-primary font-semibold`, compare-at in
  `text-muted-foreground line-through text-sm`, badge `bg-primary` white text
  `-20%` style (use `discountPercent()` from `lib/format`).

## Typography
- Headings h1–h4 automatically use Playfair Display (serif) — do NOT override
  with `font-sans`. Body/UI is Jost.
- Section pattern: eyebrow (`text-xs uppercase tracking-[0.3em] text-primary`
  or `text-forest`), then `text-3xl md:text-4xl` heading, optional one-line
  `text-muted-foreground` subtitle, centered on home sections.
- Prices always via `formatPKR()` from `lib/format` — never hand-format.

## Layout
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
- Vertical rhythm: home sections `py-16 md:py-24`; inner pages `py-8 md:py-12`.
- Product grids: `grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6`
  (2-up on mobile like the PK-market expects).
- Mobile-first: every component must look right at 375px wide first.

## Imagery
- Always `next/image` with proper `fill`+`sizes` or width/height; product
  images in `aspect-[3/4]` containers, `object-cover`, `rounded-lg` and
  `bg-muted` behind while loading.

## Motion (GSAP — use the shared helpers, do not hand-roll)
- `<Reveal>` from `components/store/reveal.tsx` wraps sections/cards:
  fade-up on scroll (`y: 24→0, opacity 0→1, 0.7s, power3.out`), stagger 0.08
  for grid children via `<Reveal stagger>`.
- Respect `prefers-reduced-motion` (the helpers already do).
- Hover transitions are CSS (`transition-...`), not GSAP: card image crossfade
  200ms, buttons 150ms.
- Hero slider: GSAP timeline crossfade + slight scale (1.05→1) on the image,
  text lines slide up staggered. Autoplay 5s, pause on hover, dots + arrows.
- Never animate layout properties (width/height); transform+opacity only.

## Components already available
- shadcn/ui in `components/ui/*` (Button, Sheet, Dialog, Select, Skeleton,
  Badge, Accordion, Breadcrumb, Tabs, Sonner toaster...).
- `components/store/product-card.tsx` — ALWAYS use this for product tiles.
- `components/store/reveal.tsx` — scroll animations.
- Store chrome (announcement bar, header + mini-cart, footer, WhatsApp button)
  is composed in `app/(store)/layout.tsx`; pages render content only.

## Data & state rules
- Pages are Server Components; fetch via helpers in `lib/queries.ts` only.
- Interactive leaves are small `"use client"` components taking serializable
  props (no Prisma objects with Decimal/Date across the boundary — map first
  with the serializers in `lib/queries.ts`).
- Cart = `useCartStore` from `lib/cart-store.ts` (zustand + localStorage).
  Adding to cart opens the mini-cart sheet and shows a sonner toast.
- Free-delivery threshold & announcement text come from Settings (via
  layout/props) — NEVER hardcode Rs 3000.
- Currency is PKR everywhere.

## Voice
- English UI copy, short and warm ("Comfort you can live in", "Only 3 left").
- Trust signals: COD badge, free-delivery progress, easy returns mention.
