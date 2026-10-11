# Pawansut Trader — E-commerce Website: Project Specification

> **Source of truth.** Every build decision lives in this file. If something is not written here, do not invent it: use the stated default, or ask the owner. Items are tagged:
> - **[DECIDED]** — confirmed by the owner. Do not change.
> - **[DEFAULT]** — owner did not answer yet; build with this default, make it configurable where noted, and list it in the phase report.
> - **[OWNER-TO-FILL]** — a value only the owner knows. Use a clearly marked placeholder, never a made-up value.

---

## 1. Overview

A mobile-accessories online store for **Pawansut Trader**. Customers browse a product catalog, open a product to see description / variants / warranty, add to cart, check out as a guest, and pay by **COD** or **online (Cashfree)**. After ordering, a ready-made order message is shown which the customer sends to the store on **WhatsApp**. The owner manages everything from a hidden admin dashboard.

| Item | Value |
|---|---|
| Store name | Pawansut Trader **[DECIDED]** |
| Sells | Mobile accessories **[DECIDED]** |
| WhatsApp number | 8505856763 (wa.me format: `918505856763`) **[DECIDED]** |
| Currency | INR (₹) |
| Free delivery | Order subtotal (after discount) ≥ ₹499 → delivery ₹0 **[DECIDED]** |
| Delivery charge | Below ₹499 → ₹80 **[DECIDED]** |
| Delivery area | Free delivery is for **Satyawadi Raja Harish Chandra Hospital, Delhi**. See §3 Open Item 1 **[DECIDED location / DEFAULT scope]** |
| Payments | COD + online via **Cashfree** (account not created yet; integrate later) **[DECIDED]** |
| Customers | Guest checkout, no customer login in v1 **[DEFAULT]** |

---

## 2. Decisions Log

| # | Decision | Status |
|---|---|---|
| D1 | Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Firebase Auth + Firestore + Storage | DECIDED |
| D2 | No `react-router`. Next.js App Router handles all routing | DECIDED |
| D3 | Hidden admin URL (secret path), admin logs in with ID/password | DECIDED |
| D4 | Admin can: manage listings, see customers, see orders, create coupons, and more | DECIDED |
| D5 | Order phases: Order → Payment Verify → Confirm → Dispatch → Delivered | DECIDED |
| D6 | Announcement carousel at the very top of the customer side | DECIDED |
| D7 | Policy pages written by the assistant: Privacy, Terms & Conditions, Refund & Warranty, Cookies | DECIDED |
| D8 | Warranty is set **per product** by admin (yes/no + duration) | DECIDED |
| D9 | Physical warranty card is handed to the customer for warranty products; **card is mandatory for refund / warranty claim** | DECIDED |
| D10 | robots.txt, sitemap, meta descriptions, WhatsApp/social link preview image | DECIDED |
| D11 | Forms: mandatory fields marked `*`; phone accepts digits only | DECIDED |
| D12 | UI follows the Apple-style dark design reference (see §5), with Inter instead of SF Pro | DECIDED |
| D13 | All suggested add-ons are included: search/filter/sort, variants + stock, order tracking, wishlist, delivery rules, reviews (moderated), WhatsApp button, analytics, invoice print, CSV export, image upload, low-stock alert, server-side price/stock/coupon checks | DECIDED |

---

## 3. Open Items (build with defaults; all must be configurable and listed in reports)

1. **Delivery scope** **[DEFAULT]**: delivery is available **only at Satyawadi Raja Harish Chandra Hospital** (`settings/store.restrictDeliveryToHospital = true`). The checkout shows a notice: *"Delivery is currently available at Satyawadi Raja Harish Chandra Hospital, Delhi."* Admin can switch this off in Settings, which allows any address (same ₹499 / ₹80 rule). Owner has not confirmed whether other areas are served.
2. **Customer accounts** **[DEFAULT]**: guest checkout only. Orders are tracked via Order ID + phone. Customer login is Phase-2 backlog (§21).
3. **Admin email** **[OWNER-TO-FILL]**: set via `scripts/set-admin.mjs <email>`. Never hardcode.
4. **Secret admin path** **[OWNER-TO-FILL]**: env `ADMIN_PATH` (e.g. `manage-xxxx`). Never hardcode, never list in robots.txt or sitemap.
5. **Seller details for policies** **[OWNER-TO-FILL]**: legal/shop name, shop address, support email. Use the placeholders in Appendix A.
6. **Return window / refund timeline** **[DEFAULT]**: 7 days from delivery, refund within 5–7 working days after approval. Owner to confirm.
7. **Prices inclusive of GST?** **[OWNER-TO-FILL]**: until confirmed, show "Prices in ₹" and no tax breakup. Invoice prints without GST lines; add a clearly marked TODO.
8. **Default OG image** **[OWNER-TO-FILL]**: owner supplies a 1200×630 store image at `public/og-default.png`. Until then the build generates nothing fake; product pages use the product image, other pages omit `og:image` and the report flags it.
9. **Unique warranty card numbers** **[DEFAULT]**: on, format `PT-W-0001` (see §16).

---

## 4. Tech Stack & Dependency Rules

