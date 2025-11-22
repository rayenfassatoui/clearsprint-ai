# ClearSprint AI - Architecture Documentation

## Overview

ClearSprint AI is an AI-powered sprint planning application that transforms Product Requirements Documents (PRDs) into actionable Jira tickets. The application is built using a **Three-Tier Architecture** pattern combined with **Feature-Driven Design** (Vertical Slices), providing a clean separation of concerns while maintaining feature cohesion.

## Three-Tier Architecture

The application follows the classic three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                        │
│  (UI Components, Pages, Client-Side Logic)                  │
│  - app/                                                      │
│  - components/                                               │
│  - features/*/components/                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC TIER                     │
│  (Server Actions, API Routes, Business Rules)               │
│  - features/*/actions/                                       │
│  - lib/                                                      │
│  - app/api/                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        DATA TIER                             │
│  (Database, External Services, Storage)                     │
│  - lib/db/                                                   │
│  - PostgreSQL (Neon)                                         │
│  - S3 (Minio)                                                │
│  - Jira API                                                  │
│  - OpenAI API                                                │
└─────────────────────────────────────────────────────────────┘
```

### 1. Presentation Tier

The presentation tier handles all user interface and user interaction logic. It's responsible for rendering views and capturing user input.

#### Components:

**`app/` - Routing Layer**
- **Purpose**: Next.js App Router pages and layouts
- **Responsibility**: Route definitions, page composition, and layout structure
- **Key Files**:
  - `app/page.tsx` - Landing page
  - `app/dashboard/` - Dashboard routes
  - `app/auth/` - Authentication pages
  - `app/api/` - API route handlers

**`components/` - Generic UI Primitives**
- **Purpose**: Reusable, framework-agnostic UI components
- **Responsibility**: Presentational components with no business logic
- **Key Components**:
  - `components/ui/` - shadcn/ui primitives (Button, Dialog, Input, etc.)
  - `components/sidebar.tsx` - Navigation sidebar
  - **STRICT RULE**: Only generic, reusable components belong here

**`features/*/components/` - Feature-Specific UI**
- **Purpose**: Domain-specific UI components
- **Responsibility**: Feature-specific presentational logic
- **Examples**:
  - `features/projects/components/project-card.tsx` - Project display card
  - `features/tickets/components/kanban-board.tsx` - Ticket management board
  - `features/auth/components/signin-form.tsx` - Authentication forms
  - `features/landing/components/` - Landing page sections

#### Technology Stack:
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **State Management**: React hooks, Server Components

---

### 2. Business Logic Tier

The business logic tier contains all application logic, business rules, data validation, and orchestration between the presentation and data tiers.

#### Components:

**`features/*/actions/` - Server Actions**
- **Purpose**: Server-side business logic and data mutations
- **Responsibility**: Handle user actions, validate input, orchestrate data operations
- **Key Files**:
  - `features/projects/actions/generate.server.ts`
    - `generateBacklog()` - AI-powered ticket generation from PRDs
    - `tweakTicket()` - AI-powered ticket refinement
  - `features/projects/actions/upload.server.ts`
    - Document upload and text extraction
  - `features/tickets/actions/tickets.server.ts`
    - `getProjectTickets()` - Fetch tickets for a project
    - `updateTicketOrder()` - Reorder tickets (drag-and-drop)
    - `updateTicket()` - Update ticket details
    - `deleteTicket()` - Delete tickets and children
  - `features/auth/actions/auth.server.ts`
    - Authentication and session management

**`lib/` - Shared Utilities and Services**
- **Purpose**: Cross-cutting concerns and shared business logic
- **Responsibility**: Authentication, database access, external service integration
- **Key Files**:
  - `lib/auth.ts` - Better-auth configuration and session management
  - `lib/jira.ts` - Jira API integration
    - Token management and refresh
    - CRUD operations for Jira issues
    - Project and resource fetching
  - `lib/s3.ts` - S3 storage operations (Minio)
  - `lib/email.ts` - Email service integration
  - `lib/utils.ts` - Utility functions

**`app/api/` - API Routes**
- **Purpose**: HTTP API endpoints
- **Responsibility**: Handle external webhooks, OAuth callbacks
- **Key Routes**:
  - `app/api/auth/` - Better-auth API routes

#### Business Rules:
1. **Authentication**: All server actions verify user session before execution
2. **Authorization**: Users can only access their own projects and tickets
3. **Validation**: Input validation using Zod schemas
4. **AI Integration**: OpenAI GPT-4 for intelligent ticket generation and refinement
5. **Jira Sync**: Automatic token refresh and API error handling

#### Technology Stack:
- **Server Actions**: Next.js Server Actions (React Server Components)
- **Validation**: Zod
- **AI**: OpenAI API (GPT-4o-mini)
- **Authentication**: Better-auth
- **External APIs**: Jira REST API v3, Atlassian OAuth 2.0

---

### 3. Data Tier

The data tier manages all data persistence, retrieval, and external data source integration.

#### Components:

**`lib/db/` - Database Layer**
- **Purpose**: Database schema and connection management
- **Responsibility**: Data models, queries, and database operations
- **Key Files**:
  - `lib/db/schema.ts` - Drizzle ORM schema definitions
  - `lib/db/index.ts` - Database connection and client

**Database Schema**:

```typescript
// Authentication Tables (Better-auth)
- user: User accounts
- session: Active sessions
- account: OAuth provider accounts
- verification: Email verification tokens

