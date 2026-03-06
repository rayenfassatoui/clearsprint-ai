# ClearSprint AI

AI-powered sprint planning and Jira integration. Transforms PRDs into actionable sprint tickets with intelligent analysis.

## Overview

ClearSprint AI is a modern SaaS application that automates the tedious parts of sprint planning. By analyzing Product Requirements Documents (PRDs) with AI (GPT-4o), it generates hierarchical backlog items (Epics → Tasks → Subtasks) and syncs them directly to Jira.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Better-auth
- **Storage**: S3-compatible (Minio)
- **AI**: OpenAI API (GPT-4o-mini)
- **Package Manager**: Bun

## Architecture

The project follows a **Feature-Driven Architecture** (Vertical Slices) combined with a **Three-Tier Architecture** pattern.

### 1. Presentation Tier (UI)

- `app/`: Routing layer (Next.js App Router).
- `features/*/components/`: Domain-specific UI components.
- `components/ui/`: Strictly for shadcn/ui primitives. No business logic.

### 2. Business Logic Tier

- `features/*/actions/`: Server actions for mutations and complex logic.
- `lib/`: Shared utilities and service clients (DB, Auth, Jira, S3).
- `app/api/`: Webhooks and external API callbacks.

### 3. Data Tier

- `lib/db/`: Database schema (Drizzle ORM) and connection management.
- External: PostgreSQL (Neon), S3 (Minio), Jira API.

## Directory Structure

- `features/`: All domain logic, grouped by feature.
  - `auth/`: Authentication and session management.
  - `projects/`: Project creation, PRD upload, and ticket generation.
  - `tickets/`: Ticket management, Kanban board, and audit trails.
  - `jira/`: Jira OAuth and synchronization logic.
  - `landing/`: Marketing page sections.
- `components/ui/`: Generic UI primitives only.
- `app/`: Routing and page composition.
- `lib/`: Shared utility libraries.
- `types/`: Centralized TypeScript definitions.
- `drizzle/`: Database migration files.
- `latex/`: LaTeX presentation source files.

## Development Standards

### Design & UX

- **Aesthetics**: Modern, elegant, "wow" factor designs.
- **Experience**: Mobile-first, subtle micro-interactions, and professional feel.
- **Creativity**: Avoid generic Lucide-heavy designs; strive for unique, premium looks.

### Architecture Rules

- **Feature Isolation**: Place all related code in `features/[feature-name]`.
- **UI Primitives**: Keep `components/ui` clean. Domain-specific UI stays in features.
- **Server Actions**: Use for all mutations. Never use `any`.

### Code Style

- **Naming**: Functions (camelCase), Components (PascalCase), Files (kebab-case).
- **Type Safety**: End-to-end type safety. Centralize shared types in `types/` or feature types.

## Setup

1. **Install Dependencies**:
   ```bash
   bun install
   ```
2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in the required keys.
3. **Initialize Database**:
   ```bash
   bun run db:push
   ```
4. **Run Development Server**:
   ```bash
   bun run dev
   ```

## Commands

- `bun run build`: Build for production.
- `bun run lint`: Run Biome linter.
- `bun run db:push`: Synchronize database schema.
- `bun run dev`: Start development mode.
