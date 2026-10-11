# Decisions Log — Pawansut Trader

This document logs all architectural, design, and implementation decisions, deviations from default specifications, and package additions.

| Date | Phase | Spec Ref | Decision | Rationale | Status |
|---|---|---|---|---|---|
| 2026-10-11 | Phase 0 | §4, §19 | Initialize project with Next.js 14 (App Router), TypeScript, Tailwind CSS v3, ESLint, no `src/` directory. | Pinned stack in §4 of PROJECT_SPEC.md | DECIDED |
| 2026-10-11 | Phase 0 | §19 | Default git branch set to `main`. | Standard modern git convention | DECIDED |
| 2026-10-11 | Phase 1 | §4 | Pinned exact versions in `package.json` for all required libraries (no caret ranges). | Avoid accidental breaking changes and satisfy strict reproducibility | DECIDED |
| 2026-10-11 | Phase 1 | §5 | Implemented Apple-style dark design tokens with #000000 background, 28px card radius, and Inter typography. | Direct specification requirements in §5 | DECIDED |
| 2026-10-11 | Phase 2 | §7.3, §19 | Implemented client-side filtering and sorting over the loaded catalog items in `CatalogView` with instant feedback. | Specified in §7.3 code comment option for catalog | DECIDED |
| 2026-10-11 | Phase 2 | §12.2, §19 | Added graceful fallback to canonical sample dataset when Firestore credentials are not configured in local environment. | Allows smooth offline local testing and builds while maintaining production Firestore priority | DECIDED |
| 2026-10-11 | Phase 3 | §7.5 | Cart prices in `localStorage` are strictly identifiers (`productId`, `variantId`, `qty`) only; pricing and inventory status are hydrated from `/api/cart/resolve`. | Eliminates client price tampering at source per spec §7.5 and anti-hallucination rule I | DECIDED |
| 2026-10-11 | Phase 4 | §7.7, §8.2 | Phone inputs strictly enforce numeric digits via `onChange` stripping and Zod validation `/^[6-9]\d{9}$/`. Client prices ignored completely during order creation. | Spec §7.7, §8.2 requirements | DECIDED |
| 2026-10-11 | Phase 4 | §9 | Online payment mode is rendered disabled with "Coming Soon" badge; abstraction in `lib/payments` returns `false` until Cashfree credentials provided in Phase 9. | Spec §9 instruction | DECIDED |
| 2026-10-11 | Phase 5 | §6, §12.1 | Dynamic segment `app/[adminPath]` matches against `process.env.ADMIN_PATH` (with `manage-admin` fallback in local dev); mismatch triggers `notFound()`. Robots are set to `noindex, nofollow`. | Spec §6 & §12.1 requirements | DECIDED |
| 2026-10-11 | Phase 5 | §11, §12.1 | Admin authentication mandates Firebase Auth token verification with `claims.admin === true` before creating an httpOnly session cookie. | Enforces strict role-based access control | DECIDED |