| Area | Choice |
|---|---|
| Runtime | Node 20 LTS (Next 14 needs ≥ 18.17) |
| Framework | `next@14` (App Router, **not** Pages Router), `react@18`, `react-dom@18` |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS v3 (what `create-next-app@14` installs) |
| Animation | `framer-motion` |
| Backend | Next.js Route Handlers (Node runtime) + `firebase-admin` |
| Client Firebase | `firebase` (modular v9+ API) — Auth and Storage only |
| Database | Cloud Firestore |
| Validation | `zod` (shared by client and server) |
| Icons | `lucide-react` |
| Charts | `recharts` (admin analytics only) |
| Font | Inter via `next/font/google` |

**Rules**
- Install only the packages above. Anything else needs an explicit note in `DECISIONS.md` with the reason.
- After install, pin exact versions in `package.json` and record them in `PROGRESS.md`.
- Before using any library API, read its installed type definitions or its official docs. **Never write an API call from memory if it can be checked.**
- **Do not use `react-router-dom`.**
- Firebase Admin SDK is **server-only**. Never import `lib/firebase-admin.ts` from a client component.
- `middleware.ts` runs on the Edge runtime: it must not import `firebase-admin`.

---

## 5. Design System (Apple-style dark reference, adapted)

Mood: midnight hardware gallery. Black stages, charcoal bands, one blue accent for purchase actions, big calm type, large rounded tiles, almost no shadows.

### 5.1 Colors
| Token | Value | Use |
|---|---|---|
| obsidian | `#000000` | Page background, hero, product-tile canvas |
| graphite | `#0e0e0e` | Raised nav / dark controls |
| carbon | `#1d1d1f` | Content bands, panels, announcement strip |
| steel | `#333336` | Hairline borders, translucent control fills |
| slate | `#6e6e73` | Input outlines, dividers |
| ash | `#86868b` | Muted body copy, metadata |
| porcelain | `#f5f5f7` | Primary text on dark |
| white | `#ffffff` | Product image tiles, light cards |
| apple-blue | `#0071e3` | Filled primary buttons (Add to cart, Buy now, Place order) |
| electric-link | `#2997ff` | Links on dark surfaces |
| cobalt-link | `#0066cc` | Links on white surfaces |
| copper-new | `#b64400` | "New" label only (use a lighter tint if contrast < 4.5:1) |
| optical-yellow | `#ffd500` | Rare emphasis (e.g. warranty badge) |
| **error** (added) | `#ff453a` | Form errors, out-of-stock, failed payment |
| **success** (added) | `#30d158` | In stock, paid, delivered |
| **warning** (added) | `#ffd60a` | Low stock |

Only gradient allowed: `linear-gradient(#1d1d1f, #000000 288px)` section fade.

### 5.2 Typography (Inter replaces SF Pro; SF Pro is not licensed for web)
- Body/UI: Inter 400/500/600; sizes 12, 14, 17, 20, 26, 44; slightly negative tracking (~ -0.01em).
- Display: Inter 600; 19, 28, 32, 40, 48, 56, 80, 96. **On mobile clamp** large sizes, e.g. `clamp(2.25rem, 8vw, 5rem)`.
- Type scale roles: utility-nav 12/400, body 14/400, body-strong 14/600, section-nav 17/500, product-label 19/600, feature-stat 28/600, hero-product-name 32/600, display 80/600, display-xl 96/600.

### 5.3 Shape, spacing, elevation
- Radius: cards/images **28px**; nav containers 20px; primary buttons **pill (≥170px)**; inputs pill (980px) for single-line fields, **20px for textarea/address**; links 10px.
- Spacing scale: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 48, 90, 144. Section gap 24px, card padding 16px.
- **No shadows.** Separate layers with surface shifts and 1px keylines (`#282828` / `#6e6e73`).

### 5.4 Component rules
- **Announcement strip**: `#1d1d1f`, 14px, text `#f5f5f7`, links `#2997ff`; auto-rotates (see §7.1).
- **Global nav**: 44px, black, 12px labels at 80% white; logo/cart/search icons `#cccccc`.
- **Primary button (Blue pill)**: fill `#0071e3`, white text, padding ~7px × 14px (compact) up to 12px × 22px (hero/checkout).
- **Secondary (Outlined pill)**: transparent, `#f5f5f7` text, 1px `#6e6e73` outline.
- **Price capsule**: `rgba(66,66,69,0.72)` fill, 36px radius.
- **Product tile**: 28px radius. **Image area is a white (`#ffffff`) 28px tile** so white-background product photos look uniform (adaptation of the "Pale Comparison Card"); info area on `#000`/`#1d1d1f`.
- **Inputs**: fill `rgba(255,255,255,0.04)`, 1px `#6e6e73` border, text `#f5f5f7`, focus 1px `#0071e3` outline offset 1px. Required label shows red `*`.
- **Badges**: text-only for "New"; warranty badge uses a small pill (`#333336` fill, `#ffd500` text).
- **Admin dashboard** uses the same dark system: `#1d1d1f` panels, `#000` tiles, 28px radius, tables with 1px keylines.

### 5.5 Don'ts
No drop shadows; no blue section backgrounds; no feature-tile radius below 28px; no rectangular primary buttons; no white headlines on dark when `#f5f5f7` is available; no gradients other than the carbon→obsidian fade; do not use Apple's logo, product images, or trademarked names.

### 5.6 Motion (Framer Motion)
Subtle only: fade/slide-in on scroll (opacity + 12px translate), announcement slide, cart drawer slide, button press scale 0.98. Respect `prefers-reduced-motion` (disable non-essential motion).

---

## 6. Routes & Information Architecture

