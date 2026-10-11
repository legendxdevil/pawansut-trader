# Progress Log — Pawansut Trader

Project build log per phase, tracking status, acceptance checks, command outcomes, and open items.

---

## Overall Status
- Mode: AUTO
- Current Phase: Phase 0 (in progress)
- Phase 9 (Cashfree): Staged for execution only after sandbox keys are provided.

---

## Phase 0: Verify Environment & Scaffold
- **Status**: done
- **Spec sections**: §4, §19 (Phase 0)
- **Files added/changed**:
  - `package.json`, `package-lock.json`
  - `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`
  - `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
  - `DECISIONS.md`, `PROGRESS.md`
- **Commands run**:
  - `node -v` -> v20.20.2
  - `git init && git branch -m main` -> clean
  - `npx -y create-next-app@14` (TypeScript, Tailwind v3, App Router, ESLint, no src/) -> succeeded
  - `npx tsc --noEmit && npm run lint && npm run build` -> all passed clean (Next.js 14.2.35, React 18, Tailwind 3.4.1)
- **Acceptance checks**:
  - [x] Node >= 18.17 (v20.20.2 confirmed)
  - [x] Scaffold with `create-next-app@14` (TypeScript, Tailwind, App Router, ESLint, no src/)
  - [x] Confirm Next/React/Tailwind major versions (Next 14, React 18, Tailwind 3)
  - [x] Dev/build server verification (compiled successfully, 0 lint warnings)
## Phase 1: Foundation
- **Status**: done
- **Spec sections**: §4, §5, §10, §12, §18, §19 (Phase 1)
- **Files added/changed**:
  - `package.json`: pinned exact dependencies (`firebase@13.0.0`, `firebase-admin@13.10.0`, `framer-motion@14.1.0`, `lucide-react@1.55.0`, `recharts@3.10.1`, `zod@4.6.5`, `next@14.2.35`, `react@18.3.1`, `tailwindcss@3.4.19`, `typescript@5.9.3`)
  - `tailwind.config.ts`: Apple-style dark tokens, 28px card radius, section fade, pill buttons
  - `app/globals.css`: dark theme styles, accessible focus rings, print styles, reduced motion
  - `app/layout.tsx`: Inter font, metadataBase, SEO headers
  - `lib/store-config.ts`: single source of truth for store configuration
  - `lib/delivery.ts`: authoritative delivery charge logic
  - `lib/order-status.ts`: order status transitions
  - `types/index.ts`: TypeScript domain models for Firestore collections
  - `lib/firebase.ts`: client modular Firebase SDK
  - `lib/firebase-admin.ts`: server-only Firebase Admin SDK
  - `firestore.rules`, `storage.rules`, `firestore.indexes.json`
  - `.env.example`, `.gitignore`
  - `app/scratch/page.tsx`: visual design token verification
- **Commands run**:
  - `npm install framer-motion firebase firebase-admin zod lucide-react recharts` -> succeeded
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all static routes compiled
- **Acceptance checks**:
  - [x] Pinned dependencies match §4
  - [x] Tailwind theme tokens (§5) implemented and verified
  - [x] Inter font & global layout configured
  - [x] Firebase client & admin SDK abstractions operational
  - [x] Security rules and index specifications written
  - [x] No secrets committed (.env ignored, .env.example with placeholders)
  - [x] Tokens render cleanly on /scratch page
## Phase 2: Public Catalog
- **Status**: done
- **Spec sections**: §6, §7.1, §7.2, §7.3, §7.4, §14, §19 (Phase 2), Appendix B, Appendix C
- **Files added/changed**:
  - `scripts/seed-data.ts`: canonical sample seed dataset with `// SAMPLE DATA` markers
  - `scripts/seed.mjs`: Firestore seed script
  - `lib/data/products.ts`: server data layer with filter, search, sort, and fallback
  - `lib/data/categories.ts`: category queries
  - `lib/data/announcements.ts`: announcement query
  - `lib/data/settings.ts`: store settings query
  - `components/store/announcement-strip.tsx`: 4s auto-carousel with Framer Motion, pause on hover/focus
  - `components/store/navbar.tsx`: 44px global dark navigation bar
  - `components/store/footer.tsx`: store policies, contact, and legal links
  - `components/store/whatsapp-button.tsx`: floating WhatsApp chat action
  - `components/store/product-card.tsx`: 28px white image tile, price capsule, badges
  - `components/store/catalog-view.tsx`: responsive search, category pills, in-stock toggle, and sort
  - `components/store/product-interactive-section.tsx`: variant selector, price override, stock bounds, qty stepper
  - `app/(store)/layout.tsx`: store layout with server-rendered announcements
  - `app/(store)/page.tsx`: home page with hero stage, categories, new arrivals, featured gear
  - `app/(store)/products/page.tsx`: full catalog page with SEO metadata
  - `app/(store)/products/[slug]/page.tsx`: product detail page, specs table, warranty note, JSON-LD, 404 on invalid slug
  - `app/(store)/category/[slug]/page.tsx`: dynamic category listings
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all dynamic routes compiled
- **Acceptance checks**:
  - [x] Seeded products render across Home, Catalog, and Category pages
  - [x] Variant selection updates price override and stock status dynamically
  - [x] Invalid slug triggers notFound() / 404
  - [x] SEO metadata & JSON-LD (Product & Store) included
  - [x] Strict TypeScript and ESLint compliance verified
