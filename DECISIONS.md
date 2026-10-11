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
