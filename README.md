# ClearSprint AI

AI-powered sprint planning and Jira integration. Transforms PRDs into actionable sprint tickets with intelligent analysis.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Auth**: Better-auth
- **Storage**: S3 (Minio)

## Architecture

This project follows a Feature-Driven Architecture (Vertical Slices).

### Directory Structure

- `features/`: Contains all domain logic, grouped by feature.
  - `auth/`: Authentication (Login, Signup, Profile)
  - `projects/`: Project management
  - `tickets/`: Ticket generation and Kanban
  - `jira/`: Jira integration logic
  - `landing/`: Marketing pages components
- `components/ui/`: STRICTLY for shadcn/ui primitives only. No business logic.
- `app/`: Routing layer only. Imports features.
- `lib/`: Shared utilities (DB, Auth client, Email).

### Feature Structure

Each feature folder (e.g., `features/auth/`) is self-contained:
- `components/`: Feature-specific UI
- `actions/`: Server actions
- `hooks/`: Custom hooks
- `types/`: Feature-specific types

## Development Rules

1. **Feature Isolation**: Place code in `features/[feature-name]`. Do not pollute global folders.
2. **UI Components**: `components/ui` is for generic primitives ONLY. Feature-specific UI goes in `features/*/components`.
3. **Server Actions**: Use server actions for mutations.
4. **Type Safety**: Strict TypeScript. No `any`.
5. **Styling**: Use Tailwind CSS utility classes.

## Setup

1. **Install**: `bun install`
2. **Env**: Configure `.env` (see `.env.example`)
3. **DB**: `bun run db:push`
4. **Dev**: `bun run dev`