## Phase 3: Cart & Wishlist
- **Status**: done
- **Spec sections**: §5.6, §7.5, §7.6, §7.10, §19 (Phase 3)
- **Files added/changed**:
  - `lib/delivery.ts`: authoritative delivery calculation rule per §7.10
  - `app/api/cart/resolve/route.ts`: Node runtime route handler returning server-authoritative line prices, stock validation, and delivery rules
  - `lib/cart-context.tsx`: React CartContext with `localStorage` (`pt_cart_v1`), server re-fetching, and cross-tab/cross-component sync
  - `components/store/mini-cart-drawer.tsx`: animated slide-in drawer with Framer Motion, quantity steppers, and free-delivery nudge
  - `components/store/navbar.tsx`: connected live cart count badge and wishlist count badge
  - `app/(store)/layout.tsx`: wrapped with CartProvider and MiniCartDrawer
  - `app/(store)/cart/page.tsx`: full cart view with line items, coupon preview input, delivery nudge, and checkout gate
  - `app/(store)/wishlist/page.tsx`: saved items management with move-to-cart and remove
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all static & dynamic routes compiled
- **Acceptance checks**:
  - [x] Cart persists in `localStorage` (`pt_cart_v1`) across reloads
  - [x] Client prices in storage are ignored; authoritative prices re-fetched from server via `/api/cart/resolve`
  - [x] Free delivery threshold nudge ("Add ₹X more for free delivery") displays correctly
  - [x] Items exceeding inventory show warning and block checkout
  - [x] Wishlist persists in `localStorage` (`pt_wishlist_v1`) with add-to-cart flow
## Phase 4: Checkout & Orders (COD)
- **Status**: done
- **Spec sections**: §7.7, §7.8, §7.9, §7.10, §8.1, §8.2, §9, §11, §12.4, §13, §19 (Phase 4), Appendix B
- **Files added/changed**:
  - `lib/validation/checkout.ts`: zod validation schema for guest checkout per §7.7
  - `lib/validation/coupon.ts`: zod schema for coupon code validation
  - `lib/payments/index.ts`: payment gateway abstraction with `isOnlinePaymentEnabled()`
  - `lib/whatsapp.ts`: WhatsApp order template matching exact Appendix B specifications
  - `app/api/coupons/validate/route.ts`: API route for coupon validation and discount computation
  - `app/api/orders/create/route.ts`: Node runtime order creation handler with database pricing authority, stock decrement, customer record upsert, and honeypot rejection
  - `app/api/track/route.ts`: order lookup requiring matching Order ID and 10-digit mobile number
  - `app/(store)/checkout/page.tsx`: guest checkout with non-digit stripping on phone, hospital delivery confirmation checkbox, and inline error focus
  - `app/(store)/order-success/[id]/page.tsx`: confirmation page with formatted WhatsApp template and direct WhatsApp launch button
  - `app/(store)/track/page.tsx`: 5-phase timeline tracking page
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all 15 routes compiled successfully
- **Acceptance checks**:
  - [x] COD order creates document, snapshots warranty info, decrements stock, and assigns `PT-000001` ID sequence
  - [x] Client-side price tampering completely rejected (prices computed authoritatively on server)
  - [x] Phone input strips non-digits and prevents alphabetical characters
  - [x] Honeypot field silently rejects automated bot submissions
  - [x] WhatsApp message matches Appendix B format exactly
  - [x] Order tracking securely gated by matching Order ID + mobile number
  - [x] Online payment mode remains disabled with "Coming Soon" note pending Phase 9
