# Project Context

## Purpose

ClearSprint AI is an AI-powered sprint planning application that transforms Product Requirements Documents (PRDs) into actionable Jira tickets. The application enables seamless two-way synchronization between ClearSprint and Jira, allowing users to generate comprehensive backlogs from documents and manage them through an intelligent interface.

**Core Value Proposition:**

- Upload PRDs (PDF, TXT) and generate structured sprint backlogs using AI
- Sync projects bidirectionally with Linear workspaces
- AI-powered ticket refinement and generation
- Visual kanban board for ticket management
- Hierarchical ticket structure (Epics > Tasks > Subtasks)

## Tech Stack

### Frontend

- Framework: Next.js 16 (App Router, React Server Components)
- Language: TypeScript (Strict mode enabled)
- Styling: Tailwind CSS v4, shadcn/ui components (Radix UI primitives)
- Animations: Framer Motion
- State Management: React hooks, Server Components, Suspense

### Backend

- Runtime: Node.js with Bun package manager
- Server Actions: Next.js Server Actions for mutations
- Authentication: Better-auth (OAuth 2.0, session management)
- Database: PostgreSQL (Neon serverless) with Drizzle ORM
- Storage: S3-compatible (Minio) for document uploads
- AI: OpenAI API (GPT-4o-mini model)

### External Integrations

- Linear GraphQL API (OAuth 2.0 via Better-auth)
- OpenAI API for ticket generation and refinement
- S3 API for document storage

### Development Tools

- Package Manager: Bun
- Linter: Biome
- Type Checking: TypeScript strict mode
- Database Migrations: Drizzle Kit

## Project Conventions

### Code Style

**File Naming:**

- Components: kebab-case (e.g., `project-card.tsx`)
- Server Actions: kebab-case with `.server.ts` suffix (e.g., `generate.server.ts`)
- Types: kebab-case (e.g., `linear-types.ts`)

**Code Naming:**

