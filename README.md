# ClearSprint AI

> AI-powered sprint planning and Jira integration.

Transforms PRDs into actionable sprint tickets with intelligent AI analysis and seamless Jira synchronization.

## Features

- **AI Planning**: Intelligent PRD analysis and ticket generation
- **Jira Sync**: Two-way synchronization with Jira projects
- **Modern UI**: Beautiful, responsive interface with dark mode
- **Secure**: Type-safe, robust authentication and data handling

## Tech Stack

- **Core**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Data**: PostgreSQL (Neon), Drizzle ORM, S3 Storage (Minio)
- **Auth**: Better-auth (Email/Password + Jira OAuth)
- **AI**: OpenAI-compatible APIs

## Quick Start

1.  **Install**: `bun install`
2.  **Env**: Copy `.env.example` to `.env` and fill in credentials.
3.  **DB**: `bun run db:push`
4.  **Run**: `bun run dev`

## Project Structure

- `actions/`: Server actions (logic)
- `app/`: Next.js App Router pages
- `components/`: React components
- `lib/`: Shared utilities (db, auth, etc.)
- `types/`: Shared type definitions

## Development Rules

- **Strict Types**: No `any`. Use `unknown` if needed.
- **Server Actions**: Use for all data mutations.
- **UI Components**: Use shadcn/ui primitives.
- **Styling**: Tailwind CSS utility classes only.

## Key Pages

- `/dashboard`: Main overview
- `/dashboard/projects-list`: Project directory
- `/auth/forgot-password`: Password recovery
- `/api/health`: System status

## License

MIT