**Customer (route group `(store)`)**
| Route | Purpose |
|---|---|
| `/` | Announcement strip, nav, hero, categories, featured/new products, full catalog grid |
| `/products` | Catalog with search, category filter, sort, pagination/"load more" |
| `/products/[slug]` | Product detail |
| `/category/[slug]` | Category listing |
| `/cart` | Cart page (plus slide-in mini cart) |
| `/checkout` | Details form + payment mode |
| `/order-success/[id]` | Confirmation + WhatsApp template + button |
| `/track` | Track by Order ID + phone |
| `/wishlist` | Saved products (localStorage) |
| `/privacy-policy`, `/terms-and-conditions`, `/refund-and-warranty-policy`, `/cookies-policy` | Policy pages |
| `/contact` | Seller details + WhatsApp link |

**Admin** — lives under a **dynamic top-level segment**: `app/[adminPath]/...`.
- The admin layout (server component) compares `params.adminPath` to `process.env.ADMIN_PATH`; mismatch → `notFound()`.
- Static customer routes always win over the dynamic segment, so they are unaffected.
- Admin pages: `login`, `dashboard`, `products`, `products/new`, `products/[id]`, `categories`, `orders`, `orders/[id]`, `orders/[id]/invoice`, `customers`, `coupons`, `announcements`, `reviews`, `analytics`, `settings`.
- Admin pages set `robots: { index: false, follow: false }` and the response header `X-Robots-Tag: noindex, nofollow`.

**API (Route Handlers, Node runtime)** — see §11.

---

## 7. Customer Features (detail)

### 7.1 Announcement carousel (top of every customer page)
- Source: Firestore `announcements` where `isActive == true`, ordered by `order`.
- Auto-advance every 4 s with Framer Motion `AnimatePresence`; pause on hover/focus; prev/next arrows and dots when more than one; if none active, render nothing (no empty bar).
- Text + optional link. Rendered server-side first (no flash), then hydrated.

### 7.2 Home
- Hero (obsidian stage): headline, short subline, blue "Shop now" pill. Featured product image in a 28px frame if a featured product exists.
- Category chips/tiles, "New arrivals", "Featured", then the product grid.
- Floating **WhatsApp chat button** (bottom-right, opens `wa.me/918505856763` with a greeting).

### 7.3 Catalog
- Search by name/tags (server-side or client-side over the already loaded page of results; define in code comment which).
- Filter by category; price range optional; in-stock toggle.
- Sort: newest, price low→high, price high→low, name.
- Product card: white image tile, name, price (and struck-through MRP with % off when `mrp > price`), warranty badge if enabled, out-of-stock badge, wishlist heart.

### 7.4 Product page
- Image gallery (swipe on mobile), name, price capsule, MRP/discount, short description, full description, specs table (label/value).
- **Variant selector** (size/color/type). Selecting a variant updates price (if `priceOverride`) and stock status. A product without variants has one hidden default variant.
- **Warranty block** when `warranty.enabled`: "X months warranty. A physical warranty card will be delivered with the product. The card is required for any warranty claim or refund." When disabled: show nothing or "No warranty".
- Quantity stepper (1–10, capped by stock), **Add to cart** (blue), **Buy now** (outlined; goes to checkout with that item).
- Reviews list (approved only) + average rating; "Write a review" per §7.9.
- Delivery info line: free above ₹499, else ₹80, plus the delivery-area notice.
- JSON-LD `Product` structured data (name, image, description, price, currency, availability).

### 7.5 Cart
- Stored in `localStorage` (key `pt_cart_v1`), a React context. Stores only `{productId, variantId, qty}`; names/prices shown in the UI are **re-fetched from the server** for display. **Prices in localStorage are never trusted by the server.**
- Mini cart drawer + `/cart` page: change qty, remove, coupon input (preview via API), subtotal, discount, delivery charge, total, and a nudge "Add ₹X more for free delivery".
- Items that became inactive or out of stock are flagged and block checkout until fixed.

### 7.6 Wishlist
- `localStorage` key `pt_wishlist_v1` (array of product IDs). Page lists them with add-to-cart.

### 7.7 Checkout (guest)
Fields (`*` = mandatory, red asterisk, `aria-required`):
| Field | Rule |
|---|---|
| Full name * | 2–60 chars; Unicode letters, spaces, `.` `'` `-` only |
| Mobile number * | exactly 10 digits, `^[6-9]\d{9}$`; `type="tel"`, `inputMode="numeric"`, `maxLength=10`; **non-digits are stripped as typed, alphabets cannot be entered** |
| Address * | 10–250 chars (hint: building / ward / department / floor / room) |
| Landmark | optional, ≤100 |
| City | default "Delhi", editable |
| Pincode * | `^[1-9]\d{5}$` |
| Email | optional, valid format |
| Payment mode * | COD or Online |
| Honeypot | hidden field; if filled, silently reject |

Validation runs in the browser (inline errors under each field, first error focused) **and** again on the server with the same zod schema. Server errors are mapped back to fields.

Order summary beside the form: items, coupon, subtotal, discount, delivery, total.
If `restrictDeliveryToHospital` is true, show the delivery-area notice above the form and require the user to tick **"I confirm delivery is at Satyawadi Raja Harish Chandra Hospital"** *(DEFAULT behaviour; admin can disable)*.
"Online" is **disabled with a note** when Cashfree is not configured (see §9).