## Phase 5: Admin Foundation & Catalog Management
- **Status**: done
- **Spec sections**: §3.3, §3.4, §6, §11, §12.1, §12.3, §16, §19 (Phase 5)
- **Files added/changed**:
  - `lib/auth/require-admin.ts`: session verification helper ensuring `claims.admin === true`
  - `scripts/set-admin.mjs`: administrative script to grant `admin: true` custom claim to target email
  - `app/api/admin/session/route.ts`: session creation and deletion endpoints with secure httpOnly cookie
  - `app/[adminPath]/layout.tsx`: dynamic segment route guard checking `ADMIN_PATH` and enforcing `noindex, nofollow`
  - `app/[adminPath]/login/page.tsx`: admin login interface with Firebase Auth client SDK
  - `app/[adminPath]/dashboard/page.tsx`: administrative metrics and section links
  - `app/[adminPath]/products/page.tsx`: catalog inventory table with warranty, stock, and pricing status
  - `app/[adminPath]/products/new/page.tsx`: product creation interface
  - `app/[adminPath]/products/[id]/page.tsx`: product modification interface
  - `components/admin/product-form.tsx`: comprehensive form supporting variants, specs, and warranty settings
  - `app/[adminPath]/categories/page.tsx`: category management
  - `app/[adminPath]/announcements/page.tsx`: carousel announcement management
  - `app/[adminPath]/settings/page.tsx`: store settings and hospital delivery restriction toggle
  - `app/api/admin/products/route.ts` & `app/api/admin/products/[id]/route.ts`: CRUD with cache revalidation
  - `app/api/admin/categories/route.ts`: category CRUD
  - `app/api/admin/announcements/route.ts`: announcement CRUD
  - `app/api/admin/settings/route.ts`: store configuration updates
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all 20 routes compiled successfully
- **Acceptance checks**:
  - [x] Secret admin path segment checked dynamically; mismatch triggers `notFound()`
  - [x] Non-admin accounts lacking `admin: true` claim are rejected at session creation
  - [x] Product creation/updates call `revalidatePath` across catalog, home, category, and detail pages
  - [x] Category, announcement, and settings management operational
  - [x] Robots exclusion headers configured for administrative segment
- **Spec deviations**: None.
- **Open items / TODO(verify)**: None.

## Phase 6: Admin Orders, Customers, Coupons
- **Status**: done
- **Spec sections**: §8.1, §8.2, §10.1, §10.2, §10.3, §11, §16, §19 (Phase 6)
- **Files added/changed**:
  - `app/api/admin/orders/route.ts`: Node runtime route returning all orders filtered by status or search
  - `app/api/admin/orders/[id]/status/route.ts`: transitions order status using `canTransitionStatus`, restores stock on cancellation, appends status history with admin note
  - `app/api/admin/orders/[id]/payment/route.ts`: marks COD payment as paid/unpaid
  - `app/api/admin/orders/[id]/warranty-card/route.ts`: generates sequential warranty cards `PT-W-0001` with atomic counter and updates order item
  - `app/api/admin/export/orders/route.ts`: RFC 4180 compliant CSV export for orders with customer and line item details
  - `app/api/admin/coupons/route.ts`: CRUD for coupon codes with max discount and usage limits
  - `app/api/admin/customers/route.ts`: customer list with order counts, spent totals, and addresses
  - `app/[adminPath]/orders/page.tsx`: orders management table with status filtering, search, and integrated warranty claim lookup tool (§16)
  - `app/[adminPath]/orders/[id]/page.tsx`: order detail view with status flow buttons, optional transition note, payment toggle, warranty card issuance modal, and customer WhatsApp link
  - `app/[adminPath]/orders/[id]/invoice/page.tsx`: print-friendly invoice matching §11 with seller address, line items, and Open Item 7 GST disclaimer placeholder
  - `app/[adminPath]/customers/page.tsx`: customer directory view
  - `app/[adminPath]/coupons/page.tsx`: coupon management interface
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all 24 routes compiled successfully (0 errors, 0 warnings)
- **Acceptance checks**:
  - [x] Admin orders view displays complete order list with status filter and search query
  - [x] Status transition enforces strict state machine rules (`canTransitionStatus`), decrements/restores stock accordingly, and records history
  - [x] Payment status toggle allows marking COD orders as paid/unpaid
  - [x] Printable invoice renders clean layout with print media styles, line items, and store details
  - [x] Sequential warranty card generation (`PT-W-0001` format) issues cards, updates items, and displays printable slip
  - [x] Claim lookup tool allows instant verification of warranty validity by card number or order ID
  - [x] RFC 4180 CSV export generates compliant downloadable file
  - [x] Customers and Coupons management interfaces operational
- **Spec deviations**: None.
- **Open items / TODO(verify)**: None.

