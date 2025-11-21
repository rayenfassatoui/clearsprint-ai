# ClearSprint AI

> AI-powered sprint planning and Jira integration for collaborative teams

A modern Next.js application that transforms PRDs into actionable sprint tickets with intelligent AI analysis and seamless Jira synchronization.

## Features

- **AI-Powered Planning**: Upload PRDs and get intelligent sprint breakdowns
- **Jira Integration**: Two-way sync with Jira projects and issues
- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Type-Safe**: Full TypeScript coverage with strict typing
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-auth with email/password and OAuth
- **File Storage**: S3-compatible storage (Minio, AWS S3, Cloudflare R2)

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better-auth (email/password + Atlassian OAuth)
- **Storage**: S3-compatible (Minio)
- **AI**: OpenAI-compatible APIs (OpenRouter, OpenAI)
- **Package Manager**: Bun

## Project Structure

```
clearsprint-ai/
├── actions/              # Server actions (Server-side logic only)
│   ├── generate.server.ts # AI generation logic
│   ├── jira.server.ts    # Jira API operations
│   ├── tickets.server.ts # Ticket management
│   ├── upload.server.ts  # Document upload & processing
│   └── user.server.ts    # User operations
├── app/                  # Next.js App Router
│   ├── api/auth/         # Auth API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected application routes
│   │   ├── page.tsx      # Dashboard overview
│   │   ├── projects-list/# Project directory
│   │   ├── projects/     # Individual project views
│   │   ├── settings/     # User settings
│   │   └── test/         # Integration testing
│   ├── upload-test/      # Upload functionality testing
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React Components
│   ├── ui/               # shadcn/ui primitives (DO NOT EDIT manually)
│   ├── motion-primitives/# Animation components
│   ├── examples/         # Usage examples
│   ├── kanban-board.tsx  # Project board
│   ├── sidebar.tsx       # Application navigation
│   └── [feature].tsx     # Feature-specific components
├── lib/                  # Shared Utilities
│   ├── db/               # Database schema & config
│   ├── auth.ts           # Auth configuration
│   ├── jira.ts           # Jira client
│   └── s3.ts             # Storage client
├── types/                # Type Definitions (Source of Truth)
│   ├── database.ts       # DB models
│   ├── jira.ts           # Jira interfaces
│   └── index.ts          # Central exports
├── drizzle/              # Database migrations
├── docs/                 # Project documentation
└── public/               # Static assets
```

## 🚨 Strict Development Rules

**All contributors must adhere to these rules. Code that violates these standards will be rejected.**

### 1. File Organization & Architecture

- **Server Actions**:
  - MUST be placed in `actions/`.
  - MUST end with `.server.ts`.
  - MUST start with `'use server'`.
  - MUST return a standardized `ActionResponse` type.
  
- **Components**:
  - **UI Primitives**: strictly in `components/ui/`. Do not modify these unless upgrading shadcn.
  - **Feature Components**: Place in `components/` or `components/features/`.
  - **Client vs Server**: Use `'use client'` only when interactivity (hooks, event listeners) is required. Default to Server Components.

- **Types**:
  - **Single Source of Truth**: All shared types MUST be defined in `types/`.
  - **No Inline Types**: Never define interfaces inline for data that is passed between components or files.
  - **Imports**: Always import from `@/types`. Example: `import { Project } from '@/types'`.

### 2. Coding Standards

- **Type Safety**:
  - **NO `any`**: Usage of `any` is strictly forbidden. Use `unknown` with type guards if necessary.
  - **Strict Null Checks**: Handle `null` and `undefined` explicitly.
  - **Return Types**: All exported functions must have explicit return types.

- **Styling (Tailwind CSS)**:
  - Use utility classes for everything.
  - No custom CSS files (except `globals.css` for base styles).
  - Use `clsx` or `cn()` for conditional class names.
  - Follow the project's color palette (variables in `globals.css`).

- **Naming Conventions**:
  - **Files**: `kebab-case.tsx` (components), `kebab-case.ts` (utilities).
  - **Components**: `PascalCase`.
  - **Functions/Variables**: `camelCase`.
  - **Constants**: `SCREAMING_SNAKE_CASE`.

### 3. Data Fetching & State

- **Server Actions**: Use Server Actions for all mutations and data fetching where possible.
- **TanStack Query**: Use for client-side data synchronization if needed (not currently primary).
- **URL State**: Prefer URL search params for shareable state (filters, tabs) over `useState`.

### 4. Git & Workflow