### 7.8 Order success + WhatsApp template
After a successful order the page `/order-success/[id]` shows the order summary and a prefilled message with a **"Send on WhatsApp"** button (`https://wa.me/918505856763?text=<encoded>`). See Appendix B for the exact template. The page must work for COD immediately; for online it shows the real payment status (never trusts the redirect alone, see §9).

### 7.9 Tracking and reviews
- `/track`: form with **Order ID** + **mobile**. API returns data only when **both** match. Shows a timeline of the five phases with timestamps, items, totals, warranty note.
- Reviews: allowed only if the person enters an **Order ID + phone** matching an order in status `delivered` that contains the product. Rating 1–5, name, text (≤500). Saved with `approved:false`; admin approves. One review per order item.

### 7.10 Delivery charge rule (single function, used by cart, checkout and the server)
`deliveryCharge = (subtotal - discount) >= freeDeliveryAbove ? 0 : deliveryCharge`
Defaults: 499 and 80, read from `settings/store`, with these constants as fallback in `lib/store-config.ts`. The **server** result is authoritative.

---

## 8. Orders, Statuses, Stock

### 8.1 Statuses
`placed` → `payment_verified` → `confirmed` → `dispatched` → `delivered`, plus `cancelled`.
- **Online**: `placed` → (webhook/verify) `payment_verified` → admin `confirmed` → `dispatched` → `delivered`.
- **COD**: `placed` → admin `confirmed` (payment_verified is skipped) → `dispatched` → `delivered`; payment status becomes `paid` when admin marks delivered.
- Cancel allowed from `placed`, `payment_verified`, `confirmed` (and `dispatched` with an admin note). Cancelling **restores stock** in a transaction.
- Every change appends `{status, at, note?, by}` to `statusHistory`. Illegal transitions are rejected by the server (transition table lives in one file).

### 8.2 Order creation (server, one Firestore transaction)
1. Validate body with zod; honeypot; rate limit.
2. Read each product + variant; require `isActive` and `stock >= qty`.
3. Compute unit price from the database (`variant.priceOverride ?? product.price`) — **client prices ignored**.
4. Validate coupon (§12.3) and compute discount; compute delivery charge (§7.10); compute total.
5. Read/increment `counters/orders` → human order id `PT-000001` style.
6. Decrement stock; increment `coupons.usedCount`; upsert `customers/{phone}`.
7. Write order with `status:'placed'`, `payment:{method, status:'pending'}`, a copy of each item's warranty info (`warranty:{enabled, months}`), and first `statusHistory` entry.
8. Return `{docId, orderId, total}`. For online payments, then create the gateway session (§9).

Low-stock: variants with `stock <= 3` show "Only few left" to customers and appear in the admin low-stock list.

---

## 9. Payments (Cashfree) — integrate later, stub now

**State now:** owner has not created the Cashfree account. Build the abstraction and routes, with online payment **disabled** until keys exist.

- `lib/payments/index.ts` — common interface `createPayment(order)`, `verifyPayment(orderId)`, `handleWebhook(req)`.
- `lib/payments/cashfree.ts` — Cashfree implementation. **Do not write Cashfree request/response fields from memory.** In Phase 9, read Cashfree's official Payment Gateway docs (orders API, checkout SDK for web, webhooks and signature verification, order status) and implement exactly what they say. Use the sandbox environment first.
- Routes: `POST /api/payments/cashfree/create`, `POST /api/payments/cashfree/webhook`, `GET /api/payments/cashfree/verify`.
- `isOnlinePaymentEnabled()` returns false when `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` are missing → checkout hides/disables "Online" with "Online payment coming soon".
- **Security rules:** the amount sent to Cashfree is the server-computed `order.total`; the webhook signature must be verified before updating anything; the return/redirect page re-checks status **on the server**; never mark an order paid from client input; webhook handler must be idempotent.
- Payment status values: `pending | paid | failed | refunded`. Refunds in v1 are manual (admin marks `refunded`); gateway refund API is Phase-2.

---

## 10. Data Model (Firestore)

All timestamps are Firestore `Timestamp` (or ms numbers if stated consistently in `types/`; choose one and keep it).

**`products/{id}`**
`name, slug (unique), description, shortDescription?, images[] (Storage URLs), category (slug), tags[], price, mrp, specs[{label,value}], variants[{id,label,size?,color?,stock,priceOverride?}], warranty{enabled:boolean, months:number, note?:string}, isActive, isFeatured, isNew, ratingAvg, ratingCount, createdAt, updatedAt`

**`categories/{id}`** `name, slug, image?, order`

**`orders/{id}`**
`orderId, customer{name,phone,address,landmark?,city,pincode,email?}, items[{productId,variantId,name,variantLabel,price,qty,image,warranty{enabled,months}|null}], subtotal, discount, deliveryCharge, total, couponCode?, payment{method,status,gateway?,gatewayOrderId?,txnId?,paidAt?}, status, statusHistory[], warrantyCards[{number,productId,variantId,issuedAt}], warrantyCardIssued:boolean, createdAt, updatedAt`

**`customers/{phone}`** `name, phone, lastAddress, ordersCount, totalSpent, lastOrderAt` (maintained in the order transaction; admin-only)

**`coupons/{CODE}`** (doc id = uppercase code) `code, type:'percent'|'flat', value, minOrder, maxDiscount?, startsAt?, expiresAt?, usageLimit?, usedCount, isActive`