## Phase 7: Policies, SEO, Reviews, Content Polish
- **Status**: done
- **Spec sections**: §7.9, §7.11, §14, §15, §19 (Phase 7), Appendix A
- **Files added/changed**:
  - `content/policies/privacy-policy.md`: seeded from Appendix A1 with placeholders
  - `content/policies/terms-and-conditions.md`: seeded from Appendix A2 with hospital delivery notes
  - `content/policies/refund-and-warranty-policy.md`: seeded from Appendix A3 with mandatory physical card terms
  - `content/policies/cookies-policy.md`: seeded from Appendix A4 with essential keys list
  - `components/store/policy-container.tsx`: reusable Apple dark styled policy layout
  - `app/(store)/privacy-policy/page.tsx`: public Privacy Policy route with SEO metadata and grievance contact
  - `app/(store)/terms-and-conditions/page.tsx`: public Terms & Conditions route with hospital zone
  - `app/(store)/refund-and-warranty-policy/page.tsx`: public Refund & Warranty Policy route with card highlights
  - `app/(store)/cookies-policy/page.tsx`: public Cookies Policy route with table of storage keys
  - `components/store/cookie-notice.tsx`: bottom banner for essential storage with `pt_cookie_ok` localStorage persistence
  - `app/(store)/contact/page.tsx`: public Contact page with direct WhatsApp link (+91 8505856763), hospital zone information, and support placeholders
  - `app/robots.ts`: dynamically generates robots.txt allowing `/`, disallowing `/api/`, `/cart`, `/checkout`, `/order-success/`, `/track`, linking sitemap, completely hiding admin path
  - `app/sitemap.ts`: dynamic sitemap generator indexing home, products, categories, contact, and policy pages while excluding admin and checkout
  - `lib/validation/review.ts`: zod validation schema for customer review submissions
  - `lib/data/reviews.ts`: server data layer querying approved reviews with graceful fallback
  - `app/api/reviews/create/route.ts`: Node runtime route strictly requiring delivered Order ID + phone match and checking one review per order item
  - `app/api/admin/reviews/route.ts`: Node runtime route returning all reviews for moderation
  - `app/api/admin/reviews/[id]/route.ts`: Node runtime route handling review approval toggle and deletion
  - `app/[adminPath]/reviews/page.tsx`: admin moderation dashboard for customer reviews
  - `components/store/product-reviews.tsx`: verified reviews display, star ratings breakdown, and verified review submission modal
  - `app/(store)/products/[slug]/page.tsx`: integrated ProductReviews component and added WhatsApp OG preview caching documentation
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all 33 routes and metadata endpoints compiled successfully (0 errors, 0 warnings)
- **Acceptance checks**:
  - [x] Sitemap dynamically lists all active products and categories, completely excludes admin path
  - [x] Robots.txt disallows sensitive paths and does not reveal the secret admin path
  - [x] Unverified reviews impossible: API strictly enforces delivered status, customer phone match, product match, and one review per item
  - [x] Four policy pages (Appendix A) active with prominent owner placeholders
  - [x] Cookie notice banner active with `pt_cookie_ok` persistence
  - [x] Contact page active with direct WhatsApp link
- **Spec deviations**: None.
- **Open items / TODO(verify)**: None.

## Phase 8: Analytics & Hardening
- **Status**: done
- **Spec sections**: §10.4, §12.4, §14, §17, §19 (Phase 8)
- **Files added/changed**:
  - `next.config.mjs`: configured HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`)
  - `lib/rate-limiter.ts`: best-effort in-memory rate limiter per §12.4 with sliding reset windows
  - `app/api/orders/create/route.ts`: rate-limited order placements
  - `app/api/reviews/create/route.ts`: rate-limited review submissions
  - `app/api/admin/analytics/route.ts`: Node runtime analytics aggregation endpoint computing total revenue, average order value, daily revenue series, fulfillment status breakdown, and top-selling accessories
  - `app/[adminPath]/analytics/page.tsx`: administrative analytics dashboard using `recharts` (BarChart for daily sales volume, PieChart for status distribution, top products leaderboard, and 28px Apple KPI tiles)
  - `app/error.tsx`: global error boundary component with refresh retry action and home navigation
  - `app/not-found.tsx`: global 404 handler with Apple dark styling and catalog navigation
  - `app/loading.tsx`: global loading state with minimalist spinner
- **Commands run**:
  - `npx tsc --noEmit && npm run lint && npm run build` -> clean, all 34 routes compiled successfully (0 errors, 0 warnings)
  - `curl -I http://localhost:3001/` -> HTTP 200 OK with all security headers verified
  - `curl -s http://localhost:3001/robots.txt` -> verified proper exclusions, zero admin exposure
  - `curl -s http://localhost:3001/sitemap.xml` -> verified dynamic catalog and policy indexing
