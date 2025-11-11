<div align="center">

# ClearSprint AI

An intelligent sprint workspace that pairs a marketing-grade landing experience with a production-ready Next.js stack.

</div>

## Overview

ClearSprint AI is a full-stack Next.js application that showcases an AI-assisted delivery workflow. The current build focuses on a polished marketing experience with dark-mode first visuals, reusable Shadcn/UI components, and a Drizzle ORM foundation ready to back real product data.

## Feature Highlights

- Hero and feature storytelling built with motion-rich, responsive Shadcn components engineered with Tailwind CSS v4 utilities.
- Mobile-first layout with dark mode baked in via `next-themes`, fluid typography, and OKLCH-driven color tokens.
- Database access layer prewired for Drizzle ORM on Neon, including connection caching for edge/serverless runtimes.
- Component library scaffold (`components/ui`) mirroring the Shadcn collection for rapid interface composition.
- Strict TypeScript configuration and server-first app router architecture aligned with Next.js 16 best practices.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components by default)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4, Shadcn/UI primitives, OKLCH design tokens
- **State & Forms**: React 19, `react-hook-form`, Zod-ready validation layer
- **Database**: Drizzle ORM targeting Neon (Serverless Postgres)
- **Tooling**: Drizzle Kit CLI, `next-themes`, Lucide icons, Embla Carousel, Recharts, Three.js (for future immersive modules)

## Requirements

- Node.js >= 20.11 (align with Next.js 16 baseline)
- pnpm 9 / npm 10 / bun 1.1 (choose your package manager consistently)
- Neon Postgres project (or any Postgres-compatible instance) for database features

## Quick Start

```bash
git clone https://github.com/rayenfassatoui/clearsprint-ai.git
cd clearsprint-ai

# Install deps (choose one)
pnpm install
# npm install
# bun install

cp .env.local.example .env.local
# Update DATABASE_URL with your Neon connection string

pnpm dev
# npm run dev
# bun dev
```

Visit `http://localhost:3000` in your browser. Hot reload applies to both React components and Tailwind styles.

## Environment Variables

| Name | Required | Description |
| ---- | -------- | ----------- |
| `DATABASE_URL` | yes (for DB features) | Postgres connection string for Drizzle/Neon. Used by `lib/db/index.ts` to instantiate the HTTP driver. |

Add additional variables beside `DATABASE_URL` as features expand (e.g., auth providers, analytics). Never commit secrets.

## Database Workflow (Drizzle + Neon)

1. Model tables in `lib/db/schema.ts` using `pgTable` utilities.
2. Generate SQL migrations with `pnpm db:generate`.
3. Push migrations to Neon using `pnpm db:push`.
4. Explore data visually via `pnpm db:studio` (Drizzle Studio).

`lib/db/index.ts` enables fetch-connection caching (`neonConfig.fetchConnectionCache`) so edge/serverless deployments avoid connection storms. When expanding the schema, re-export new tables/entities to keep imports ergonomic.

## Project Structure

```
app/             # Next.js App Router pages, layouts, and metadata
	globals.css    # Tailwind v4 directives, OKLCH theme tokens, dark mode setup
	page.tsx       # Marketing experience for ClearSprint AI
components/
	ui/            # Shadcn-derived primitives ready for composition
hooks/           # Reusable React hooks (e.g., responsive helpers)
lib/
	db/            # Drizzle database client & schema definitions
	utils.ts       # Utility helpers shared across the app
public/          # Static assets served verbatim
```

## UI & UX Guidelines

- **Spacing & Rhythm**: Prefer `gap-6`, `gap-8`, and generous padding (`px-8`, `py-12`) to maintain the spacious visual language seen on the home page.
- **Color System**: Use OKLCH tokens defined in `app/globals.css` to keep light/dark contrast accessible. Default to dark mode; ensure light mode parity before shipping.
- **Micro-interactions**: Lean on Tailwind transitions (`transition`, `duration-300`, `hover:scale-[1.02]`) and Shadcn states for subtle feedback. Avoid custom CSS unless unavoidable.
- **Typography**: Geist Sans/Mono are globally loaded via `next/font`. Keep headings within `text-2xl`–`text-6xl`, paragraph copy around `text-sm`–`text-lg` for legibility.

## Available Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Start Next.js in development mode (hot reload). |
| `pnpm build` | Create an optimized production build. |
| `pnpm start` | Launch the production server (after `build`). |
| `pnpm db:generate` | Produce SQL migrations from Drizzle schema. |
| `pnpm db:push` | Apply migrations to the configured Postgres database. |
| `pnpm db:studio` | Open Drizzle Studio for interactive DB inspection. |

> Replace `pnpm` with your package manager of choice (`npm`, `bun`, etc.) if you installed dependencies differently.

## Testing & Quality

- Run `npx next lint` or set up a `lint` script to enforce ESLint + Tailwind rules.
- Introduce end-to-end tests (Playwright) or integration tests (Jest/React Testing Library) as dynamic flows are implemented.
- Keep TypeScript strictness high; prefer explicit return types and `zod` schemas for runtime validation on API routes and forms.
- Validate accessibility with `@axe-core/react` in development and manual keyboard checks.

## Deployment

- **Vercel**: Zero-config deployment recommended. Set `DATABASE_URL` in project environment variables and enable the Edge runtime for routes that benefit from low latency.
- **Docker / Custom Hosting**: Generate a production build (`pnpm build`) and serve with `pnpm start`. Ensure the environment exposes `DATABASE_URL` and supports Node 20.

## Roadmap

- Flesh out Drizzle schema with sprint, task, and team membership tables.
- Add authenticated spaces leveraging NextAuth.js or custom OAuth flows.
- Integrate analytics dashboards with Recharts and live data feeds.
- Expand 3D/motion sections using Three.js for immersive storytelling moments.

---

ClearSprint AI is engineered with senior-level standards: scalable architecture, polished UX, and a foundation ready for production. Iterate thoughtfully, keep components composable, and ship with confidence.
