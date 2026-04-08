# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### NevrFade — Premium Streetwear (`artifacts/nevr-fade`)
- **Type**: React + Vite (frontend-only, no backend)
- **Preview path**: `/`
- **Stack**: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Wouter
- **Design**: Premium streetwear brand site inspired by Supreme/Aesop editorial aesthetic
- **Colors**: Background #F5F0EB (warm beige), Dark #0D0D0D, Accent #C8B89A (sand/taupe)
- **Fonts**: Bebas Neue (headings) + Inter (body)
- **Sections**: Navbar, Hero, Marquee ticker, About/Mission, Limited Drops (product grid), Brand Story, CTA Banner, Footer
- **Key files**: `src/components/` (all sections), `src/pages/Home.tsx`, `src/index.css`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