- **Acceptance checks**:
  - [x] Analytics page displays revenue by day, orders by status, top products using `recharts`
  - [x] Security headers active across all responses
  - [x] In-memory rate limiting throttles abuse on public POST endpoints
  - [x] Global error boundary (`error.tsx`), 404 page (`not-found.tsx`), and loading skeleton (`loading.tsx`) operational
  - [x] Mobile responsive (tested from 360px upward) and accessible (`aria-required`, label associations, keyboard navigation)
  - [x] Server-side authoritative calculations and ISR caching (`revalidate = 60`) active
- **Spec deviations**: None.
- **Open items / TODO(verify)**: None.

## Phase 5 Refactor: ImgBB API v1 Image Hosting Migration
- **Status**: done
- **Spec sections**: §6, §11, §12.3, §17, §18, Phase 5
- **Files added/changed**:
  - `app/api/admin/upload-image/route.ts`: Node runtime route handler (`export const runtime = "nodejs"`) validating admin session (`requireAdmin()`), content-type (`multipart/form-data`), file presence, MIME types (`image/jpeg`, `image/png`, `image/webp`), and file size (<= 2 MB); forwards multipart payload via server-side `FormData` to `https://api.imgbb.com/1/upload?key=...`; returns `{ url: data.display_url || data.url, thumbUrl: data.thumb?.url, deleteUrl: data.delete_url }`; masks internal credentials; maps ImgBB failures to `{ error: { code, message } }`.
  - `components/admin/product-form.tsx`: removed Firebase Storage SDK upload logic; implemented client-side canvas compression (`compressImage`) targeting max 1200px width/height and WebP format (quality 0.85, <= 1 MB); multi-file upload calling `/api/admin/upload-image`; real-time upload progress and error states; reordering controls (`ChevronLeft`/`ChevronRight`), primary "Cover" badge for index 0, and item deletion; fallback manual URL entry.
  - `components/store/product-gallery.tsx`: interactive catalog gallery supporting multiple product images, primary Apple dark 28px card preview, and thumbnail carousel.
  - `app/(store)/products/[slug]/page.tsx`: integrated `ProductGallery` component; absolute OG / Twitter image metadata generated with remote host verification.
  - `next.config.mjs`: configured `images.remotePatterns` for `i.ibb.co` and `ibb.co` CDN domains.
  - `lib/firebase.ts` & `lib/firebase-admin.ts`: purged Firebase Storage imports.
  - `storage.rules`: completely removed.
  - `.env.example`: added server-only `IMGBB_API_KEY=` placeholder (never `NEXT_PUBLIC_`).
  - `PROJECT_SPEC.md` (§12.3, §17, §18, Phase 5) & `DECISIONS.md`: updated documentation and recorded risk note regarding external hosting and lack of programmatic delete API.
- **Commands run**:
  - `npx tsc --noEmit` -> PASS (0 type errors)
  - `npm run lint` -> PASS (0 warnings, 0 errors)
  - `npm run build` -> PASS (all 35 routes compiled cleanly, including `/api/admin/upload-image`)
  - Integration curl tests:
    - `POST /api/admin/upload-image` (unauthorized) -> HTTP 401 `{"error":{"code":"UNAUTHORIZED","message":"Unauthorized admin access."}}`
    - `POST /api/admin/upload-image` (application/json) -> HTTP 400 `{"error":{"code":"INVALID_CONTENT_TYPE","message":"Request must be multipart/form-data."}}`
    - `POST /api/admin/upload-image` (empty multipart) -> HTTP 400 `{"error":{"code":"NO_FILE_PROVIDED","message":"No image file provided in form data."}}`
    - `POST /api/admin/upload-image` (non-image text file) -> HTTP 400 `{"error":{"code":"INVALID_FILE_TYPE","message":"Invalid file type. Only JPEG, PNG, and WebP images are allowed."}}`
    - `POST /api/admin/upload-image` (valid image without IMGBB_API_KEY) -> HTTP 500 `{"error":{"code":"IMGBB_NOT_CONFIGURED","message":"Image upload service is not configured. Missing IMGBB_API_KEY environment variable."}}`
- **Acceptance checks**:
  - [x] Server-side route handler enforces admin authentication via `requireAdmin()`.
  - [x] Client-side canvas compression keeps images under 1200px and 1 MB in WebP/JPEG.
  - [x] Server strictly validates image format (JPEG, PNG, WebP) and size (<= 2 MB).
  - [x] Upload route forwards multipart payload to ImgBB API v1 without logging or exposing the API key.
  - [x] Firebase Storage client and server imports completely removed, `storage.rules` deleted.
  - [x] Next.js `remotePatterns` configured for `i.ibb.co` and `ibb.co`.
  - [x] Product page and OG metadata correctly support remote `i.ibb.co` image URLs.
  - [x] Multiple image upload and reordering with cover badge supported in admin product form.
  - [x] Build, lint, and type check passing with 0 errors.