// Application Tables
- projects: User projects with PRD content
- tickets: Epics, tasks, and subtasks
- ticketHistory: Audit trail for ticket changes
- jiraTokens: Jira OAuth tokens (deprecated, now in 'account')
```

**External Data Sources**:

1. **PostgreSQL (Neon)**
   - Primary data store
   - Serverless PostgreSQL with HTTP driver
   - Managed via Drizzle ORM

2. **S3 Storage (Minio)**
   - Document storage (PDFs, TXT files)
   - PRD file uploads
   - Configured via `lib/s3.ts`

3. **Jira API**
   - External work item management
   - OAuth 2.0 authentication
   - REST API v3 integration
   - Managed via `lib/jira.ts`

4. **OpenAI API**
   - AI-powered content generation
   - Ticket creation and refinement
   - GPT-4o-mini model

#### Data Flow Example:

```
User uploads PRD
    ↓
[Presentation] Upload form component
    ↓
[Business Logic] upload.server.ts action
    ↓
[Data] S3 storage + Extract text
    ↓
[Data] Save to PostgreSQL (projects table)
    ↓
[Business Logic] generateBacklog() action
    ↓
[Data] OpenAI API call
    ↓
[Data] Insert tickets into PostgreSQL
    ↓
[Presentation] Display tickets in Kanban board
```

#### Technology Stack:
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Storage**: S3-compatible (Minio)
- **Migration**: Drizzle Kit

---

## Feature-Driven Architecture (Vertical Slices)

While the application follows a three-tier architecture, it's organized by **features** rather than technical layers. Each feature is a vertical slice containing all three tiers.

### Feature Structure:

```
features/
├── auth/                    # Authentication feature
│   ├── components/          # [Presentation] Login/Signup forms
│   ├── actions/             # [Business Logic] Auth operations
│   └── types/               # Feature-specific types
├── projects/                # Project management feature
│   ├── components/          # [Presentation] Project UI
│   ├── actions/             # [Business Logic] Project operations
│   │   ├── generate.server.ts
│   │   └── upload.server.ts
│   └── types/
├── tickets/                 # Ticket management feature
│   ├── components/          # [Presentation] Kanban board
│   ├── actions/             # [Business Logic] Ticket CRUD
│   └── types/
├── jira/                    # Jira integration feature
│   ├── components/          # [Presentation] Jira connection UI
│   ├── actions/             # [Business Logic] Jira sync
│   └── types/
└── landing/                 # Marketing pages feature
    └── components/          # [Presentation] Landing sections
```

### Benefits of Feature-Driven Design:

1. **Cohesion**: Related code lives together
2. **Scalability**: Easy to add new features without touching existing code
3. **Maintainability**: Clear boundaries between features
4. **Team Collaboration**: Different teams can work on different features
5. **Testing**: Features can be tested in isolation

---

## Key Architectural Patterns

### 1. Server Components & Server Actions

The application leverages React Server Components and Next.js Server Actions for optimal performance:

- **Server Components**: Default for all pages, reducing client-side JavaScript
- **Server Actions**: Direct server-side mutations without API routes
- **Client Components**: Only when interactivity is needed (forms, animations)

### 2. Authentication Flow

```
User Login Request
    ↓
[Presentation] SignIn Form (features/auth/components/)
    ↓
[Business Logic] Better-auth (lib/auth.ts)
    ↓
[Data] Verify credentials (PostgreSQL)
    ↓
[Business Logic] Create session
    ↓
[Data] Store session (PostgreSQL)
    ↓
[Presentation] Redirect to dashboard
```

### 3. AI-Powered Ticket Generation

```
User uploads PRD
    ↓
[Presentation] Upload component
    ↓
[Business Logic] upload.server.ts
    ↓
[Data] Extract text from PDF/TXT
    ↓
[Data] Store in PostgreSQL (projects.rawText)
    ↓
User clicks "Generate Tickets"
    ↓
[Business Logic] generateBacklog()
    ↓
[Data] Send PRD to OpenAI API
    ↓
[Data] Parse AI response (Zod validation)
    ↓
[Data] Insert hierarchical tickets (Epics → Tasks → Subtasks)
    ↓
[Presentation] Display in Kanban board
```

### 4. Jira Integration

```
User connects Jira account
    ↓
[Presentation] OAuth redirect to Atlassian
    ↓
[Business Logic] Better-auth OAuth callback
    ↓
[Data] Store tokens in 'account' table
    ↓
User pushes tickets to Jira
    ↓
[Business Logic] Check token expiration (lib/jira.ts)
    ↓
[Data] Refresh token if needed
    ↓
[Data] Create Jira issues via REST API
    ↓
[Data] Update tickets with jiraId
    ↓
