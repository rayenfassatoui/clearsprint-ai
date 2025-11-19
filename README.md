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
├── actions/              # Server actions
│   ├── jira.server.ts   # Jira API operations
│   ├── upload.server.ts # Document upload
│   └── user.server.ts   # User operations
├── app/                  # Next.js app directory
│   ├── api/auth/        # Auth API routes
│   ├── auth/            # Auth pages (signin/signup)
│   ├── dashboard/       # Main application
│   │   ├── page.tsx    # Dashboard overview
│   │   ├── projects-list/ # All projects
│   │   ├── projects/   # Individual project pages
│   │   ├── settings/   # User settings
│   │   └── test/       # Jira API testing
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── examples/       # Example components
│   ├── sidebar.tsx     # Main navigation
│   └── user-profile.tsx # User profile widget
├── lib/                 # Utility libraries
│   ├── db/             # Database schema & config
│   ├── auth.ts         # Auth configuration
│   ├── jira.ts         # Jira API client
│   └── s3.ts           # S3 storage client
├── types/               # TypeScript type definitions
│   ├── database.ts     # DB model types
│   ├── jira.ts         # Jira API types
│   ├── pdf.ts          # PDF parsing types
│   ├── actions.ts      # Server action types
│   └── index.ts        # Centralized exports
├── drizzle/             # Database migrations
├── docs/                # Documentation
└── public/              # Static assets
```

## Strict Structure Rules

### File Organization

1. **Server Actions** (`actions/`):
   - Must end with `.server.ts`
   - Must start with `'use server'` directive
   - Group by feature (e.g., `jira.server.ts`, `user.server.ts`)

2. **Components** (`components/`):
   - Client components: Use `'use client'` directive
   - Server components: No directive (default)
   - UI primitives go in `components/ui/`
   - Feature components at root level

3. **Types** (`types/`):
   - **MUST** use centralized types folder
   - Group by domain (database, jira, pdf, actions)
   - Import from `@/types` ONLY
   - Never define types inline for shared data

4. **Database** (`lib/db/`):
   - Schema definitions in `schema.ts`
   - Migrations in `drizzle/` folder
   - All DB operations through Drizzle

5. **Routes** (`app/`):
   - Follow Next.js App Router conventions
   - Protected routes under `/dashboard`
   - Public routes at root level

### Naming Conventions

- **Files**: `kebab-case.tsx` or `kebab-case.ts`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

### Import Rules

```typescript
// ✅ Correct
import { User } from '@/types';
import { db } from '@/lib/db';

// ❌ Wrong - never use relative paths for cross-folder imports
import { User } from '../../lib/types';
```

### Type Safety Rules

1. **Never use `any`** - Use `unknown` and type guards
2. **Explicit return types** for all exported functions
3. **Strict mode enabled** in tsconfig.json
4. **No implicit any** in function parameters

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