- **Commits**: Use conventional commits (e.g., `feat: add jira sync`, `fix: upload error`).
- **Clean Code**: Remove `console.log` and commented-out code before committing.
- **Linting**: Ensure `bun run lint` and `bun run type-check` pass before pushing.

## Setup

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- S3-compatible storage (Minio, AWS S3, etc.)
- Atlassian Developer account (for Jira)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your_secret"      # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Atlassian Jira OAuth
ATLASSIAN_CLIENT_ID="your_client_id"
ATLASSIAN_CLIENT_SECRET="your_secret"

# S3 Storage
S3_ENDPOINT="https://s3.example.com"
S3_ACCESS_KEY="your_access_key"
S3_SECRET_KEY="your_secret_key"
S3_BUCKET_NAME="clearsprint-docs"
S3_REGION="us-east-1"

# AI (OpenAI-compatible)
OPENAI_BASE_URL="https://openrouter.ai/api/v1"
OPENAI_API_KEY="sk-or-v1-..."
OPENAI_MODEL_NAME="gpt-4o-mini"
```

### Installation

```bash
# Install dependencies
bun install

# Setup database
bun run db:push        # Push schema to database
bun run db:studio      # Open Drizzle Studio

# Development
bun run dev            # Start dev server at localhost:3000

# Production
bun run build          # Build for production
bun start              # Start production server
```

## Jira Integration Setup

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Create OAuth 2.0 integration
3. Add callback URL:
   - Local: `http://localhost:3000/api/auth/callback/atlassian`
   - Production: `https://yourdomain.com/api/auth/callback/atlassian`
4. Add scopes:
   - `read:jira-user`
   - `read:jira-work`
   - `write:jira-work`
   - `read:me`
   - `manage:jira-project`
   - `manage:jira-configuration`
   - `offline_access`
5. Copy Client ID and Secret to `.env`

## Development Workflow

### Adding New Features

1. **Create types** in `types/` folder
2. **Define schema** in `lib/db/schema.ts` (if needed)
3. **Create server actions** in `actions/`
4. **Build components** in `components/`
5. **Add routes** in `app/`
6. **Test thoroughly**

### Database Changes

```bash
# Make schema changes in lib/db/schema.ts
# Generate migration
bun run db:generate

# Apply migration  
bun run db:push

# View data
bun run db:studio
```

### Code Quality

```bash
# Format code
bun run format

# Lint code  
bun run lint

# Type check
bun run type-check
```

## Project Pages

- **Dashboard** (`/dashboard`): Overview with stats and quick actions
- **Projects** (`/dashboard/projects-list`): All user projects
- **Settings** (`/dashboard/settings`): User info and Jira connection
- **Test** (`/dashboard/test`): Jira API testing interface

## Key Components

- **Sidebar**: Main navigation with user profile
- **UserProfile**: User avatar/info with connection status
- **ConnectJiraButton**: OAuth connection to Jira
- **ProjectList**: Grid of user projects
- **NewProjectModal**: Create new project dialog

## API Routes

- `/api/auth/[...all]`: Better-auth endpoints
- All other operations use server actions

## Documentation

- `docs/jira-setup.md` - Detailed Jira integration guide
- `docs/jira-integration-changes.md` - Recent changes
- `docs/jira-api-search-fix.md` - API endpoint updates
- `docs/app-reorganization.md` - Structure changes

## Contributing

1. Follow the strict structure rules above
2. Use TypeScript strictly (no `any`)
3. Import types from `@/types` only
4. Write server actions for data operations
5. Use shadcn/ui for all UI components
6. Follow the AGENTS.md guidelines

## Architecture Decisions

### Why Centralized Types?

- **Single source of truth** for all type definitions
- **Prevents duplication** across files
- **Easier refactoring** - change once, update everywhere
- **Better organization** - types grouped by domain

### Why Better-auth?

- **Full TypeScript support**
- **Flexible** - works with any database
- **Modern** - React 19 compatible
- **Extensible** - easy to add providers

### Why Server Actions?

- **Type-safe** end-to-end
- **No API boilerplate**
- **Built-in security** with Next.js
- **Better DX** than traditional REST

## Troubleshooting

### Jira Connection Issues

See `docs/jira-setup.md` for detailed troubleshooting.

### Type Errors

Always import from `@/types`, never from `@/lib/types`.

### Database Issues

Run `bun run db:studio` to inspect data and schema.

## License

MIT

## Support

For issues or questions, check the docs folder or create an issue.