[Presentation] Show sync status
```

---

## Data Flow Patterns

### Read Operations (Query)

```
[Presentation] Component needs data
    ↓
[Business Logic] Server Action (e.g., getProjectTickets())
    ↓
[Business Logic] Verify authentication
    ↓
[Data] Query database via Drizzle ORM
    ↓
[Business Logic] Transform/format data
    ↓
[Presentation] Render component
```

### Write Operations (Mutation)

```
[Presentation] User submits form
    ↓
[Business Logic] Server Action (e.g., updateTicket())
    ↓
[Business Logic] Verify authentication
    ↓
[Business Logic] Validate input (Zod)
    ↓
[Data] Update database
    ↓
[Data] Log to ticketHistory (audit trail)
    ↓
[Business Logic] Return success/error
    ↓
[Presentation] Update UI / Show toast
```

---

## Security Architecture

### Authentication & Authorization

1. **Session-Based Auth**: Better-auth with secure HTTP-only cookies
2. **OAuth Integration**: Atlassian OAuth 2.0 for Jira
3. **Token Management**: Automatic refresh for expired tokens
4. **Row-Level Security**: Users can only access their own data

### Data Protection

1. **Input Validation**: Zod schemas for all user input
2. **SQL Injection Prevention**: Drizzle ORM parameterized queries
3. **XSS Prevention**: React automatic escaping
4. **CSRF Protection**: Better-auth built-in protection

### API Security

1. **Server Actions**: Automatic CSRF protection
2. **Rate Limiting**: (Recommended to add)
3. **Token Encryption**: Stored in database, never exposed to client
4. **Scope Management**: Minimal Jira permissions requested

---

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel Edge                          │
│                    (Next.js Hosting)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                           │
│                  (Serverless Database)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  - Minio (S3 Storage)                                        │
│  - OpenAI API                                                │
│  - Jira API                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_URL=https://...
BETTER_AUTH_SECRET=...

# Jira Integration
ATLASSIAN_CLIENT_ID=...
ATLASSIAN_CLIENT_SECRET=...

# AI
OPENAI_API_KEY=...
OPENAI_MODEL_NAME=gpt-4o-mini

# Storage
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

---

## Development Workflow

### Project Commands

```bash
# Development
bun run dev              # Start dev server

# Database
bun run db:generate      # Generate migrations
bun run db:push          # Push schema to database
bun run db:studio        # Open Drizzle Studio

# Code Quality
bun run lint             # Run Biome linter
bun run lint:fix         # Fix lint errors
bun run format           # Check formatting
bun run format:write     # Format code
bun run check:fix        # Lint + format

# Production
bun run build            # Build for production
bun run start            # Start production server
```

### Adding a New Feature

1. **Create feature directory**: `features/new-feature/`
2. **Add components**: `features/new-feature/components/`
3. **Add server actions**: `features/new-feature/actions/`
4. **Add types**: `features/new-feature/types/`
5. **Create routes**: `app/dashboard/new-feature/page.tsx`
6. **Update database schema** (if needed): `lib/db/schema.ts`

---

## Best Practices & Standards

### Code Organization

1. **Feature Isolation**: All business logic in `features/[feature-name]/`
2. **No Business Logic in UI**: `components/ui/` is for primitives only
3. **Server Actions for Mutations**: Never use client-side API calls for mutations
4. **Type Safety**: Strict TypeScript, no `any` types
5. **Validation**: Zod schemas for all external input

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Server Actions**: `*.server.ts` suffix
- **Types**: `PascalCase` interfaces/types

### Database Patterns

1. **Migrations**: Use Drizzle Kit for schema changes
2. **Queries**: Use Drizzle ORM, avoid raw SQL
3. **Transactions**: Use when multiple related writes occur
4. **Indexes**: Add for frequently queried columns
5. **Audit Trail**: Log important changes to `ticketHistory`

---

## Scalability Considerations

### Current Limitations

1. **Sequential Ticket Creation**: Could be parallelized for large backlogs
2. **No Caching**: Consider Redis for frequently accessed data
3. **No Background Jobs**: Long-running tasks block server actions
4. **No Real-time Updates**: Consider WebSockets for collaborative editing

### Future Enhancements

1. **Queue System**: Bull/BullMQ for background job processing
2. **Caching Layer**: Redis for session and frequently accessed data
3. **CDN**: CloudFront for static assets
4. **Database Optimization**: Read replicas for analytics queries
5. **Microservices**: Extract AI processing to separate service

---

## Conclusion

ClearSprint AI successfully implements a **Three-Tier Architecture** with a **Feature-Driven Design** approach. This hybrid architecture provides:

- **Clear Separation of Concerns**: Presentation, Business Logic, and Data tiers
- **Feature Cohesion**: Related code organized by domain, not technical layer
- **Scalability**: Easy to add new features and scale individual components
- **Maintainability**: Clear boundaries and consistent patterns
- **Type Safety**: End-to-end TypeScript with strict validation
- **Modern Stack**: Leverages latest Next.js, React, and serverless technologies

The architecture is designed for rapid iteration while maintaining production-grade quality, security, and performance.