**`announcements/{id}`** `text, link?, isActive, order`

**`reviews/{id}`** `productId, orderId, name, rating(1-5), text, approved, createdAt`

**`settings/store`** `whatsappNumber, freeDeliveryAbove(499), deliveryCharge(80), restrictDeliveryToHospital(true), deliveryLocationName, storeName, supportEmail?, address?`

**`counters/orders`** `{value}` and **`counters/warranty`** `{value}` — only changed inside transactions.

Required Firestore indexes (create when the console asks, and document them in `firestore.indexes.json`): products by `isActive + category + createdAt`, products by `isActive + price`, orders by `status + createdAt`, orders by `customer.phone + createdAt`.

---

## 11. API Routes

All Route Handlers run on the **Node runtime** (`export const runtime = 'nodejs'`). All inputs go through zod. All errors return `{ error: { code, message, fields? } }` with proper HTTP status. Public routes are rate-limited (§12.4).

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/orders/create` | public | §8.2 |
| `POST /api/coupons/validate` | public | Preview discount for cart (same logic as order creation) |
| `POST /api/track` | public | Order ID + phone → limited order view |
| `POST /api/reviews/create` | public | §7.9 |
| `POST /api/admin/session` | ID token | Verify token has `admin:true`, create session cookie |
| `DELETE /api/admin/session` | admin | Logout |
| `/api/admin/products` (+ `[id]`) | admin | CRUD, calls `revalidatePath` |
| `/api/admin/categories`, `/announcements`, `/coupons`, `/settings` | admin | CRUD |
| `PATCH /api/admin/orders/[id]/status` | admin | Status transition with note |
| `PATCH /api/admin/orders/[id]/warranty-card` | admin | Mark issued + generate card numbers |
| `PATCH /api/admin/orders/[id]/payment` | admin | Mark COD paid / refunded |
| `PATCH /api/admin/reviews/[id]` | admin | Approve / delete |
| `GET /api/admin/analytics`, `/export/orders` | admin | Aggregates, CSV |
| `POST /api/payments/cashfree/*` | see §9 | Phase 9 |

Every admin handler starts with a shared `requireAdmin(request)` helper that verifies the session cookie with `adminAuth.verifySessionCookie(cookie, true)` and checks `claims.admin === true`.

---

## 12. Security

### 12.1 Admin auth flow
1. Admin signs in at `/{ADMIN_PATH}/login` with Firebase Auth email + password (client SDK).
2. Client sends the ID token to `POST /api/admin/session`; server verifies it, **requires `admin: true` custom claim**, then creates an **httpOnly, secure, sameSite=strict session cookie** (≤ 5 days).
3. The admin layout (Node server component) verifies the cookie on every request; missing/invalid → redirect to login.
4. Admin custom claim is set with `scripts/set-admin.mjs <email>` (uses the Admin SDK). After setting it the admin must sign out/in to refresh the token.
5. `middleware.ts` (Edge) may only do cheap checks (e.g. cookie presence redirect). **Real verification happens in Node.**
6. The secret path is an extra layer only. **Real security = claim + session cookie + rules.**

### 12.2 Firestore rules (all writes through the server; Admin SDK bypasses rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
    match /{document=**} {
      allow read: if isAdmin();   // admin-only realtime reads (optional)
      allow write: if false;      // every write goes through API routes
    }
  }
}
```
Public data (products, announcements, approved reviews, settings) is read **on the server** with the Admin SDK and rendered with ISR (`revalidate = 60`), so no public client rules are needed.

### 12.3 Image Hosting (ImgBB API v1)

Firebase Storage has been replaced with the ImgBB API v1 for product catalog image hosting.
- **Upload Route**: Server-side route `POST /api/admin/upload-image` (runtime `nodejs`) verifies `requireAdmin()`, validates image file format (JPEG, PNG, WebP) and size (≤ 2 MB after client compression), and forwards via multipart `FormData` to `https://api.imgbb.com/1/upload?key=...`.
- **Response**: Returns `{ url: data.display_url || data.url, thumbUrl: data.thumb?.url, deleteUrl: data.delete_url }`.
- **Client Compression**: Admin form compresses images client-side to max ~1200px (WebP, quality 0.85, target ≤ 1 MB) prior to upload, and supports multiple images with cover reordering.
- **Risk note**: External hosting on ImgBB; no documented programmatic delete API endpoint (only manual `data.delete_url` web link); images remain hosted on ImgBB external infrastructure. Firebase `storage.rules` is removed.

### 12.4 Other protections
- Never trust client price, total, discount, delivery charge, or stock.
- **Coupon validation (server)**: active, within start/expiry, `subtotal >= minOrder`, `usedCount < usageLimit`; percent discount capped by `maxDiscount`; flat discount never exceeds subtotal; code normalized to uppercase.
- **Rate limiting** on public POST routes: best-effort in-memory limiter + honeypot. Document the limitation (serverless instances don't share memory); a shared store (e.g. Upstash) is a Phase-2 upgrade.
- Escape/encode all user text in WhatsApp messages and admin views; never render raw HTML from users.
- Secrets only in env; `.env.local` in `.gitignore`; `.env.example` has empty placeholders.
- Security headers via `next.config`: `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. (Do not add a strict CSP that would break Cashfree checkout without testing.)

---

## 13. Forms & Validation (summary)

One zod schema per form in `lib/validation/`, imported by both the form and the API route.
- Mandatory fields show a red `*` after the label and have `aria-required="true"`.
- Phone: strips non-digits on input, shows "Enter a valid 10-digit mobile number" on error.
- Errors appear under the field (`aria-describedby`), submit button shows a loading state, double-submit prevented.
- Admin forms follow the same rules (product name required, price > 0, `mrp >= price`, stock integer ≥ 0, slug unique, coupon code `^[A-Z0-9]{3,20}$`).

---

## 14. SEO & Sharing

- `metadataBase` = `NEXT_PUBLIC_SITE_URL`. Every page exports `metadata` / `generateMetadata` with unique **title and meta description** (≤ 160 chars).
- **Open Graph + Twitter card** on all public pages. Product pages: `og:title` = product name, `og:description` = short description + price, `og:image` = first product image as an **absolute URL**, `og:type` = `website`/`product`. Recommended image 1200×630, under ~300 KB. Note in code comments that WhatsApp caches previews.
- `app/robots.ts`: allow `/`; disallow `/api/`, `/cart`, `/checkout`, `/order-success`, `/track`; link the sitemap. **Do not list the admin path.**
- `app/sitemap.ts`: home, products, categories, policy pages, `/contact`, plus active products from Firestore. Excludes admin, cart, checkout, success, track.
- JSON-LD: `Product` (product pages), `Organization`/`Store` (home).
- Semantic HTML, one `h1` per page, alt text on images, canonical URLs, `lang="en"` (Hindi UI strings are Phase 2).

---

## 15. Policies, Cookie Notice, Footer

Pages in §6 are static server-rendered pages whose content lives in `content/policies/*.md` (or `.tsx`), seeded from **Appendix A**. Placeholders in `[SQUARE_BRACKETS]` must be visibly flagged in the Phase report until the owner fills them. Footer: store name, policy links, contact, WhatsApp link. Cookie notice: small bottom bar, "We use only essential storage (cart, wishlist, preferences). Learn more." + **Got it** button; choice stored in `localStorage` (`pt_cookie_ok`).

---

## 16. Warranty System

- **Per product** (admin form): toggle `warranty.enabled`, `months` (1–60), optional note. Listing/product page show the badge and the physical-card note.
- **Order snapshot**: each order item stores its own `warranty{enabled,months}` at order time, so later product edits never change an old order.
- **Physical card** (owner hands it over): in admin order page, the toggle **"Warranty card issued"** generates, for every warranty item, a unique number `PT-W-0001…` (from `counters/warranty`, in a transaction) and stores them in `order.warrantyCards`. A **printable card sheet** shows: card number, order ID, product + variant, warranty months, issue date, store name/contact — so the owner can print/write it on the card.
- **Claim lookup**: admin search box accepts a card number or Order ID; shows the order, card status, issue date, warranty expiry and a banner **"Physical card + bill/Order ID required for refund or warranty claim."**
- Warranty line also appears in the order-success page, the WhatsApp template, and the invoice.

---

## 17. Project Structure

```
app/
  (store)/ page.tsx, products/, category/, cart/, checkout/, order-success/[id]/, track/, wishlist/, contact/,
           privacy-policy/, terms-and-conditions/, refund-and-warranty-policy/, cookies-policy/
  [adminPath]/ layout.tsx (guard), login/, dashboard/, products/, categories/, orders/, customers/,
               coupons/, announcements/, reviews/, analytics/, settings/
  api/ orders/, coupons/, track/, reviews/, admin/, payments/cashfree/
  robots.ts  sitemap.ts  not-found.tsx  error.tsx  layout.tsx  globals.css
components/ ui/, store/, admin/
lib/ firebase.ts, firebase-admin.ts, store-config.ts, delivery.ts, order-status.ts,
     auth/require-admin.ts, payments/{index,cashfree}.ts, validation/*.ts, data/*.ts (server data layer), whatsapp.ts, format.ts
types/ index.ts
content/policies/*.md
scripts/ set-admin.mjs, seed.mjs
public/ og-default.png (owner supplies)
firestore.rules  firestore.indexes.json
PROGRESS.md  DECISIONS.md  .env.example
```

---

## 18. Environment Variables (`.env.example`, values left empty)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=        # keep \n escaped
ADMIN_PATH=                         # secret admin path segment, e.g. manage-xxxx
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENV=sandbox                # sandbox | production
IMGBB_API_KEY=                      # server-only API key for ImgBB image hosting
```

---

## 19. Build Plan (phases)

Each phase ends with: `npx tsc --noEmit`, `npm run lint`, `npm run build` all passing, the phase's acceptance checks verified, and an entry in `PROGRESS.md`.

**Phase 0 — Verify environment.** Node ≥ 18.17 (prefer 20). Scaffold with `create-next-app@14` (TypeScript, Tailwind, App Router, ESLint, no `src/`). Confirm the installed Next/React/Tailwind majors. *Accept:* dev server starts.

**Phase 1 — Foundation.** Dependencies (§4), Tailwind theme tokens (§5), Inter, global layout, `lib/store-config.ts`, `types/`, Firebase client + admin modules, `firestore.rules`, `.env.example`, `.gitignore` check, `PROGRESS.md`, `DECISIONS.md`. *Accept:* build passes; no secret in repo; tokens render on a scratch page.

**Phase 2 — Public catalog.** Server data layer, `scripts/seed.mjs` (Appendix C, flagged as sample data), nav, announcement strip, hero, home, `/products`, category pages, search/filter/sort, product page with variants + warranty block, SEO metadata + JSON-LD for products. *Accept:* seeded products render; variant changes price/stock; invalid slug → 404.

**Phase 3 — Cart & wishlist.** Cart context/localStorage, mini drawer, cart page, wishlist, delivery nudge, stock/active flags. *Accept:* cart survives reload; tampering localStorage prices changes nothing server-side (verified in Phase 4).

**Phase 4 — Checkout & orders (COD).** Validation schemas, checkout form (§7.7), `/api/orders/create` (§8.2), `/api/coupons/validate`, delivery rule, order-success + WhatsApp template, `/track`, payment abstraction + `isOnlinePaymentEnabled()` (Online disabled). *Accept:* COD order creates doc, decrements stock, increments counters; client-side price tampering rejected; phone with letters impossible; honeypot rejects.

**Phase 5 — Admin foundation + catalog management.** `require-admin`, session API, `set-admin.mjs`, `[adminPath]` guard + login, dashboard shell, products CRUD with ImgBB v1 image upload + warranty fields, categories, announcements, settings (incl. delivery toggle). *Accept:* `/{ADMIN_PATH}` loads only after admin login; wrong path → 404; non-admin account rejected; edits revalidate public pages.

**Phase 6 — Admin orders, customers, coupons.** Orders list/detail, status flow with notes, cancel + stock restore, COD paid, warranty card issue + printable sheet + claim lookup, WhatsApp status-message links, invoice print page, CSV export, customers page, coupons CRUD, low-stock list. *Accept:* illegal transitions blocked; card numbers unique and sequential; invoice prints cleanly.

**Phase 7 — Policies, SEO, reviews, polish of content.** Four policy pages (Appendix A), cookie notice, footer, `/contact`, `robots.ts`, `sitemap.ts`, OG/Twitter tags verified, reviews flow + moderation, wishlist polish. *Accept:* sitemap lists products, excludes admin; robots does not reveal admin path; unverified reviews impossible.

**Phase 8 — Analytics & hardening.** Analytics page (revenue by day, orders by status, top products), rate limiting, security headers, error/not-found/loading states, accessibility pass (focus, labels, contrast), responsive pass (360px upward), performance pass (images, ISR). *Accept:* Lighthouse run recorded in the report; no console errors.

**Phase 9 — Cashfree integration (only after owner provides sandbox keys).** Read official Cashfree docs, implement create / webhook (signature verified) / verify, enable "Online", test in sandbox, document go-live steps (production keys, webhook URL, domain). *Accept:* a sandbox payment flips the order to `payment_verified` via webhook; fake/unsigned webhook is rejected; repeated webhook is idempotent.

---

## 20. Definition of Done

- All phases above accepted; `tsc`, lint and build clean.
- Manual test script in `PROGRESS.md` executed for: browse → variant → add to cart → coupon → checkout (COD) → success → WhatsApp link → track → admin login → status changes → warranty card → invoice → CSV.
- No secrets committed; `.env.example` complete; README with setup + deploy (Vercel) steps.
- Every `[OWNER-TO-FILL]` and `[DEFAULT]` item listed in a final "Owner checklist".

---

## 21. Out of Scope for v1 / Backlog

Customer accounts + saved addresses; gateway refund API; auto-cancel of unpaid online orders (needs a scheduler); shared-store rate limiting; Hindi language toggle; GST invoicing; email notifications; multi-admin roles; product bulk import.

---

# Appendix A — Policy Drafts (general drafts; owner must review before going live; not legal advice)

Replace placeholders: `[SELLER_NAME]` = Pawansut Trader (owner to confirm legal name), `[SHOP_ADDRESS]`, `[SUPPORT_EMAIL]`. Contact number shown: WhatsApp +91 8505856763. Add "Last updated: [DATE]" to every page.

## A1. Privacy Policy
**Who we are.** Pawansut Trader ("we") sells mobile accessories online. Contact: [SUPPORT_EMAIL], WhatsApp +91 8505856763, [SHOP_ADDRESS].
**What we collect.** Name, mobile number, delivery address, landmark, city, pincode, optional email, order details, and the messages you send us on WhatsApp. Admin-side we also keep order and delivery history.
**Why.** To process and deliver orders, confirm payments, provide warranty and support, send order updates (including on WhatsApp), prevent fraud, and meet legal/accounting duties.
**Payments.** Online payments are handled by our payment partner (Cashfree). We do not store your card, UPI PIN or net-banking details. COD payments are collected on delivery.
**Where data is stored.** On Google Firebase/Google Cloud services. Access is limited to the store owner/authorised staff.
**Sharing.** We do not sell your data. We share it only with the payment partner, and with authorities if the law requires.
**Retention.** We keep order and warranty records as long as needed for service, warranty claims, taxes and legal requirements.
**Your choices.** You may ask us to correct or delete your personal data by contacting us; some records may be kept where the law requires.
**Cookies/local storage.** See the Cookies Policy.
**Security.** We use reasonable technical safeguards, but no online system is perfectly secure.
**Children.** The site is not meant for children under 18 placing orders on their own.
**Changes.** We may update this policy; the latest version is always on this page.
**Grievance contact.** [GRIEVANCE_OFFICER_NAME], [SUPPORT_EMAIL], WhatsApp +91 8505856763. We aim to acknowledge complaints within [48 hours] and resolve within [30 days].

## A2. Terms & Conditions
1. **Use of the site.** By using the site or placing an order you accept these terms.
2. **Products & prices.** Prices are in Indian Rupees (₹). Images are for illustration; minor variations in colour/packaging may occur. We may correct pricing or stock errors and cancel affected orders with a full refund.
3. **Orders.** An order is confirmed only after we confirm it (status "Confirmed"). We may decline or cancel orders (for example stock issues, incorrect details or suspected fraud).
4. **Payment.** COD or online payment via our payment partner. Online orders are verified after payment confirmation.
5. **Delivery.** Delivery currently covers: [Satyawadi Raja Harish Chandra Hospital, Delhi — owner to confirm]. Delivery is free for orders of ₹499 or more (after discounts); below ₹499 a delivery charge of ₹80 applies. Delivery times are estimates.
6. **Cancellation.** You may request cancellation before dispatch via WhatsApp with your Order ID.
7. **Returns, refunds & warranty.** Governed by the Refund & Warranty Policy.
8. **Coupons.** Valid for the stated period and conditions; one coupon per order unless stated; we may withdraw coupons that are misused.
9. **Your responsibilities.** Provide correct details; do not misuse the site or attempt unauthorised access.
10. **Intellectual property.** Site content, logo and design belong to us or their respective owners; do not copy without permission. Brand names on products belong to their owners.
11. **Liability.** To the extent permitted by law, we are not liable for indirect losses; our liability is limited to the amount paid for the affected order. This does not affect your statutory consumer rights.
12. **Governing law.** Indian law; courts at [Delhi] have jurisdiction [owner to confirm].
13. **Contact.** [SUPPORT_EMAIL], WhatsApp +91 8505856763.

## A3. Refund & Warranty Policy
**1. Eligibility for return/refund.** Report within **[7] days of delivery** if the product is defective, damaged in transit, or not what you ordered. Contact us on WhatsApp (+91 8505856763) with your Order ID and clear photos/video.
**2. Condition.** Product must be in original condition and packaging with all accessories. Items that show misuse, physical/liquid damage or tampering are not eligible. [Owner to list any non-returnable items, e.g. opened earphones.]
**3. Warranty.** Warranty applies **only** to products shown with a warranty badge on the product page. The warranty period is stated on the product page and on your order.
**4. Physical warranty card — mandatory.** For every warranty product we hand over a **physical warranty card** (it carries a card number, Order ID, product, warranty period and date). **The original warranty card must be presented for any warranty claim or refund.** Please also keep your bill/Order ID. Claims without the card may not be processed. [Owner to confirm handling of lost cards.]
**5. What warranty covers / excludes.** Covers manufacturing defects within the warranty period. Excludes physical damage, liquid damage, burn marks, tampering, unauthorised repair, misuse and normal wear.
**6. Resolution.** After inspection we will, at our discretion and as applicable, repair, replace or refund.
**7. Refund timeline & mode.** Approved refunds are processed within **[5–7] working days**: online payments to the original payment method; COD orders by UPI/bank transfer to details you provide.
**8. Cancellations before dispatch.** Refunded in full to the original payment method (online) as per the timeline above.
**9. Statutory rights.** Nothing here limits your rights under applicable consumer-protection law.

## A4. Cookies Policy
**What are cookies/local storage?** Small data stored in your browser to make a site work.
**What we use.** *Essential only:* a secure session cookie for the **admin** area; browser local storage for your **cart**, **wishlist** and your cookie-notice choice. We do **not** currently use advertising or tracking cookies.
**Third parties.** Our payment partner may set its own cookies/storage on its payment page. See its policy.
**Your control.** You can clear or block cookies/local storage in your browser settings; the cart and wishlist may then not work.
**Changes.** If we add analytics or marketing cookies we will update this page and ask for consent where required.

---

# Appendix B — WhatsApp Order Template

```
Hello Pawansut Trader! I have placed an order.

Order ID: {orderId}
Name: {name}
Mobile: {phone}
Address: {address}, {landmark}, {city} - {pincode}

Items:
1. {itemName} ({variantLabel}) x {qty} - ₹{lineTotal}
2. ...

Subtotal: ₹{subtotal}
Discount: ₹{discount}   (Coupon: {couponCode})
Delivery: ₹{deliveryCharge}
Total: ₹{total}

Payment: {COD | Online - Paid | Online - Pending}
Warranty: {X months on <item> — physical warranty card will be given | none}

Please confirm my order. Thank you!
```
Rules: omit empty lines (no coupon, no landmark); URL-encode with `encodeURIComponent`; send to `https://wa.me/918505856763?text=`. **Admin→customer messages** use `https://wa.me/91{customerPhone}?text=` with one short template per status (confirmed, dispatched, delivered), editable in code.

---

# Appendix C — Sample Seed Data (clearly sample; owner replaces via admin)

Categories: Chargers & Adapters, Cables, Earphones & Headphones, Power Banks, Phone Cases & Covers, Screen Protectors, Holders & Stands, Memory Cards & Storage.
Seed ~8–12 products across these with placeholder prices/images and a `// SAMPLE DATA` marker; at least one product with warranty enabled, one with variants, one out of stock, one with `isNew`. Seed also: 2 announcements (e.g. free delivery above ₹499), `settings/store` defaults from §1, and one sample coupon `WELCOME10` (inactive by default).