- Functions: camelCase (e.g., `getProjectTickets()`)
- Components: PascalCase (e.g., `ProjectCard`)
- Types/Interfaces: PascalCase (e.g., `LinearProject`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

**Imports:**

- Use absolute imports with `@/` prefix (e.g., `@/features/projects`)
- Group imports: React, Next.js, external libs, internal modules, types
- Prefer named exports over default exports

**TypeScript:**

- NEVER use `any` type - use `unknown` if necessary
- Define interfaces for all external data structures
- Use Zod for runtime validation
- Centralize shared types in `types/` directory

**React:**

- Prefer Server Components by default, use `'use client'` only when needed
- Use React hooks for client-side state
- Implement loading states with Suspense boundaries
- Handle errors with error boundaries

**Styling:**

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use shadcn/ui for consistent component patterns
- No inline styles or CSS-in-JS
- Use CSS variables for theme values

### Architecture Patterns

**Feature-Driven Architecture (Vertical Slices):**

```
features/[feature-name]/
├── components/          # Feature-specific UI
├── actions/            # Server actions (business logic)
├── hooks/              # Custom React hooks
└── types.ts            # Feature-specific types
```

**Three-Tier Architecture:**

1. **Presentation Tier**: `app/` (routing), `components/ui/` (primitives), `features/*/components/` (domain UI)
2. **Business Logic Tier**: `features/*/actions/` (server actions), `lib/` (shared utilities), `app/api/` (API routes)
3. **Data Tier**: `lib/db/` (database), external APIs (Linear, OpenAI, S3)

**Key Principles:**

- Business logic belongs in `features/*/actions/` (server actions)
- Generic UI components ONLY in `components/ui/`
- Feature-specific components in `features/*/components/`
- `app/` directory is routing layer ONLY - no business logic
- `lib/` for cross-cutting utilities (auth, database, external services)

**Server Actions Pattern:**

- All mutations via server actions marked with `'use server'`
- Validate user session before any operation
- Use Zod schemas for input validation
- Return `{ success: boolean, data?: T, error?: string }` pattern
- Handle errors gracefully with try-catch

**Database Access:**

- Use Drizzle ORM for type-safe queries
- All queries through `lib/db/` exports
- Implement proper foreign key relationships
- Use transactions for multi-table operations

### Testing Strategy

**Current State:**

- Limited test coverage (to be expanded)
- Focus on critical paths: authentication, Linear sync, ticket generation

**Testing Approach:**

- Unit tests for utility functions and business logic
- Integration tests for server actions with mocked external APIs
- E2E tests for critical user flows (to be implemented)
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests (planned)

**Test File Naming:**

- Unit tests: `[filename].test.ts`
- Integration tests: `[filename].integration.test.ts`
- E2E tests: `[feature].e2e.test.ts`

### Git Workflow

**Branching Strategy:**

- `master` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code improvements
- `docs/*` - Documentation updates

**Commit Conventions:**

- Use conventional commits format: `type(scope): message`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Keep commits atomic and focused
- Write descriptive commit messages

**Pull Request Process:**

- Create feature branch from `master`
- Implement changes following OpenSpec proposals (for significant changes)
- Run linter and type checks before committing
- Create PR with description linking to relevant specs/proposals
- Merge after review and CI passes

## Domain Context

### Sprint Planning Workflow

1. User uploads PRD document (PDF or TXT)
2. Document stored in S3, text extracted
3. AI generates structured backlog (Epics, Tasks, Subtasks)
4. User reviews and refines tickets using AI
5. Tickets synced to Linear workspace
6. Two-way sync maintains consistency

### Ticket Hierarchy

- **Epic**: High-level feature or initiative
- **Task**: Actionable work item under an epic
- **Subtask**: Granular implementation step under a task

### Linear Integration

- OAuth 2.0 authentication with token refresh
- Fetching workspace projects and teams
- Project-level sync (not workspace-wide)
- Bidirectional sync: ClearSprint <-> Linear

### AI-Powered Features

- Backlog generation from PRDs using GPT-4o-mini
- Ticket refinement (expand, clarify, break down)
- Smart extraction of requirements and acceptance criteria
- Context-aware suggestions

## Important Constraints

### Technical Constraints

- Strict TypeScript mode MUST be maintained
- No `any` types allowed
- Server-side rendering preferred for performance
- Database queries MUST be type-safe (Drizzle ORM)
- All user input MUST be validated with Zod

### Business Constraints

- Authentication required for all app features
- Users can only access their own projects and tickets
- Linear integration requires active OAuth connection
- Document uploads limited by S3 storage quotas

### UX Constraints

- Modern, elegant design aesthetic required
- NO emojis in UI or code (design principle)
- Mobile-first responsive design
- Proactive edge case handling
- Clear error messages and loading states

### Security Constraints

- All external API calls use stored tokens (no client-side secrets)
- Session validation on every server action
- Secure token storage in database
- OAuth token refresh implemented
- Input sanitization for all user-generated content

### Performance Constraints

- Server Components for initial page load performance
- Suspense boundaries for progressive loading
- Optimistic UI updates where appropriate
- Efficient database queries (avoid N+1 problems)

## External Dependencies

### Linear API

- Base URL: `https://api.linear.app/graphql`
- Authentication: OAuth 2.0 (stored in `account` table)
- Official Node.js SDK: `@linear/sdk`
- Rate limits: Respect Linear rate limiting

### OpenAI API

- Model: GPT-4o-mini (cost-effective, fast)
- Use cases: Ticket generation, refinement
- API Key: Stored in environment variables
- Prompts: Structured with context and examples
- Response parsing: JSON mode for structured data

### S3 Storage (Minio)

- Document upload endpoint
- Supported formats: PDF, TXT
- Max file size: Configurable
- Access: Server-side only (pre-signed URLs)

### Better-Auth

- Authentication provider
- OAuth integration for Linear
- Session management
- API routes: `/api/auth/*`

### Database (Neon PostgreSQL)

- Serverless PostgreSQL
- Connection pooling enabled
- Schema managed via Drizzle ORM
- Tables:
  - `user`, `session`, `account`, `verification` (Better-auth)
  - `projects`, `tickets`, `ticketHistory` (Application)

## Common Patterns

### Server Action Pattern

```typescript
'use server';

export async function actionName(input: InputSchema) {
  // 1. Validate session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Unauthorized' };

  // 2. Validate input
  const validated = schema.safeParse(input);
  if (!validated.success) return { error: 'Invalid input' };

  // 3. Execute logic
  try {
    const result = await doWork(validated.data);
    return { success: true, data: result };
  } catch (error) {
    return { error: 'Operation failed' };
  }
}
```

### Component Pattern

```typescript
// Server Component (default)
export async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (when needed)
'use client';
export function ClientComponent() {
  const [state, setState] = useState();
  return <div onClick={() => setState(x)}>{state}</div>;
}
```

### Error Handling Pattern

```typescript
// In server actions
try {
  await operation();
  return { success: true };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

// In components
if (result.error) {
  toast.error(result.error);
  return;
}
```

## Design Principles

1. **User Experience First**: Always prioritize UX, handle edge cases proactively
2. **Modern Aesthetics**: Strive for elegant, professional design with subtle animations
3. **Type Safety**: Leverage TypeScript's type system fully, no shortcuts
4. **Feature Isolation**: Keep features self-contained in their vertical slices
5. **Server-First**: Default to Server Components, use client components sparingly
6. **Clear Separation**: Respect architectural boundaries (presentation, logic, data)
7. **Production Ready**: Write maintainable, secure, well-documented code
8. **No Emojis**: Professional aesthetic without emoji usage