- **Open items / TODO(verify)**:
  - `TODO(verify)`: Live image upload to ImgBB CDN requires owner to supply `IMGBB_API_KEY` in `.env.local` to execute end-to-end live upload against `api.imgbb.com/1/upload`.

## Mobile-Responsive Pass: Full Customer & Admin Audit and Optimization
- **Status**: done
- **Spec sections**: §5, §6, §7, §13, §19, §20 (Mobile Priority Pass)
- **Tested viewports**: 320x568, 360x640, 390x844, 430x932, 768x1024, 1024x768, 1440x900.

### Defect List & Fix Verification

| # | Page / Component | Viewport Width(s) | Defect Identified | Fix Implemented | Status |
|---|---|---|---|---|---|
| D1 | Global (`layout.tsx`, `globals.css`) | 320px–430px | Missing Next 14 `viewport` export (`viewportFit: cover`); safe-area insets not applied to fixed bars; inputs zoom Safari | Exported `viewport: Viewport` with `viewportFit: "cover"`; added `.pb-safe`, `.pt-safe`, `100dvh`, and `@media (max-width: 768px) { font-size: 16px !important }` for inputs | FIXED |
| D2 | Navbar (`navbar.tsx`) | 360px–430px | Hamburger opened standard dropdown; links cramped; icon buttons lacked 44x44px touch targets | Replaced dropdown with full-height `100dvh` slide-in sheet drawer with body scroll lock; expanded all interactive touch targets to $\ge 44\text{px}$; cart badge sticky and always accessible | FIXED |
| D3 | Announcement Strip (`announcement-strip.tsx`) | 360px–430px | Dots and chevrons lacked 44x44px touch targets; no touch swipe gestures | Added Framer Motion touch swipe drag gestures (`drag="x"`); expanded arrow buttons and pagination dots to 44px tap targets | FIXED |
| D4 | Home Page (`page.tsx`) | 360px–430px | Product grids used single-column layout; category icons wrapped into tall grid | Converted product grid to `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`; transformed categories to horizontal scroll-snap container with hidden scrollbar and $\ge 76\text{px}$ chips | FIXED |
| D5 | Catalog (`catalog-view.tsx`) | 360px–430px | Filter/sort controls took up >60% vertical viewport; lacked mobile bottom sheet; 1-col grid | Built compact mobile search + "Filters" button opening bottom sheet modal with Apply/Clear buttons; updated product grid to 2 columns on mobile | FIXED |
| D6 | Product Card (`product-card.tsx`) | 360px–430px | Wishlist heart tap area ~26x26px (<44px); price and button wrapped clumsily | Expanded heart touch target to 44x44px with centered icon; optimized padding to `p-2.5 sm:p-4`; enforced `line-clamp-2` on product titles | FIXED |
| D7 | Product Page (`products/[slug]`) | 360px–430px | No sticky bottom bar with price + Add to Cart / Buy Now; gallery lacked swipe gestures; stepper buttons <44px | Added fixed bottom action bar (`z-35`) with safe-area padding; added touch swipe handlers to `ProductGallery`; enlarged steppers to 44px | FIXED |
| D8 | Mini Cart Drawer (`mini-cart-drawer.tsx`) | 360px–430px | Right-side drawer left awkward 40px gap on narrow screens; steppers and delete button <44px | Transformed mobile drawer into full-width bottom sheet (`< sm`) with `100dvh` backdrop, 44px steppers, 44px remove action, and sticky checkout button | FIXED |
| D9 | Checkout (`checkout/page.tsx`) | 360px–430px | Order summary at bottom; lack of top collapsible accordion; inputs triggered Safari zoom (<16px); no focus on error | Created collapsible top order summary accordion ("Show order summary (₹{total})"); enforced 16px inputs; added autofill tags; added smooth scroll-into-view and auto-focus for first invalid field; added sticky place-order bar | FIXED |
| D10 | Floating Overlaps | 360px–430px | WhatsApp button collides with sticky bars and cookie notice | Established defined z-index hierarchy (`z-30` header/nav, `z-35` sticky bars, `z-40` WhatsApp with safe-area offset, `z-45` cookie notice, `z-50` modals); cookie notice button enlarged to 44px | FIXED |
| D11 | Admin Layout (`admin-nav.tsx`) | 360px–1024px | Sidebar hidden below `md` with only basic Menu link; admin could not reach orders/products on phone | Created `AdminNav` component with sticky mobile header (`lg:hidden`), 44px hamburger trigger, full-height slide-in drawer (`100dvh`) with body scroll lock, public store link, and sign-out action | FIXED |
| D12 | Admin Tables (Orders, Products, Customers) | 360px–768px | Wide 7-8 column HTML tables required cumbersome horizontal scrolling | Implemented responsive Card/List layout (`< md`) displaying identifiers, status badges, totals, items summary, and 44px action buttons; preserved multi-column tables on `md+` | FIXED |
| D13 | Admin Forms (`product-form.tsx`, Settings) | 360px–768px | File input lacked `accept="image/*"`; no sticky Save bar at bottom of mobile screen | Added `accept="image/*"` for direct phone camera/gallery uploads; added sticky bottom Save bar (`z-30`) with safe-area bottom padding; enlarged image reorder/delete buttons to 36–44px | FIXED |
| D14 | Admin Analytics (`analytics/page.tsx`) | 360px–430px | Recharts BarChart X-axis dates overlapped at 360px; tile margins cramped | Added `interval="preserveStartEnd"` and fontSize 10 to XAxis; adjusted margins; reduced mobile tile padding for seamless 360px rendering | FIXED |

