# Decisions Log — Pawansut Trader

This document logs all architectural, design, and implementation decisions, deviations from default specifications, and package additions.

| Date | Phase | Spec Ref | Decision | Rationale | Status |
|---|---|---|---|---|---|
| 2026-10-11 | Phase 0 | §4, §19 | Initialize project with Next.js 14 (App Router), TypeScript, Tailwind CSS v3, ESLint, no `src/` directory. | Pinned stack in §4 of PROJECT_SPEC.md | DECIDED |
| 2026-10-11 | Phase 0 | §19 | Default git branch set to `main`. | Standard modern git convention | DECIDED |
| 2026-10-11 | Phase 1 | §4 | Pinned exact versions in `package.json` for all required libraries (no caret ranges). | Avoid accidental breaking changes and satisfy strict reproducibility | DECIDED |
| 2026-10-11 | Phase 1 | §5 | Implemented Apple-style dark design tokens with #000000 background, 28px card radius, and Inter typography. | Direct specification requirements in §5 | DECIDED |