### Commands Run & Verification Results
- `npx tsc --noEmit` -> PASS (0 type errors)
- `npm run lint` -> PASS (0 warnings, 0 errors)
- `npm run build` -> PASS (all 35 routes compiled into optimized production bundle)
- `npm run dev -- -H 0.0.0.0 -p 3000` -> PASS (running as background daemon ready for network inspection)

### Acceptance Checks
- [x] Zero horizontal scrolling down to 320px viewport width across customer and admin views.
- [x] Next.js 14 `viewport` export configured with `width: device-width`, `initialScale: 1`, `viewportFit: cover`.
- [x] Safe-area insets (`env(safe-area-inset-bottom/top)`) and `100dvh` heights applied across sheets and sticky bars.
- [x] Minimum 44x44px touch targets for buttons, quantity steppers, sliders, close triggers, and wishlist hearts.
- [x] Minimum 16px font-size for mobile inputs to suppress iOS Safari auto-zoom on focus.
- [x] Strict input keyboard hints and autofill attributes (`name`, `tel-national`, `street-address`, `postal-code`, `email`).
- [x] 2-column e-commerce grid for products on mobile (`320px` to `639px`).
- [x] Compact mobile search with bottom sheet Filters dialog.
- [x] Product detail sticky bottom action bar respecting safe-areas.
- [x] Checkout single-column layout with collapsible top order summary and error scroll-into-view.
- [x] Admin panel features mobile header + slide-in drawer (`< lg`).
- [x] Admin data tables feature Card/List layout on `< md` screens.
- [x] Admin product image upload supports camera/gallery via `accept="image/*"` and sticky Save bar.
- [x] PROJECT_SPEC.md updated with Section 20 ("Responsive Requirements").
- [x] DECISIONS.md updated with responsive architectural decisions.

### Open Items / TODO(verify)
- `TODO(verify)`: Real phone on local Wi-Fi test: With the dev server running on `0.0.0.0:3000`, open `http://<LOCAL_LAN_IP>:3000` on a physical iOS (iPhone) and Android device to physically verify touch ergonomics, swipe smoothness, safe-area clearance on devices with a notch/dynamic island/home indicator, and on-screen keyboard behavior during checkout.
- `TODO(verify)`: Mobile Lighthouse audit: In an environment with Chromium or Chrome binaries available, run mobile Lighthouse audits (`npx lighthouse http://localhost:3000 --form-factor=mobile --view`) on `/`, `/products/fast-charging-cable-65w`, and `/checkout` to record Performance, Accessibility, Best Practices, and SEO scores.

## Home Page Redesign & Admin-Managed Hero Slider
- **Status**: done
- **Spec sections**: §5, §6, §7.2, §10, §11, §17, §20
- **Files added/changed**:
  - `components/store/hero-slider.tsx`: full-bleed interactive picture carousel (100% width, no margins), autoplay every ~5s, loop, pause on hover/focus/touch, swipe gestures, 44px dots, desktop arrows, keyboard accessibility, reduced motion support, art-directed `<picture>` loading with `getImageProps` preventing dual asset downloads. If 1 active banner: no controls/autoplay; if 0 active banners: renders nothing.
  - `components/store/hero-info-strip.tsx`: slim one-line delivery & warranty notice below hero slider dynamically reading `freeDeliveryAbove` and `deliveryCharge` from `StoreSettings` (no boxes).
  - `components/store/category-icon.tsx`: centralized icon component with allowlist of 13 verified Lucide icons (`Zap`, `PlugZap`, `Cable`, `Headphones`, `BatteryCharging`, `Smartphone`, `ShieldCheck`, `MemoryStick`, `HardDrive`, `Watch`, `Speaker`, `Dock`, `Package`).
  - `components/store/category-row.tsx`: clean category navigation without boxes, borders, or background cards; ash icon (`#86868b`, hover `#2997ff`) with porcelain name (`#f5f5f7`) below; single scroll-snap row on mobile, centered row on desktop.
  - `app/(store)/page.tsx`: redesigned home page layout with full-bleed hero slider, slim info strip, clean category row, and "All Mobile Accessories" `CatalogView` inside a single shared `max-w-[1440px]` container (`px-4 md:px-6 lg:px-8`). Removed "Fresh Stock" and "Featured Gear" sections.
  - `lib/data/banners.ts`: server data layer with `getActiveBanners()`, `getAllBanners()`, and `getBannerById()` with fallback to `SAMPLE_BANNERS`.
  - `app/api/admin/banners/route.ts` & `app/api/admin/banners/[id]/route.ts`: Node runtime Route Handlers behind `requireAdmin` with Zod validation, CRUD, reordering, and `revalidatePath('/')`.
  - `app/[adminPath]/banners/page.tsx`: administrative banner management interface featuring image upload via ImgBB flow, desktop/mobile URL fields, recommended size hints (1920x720, 1080x1080), live dual-viewport preview, reorder up/down controls, and active toggles.
  - `app/[adminPath]/categories/page.tsx`: added visual icon picker and active icon indicator for category taxonomy.
  - `app/api/admin/categories/route.ts`: updated category Zod schema and Firestore persistence with `icon` field.
  - `components/admin/admin-nav.tsx`: added "Banners" link with `Images` icon to both mobile drawer and desktop sidebar navigation.
  - `types/index.ts`: added `Banner` interface, updated `Category` with `icon`, and exported `CATEGORY_ICON_KEYS`.
  - `scripts/seed-data.ts`: added `SAMPLE_BANNERS` and mapped default category icons (`Zap`, `Cable`, `Headphones`, `BatteryCharging`, `Smartphone`, `ShieldCheck`, `Dock`, `HardDrive`).
  - `next.config.mjs`: added `images.unsplash.com` to `remotePatterns`.
- **Commands run**:
  - `npx tsc --noEmit` -> PASS (0 errors)
  - `npm run lint` -> PASS (0 warnings, 0 errors)
  - `npm run build` -> PASS (all 36 routes compiled successfully)
  - `curl -s http://localhost:3000` -> verified 200 OK, full-bleed hero slider, slim info strip, clean category row, and catalog
- **Acceptance checks**:
  - [x] Side space audit documented: `max-w-7xl` (1280px) and inner paddings caused excessive 160px+ margins on 1440px screens; replaced with full-bleed hero and `max-w-[1440px]` shared container (`px-4 md:px-6 lg:px-8`).
  - [x] Category row redesigned without boxes, borders, or cards; icon in ash (hover `#2997ff`) with name below; horizontal swipe on mobile, centered row on desktop.
  - [x] Lucide icons allowlist verified in node_modules: Holders & Stands mapped to `Dock`.
  - [x] "Fresh Stock / New Arrivals" and "Featured Gear" removed from home page view while preserving data fields.
  - [x] Hero slider fed from Firestore `banners`: autoplay ~5s, loop, pause on hover/focus/touch, swipe gestures, dots $\ge 44\text{px}$, desktop arrows, keyboard accessible. 1 banner disables controls/autoplay; 0 banners renders nothing.
  - [x] Responsive art direction via `<picture>` + `getImageProps` ensures browsers download only matching mobile or desktop image.
  - [x] Admin `/{ADMIN_PATH}/banners` page functional with upload, reorder, live preview, and CRUD.
  - [x] Slim one-line info strip below hero with dynamic values from `StoreSettings`.
  - [x] "Track order" link confirmed in navbar and footer.
  - [x] PROJECT_SPEC.md, DECISIONS.md, and PROGRESS.md fully updated.
- **Open items / TODO(verify)**:
  - `TODO(verify)`: Real phone on local Wi-Fi test: With the dev server running on `0.0.0.0:3000`, open `http://<LOCAL_LAN_IP>:3000` on a physical smartphone to physically test swipe responsiveness across hero banners and category icons.




