## Context

ClearSprint AI is pivoting from a Jira-centric sprint planning tool to a Linear-only, AI-native workspace for issue management. The user connects their Linear account, selects a project, pulls all tickets into a local workspace (with full metadata and content hashes), uses AI agents to perform bulk edits (rewriting descriptions, creating sub-issues, reassigning, restructuring), reviews a visual diff of everything that changed compared to the live Linear state, and pushes approved changes back to Linear in one batch. This is a major overhaul touching auth, database schema, external integrations, AI capabilities, and the entire UI.

**Stakeholders:** Product owner, frontend engineers, backend engineers, designers.

## Goals / Non-Goals

### Goals

- Replace Jira with Linear as the sole integration (no Jira code remains)
- Implement workspace-based sync lifecycle: Pull -> Edit (AI or manual) -> Diff Review -> Push
- Provide high-quality AI-powered bulk editing using Vercel AI SDK v6 (`generateObject`, `streamText`) with strict Zod schemas
- Build a polished, professional UI for List and Kanban views with diff overlays
- Maintain content integrity via deterministic hashing of ticket fields
- Handle rate limiting, partial failures, and conflict detection gracefully

### Non-Goals

- Real-time bidirectional sync (WebSocket-based live updates from Linear)
- Complex three-way merge conflict resolution (start with "warn and overwrite" strategy)
- Supporting multiple Linear workspaces simultaneously per user (single workspace at a time)
- Mobile-native app (responsive web is sufficient)
- AI model fine-tuning or custom model training

## Decisions

### Decision 1: Linear SDK (`@linear/sdk`) over raw GraphQL

- **Why:** The official SDK provides typed models, pagination helpers, error handling, and authentication utilities out of the box. Version 76+ is actively maintained and covers all issue, project, and team operations.
- **Alternatives considered:** Raw `fetch` to Linear GraphQL endpoint. Rejected because the SDK handles auth, pagination, and types automatically.

### Decision 2: Vercel AI SDK v6 (`ai` package) for AI operations

- **Why:** AI SDK v6 unifies `generateObject` and `generateText`, supports multi-step tool calling, integrates natively with Next.js App Router streaming, and provides type-safe structured outputs via Zod schemas. The project already uses Next.js 16 and Zod, making it a natural fit.
- **Alternatives considered:** Raw OpenAI SDK (already in `package.json`). Rejected because AI SDK v6 provides superior streaming UX, provider abstraction, and structured output validation. We will use `@ai-sdk/openai` as the provider.

### Decision 3: Content hashing for change detection

- **Why:** Hash core ticket fields (title, description, status, priority, assignee ID, labels) into a deterministic SHA-256 hash stored alongside each workspace ticket. Comparing hashes is O(1) and avoids deep JSON comparison.
- **Hash scope:** Only hash semantically meaningful fields. Ignore metadata like `updatedAt` or `createdAt` to avoid false positives.

### Decision 4: Draft state stored in database, not client-side

- **Why:** Persisting draft state in the database (as a `draft_data` JSONB column on `workspace_tickets`) ensures drafts survive page refreshes, are shareable across sessions, and can be audited.
- **Alternatives considered:** Client-side state (Zustand/localStorage). Rejected because drafts could be lost on refresh, and the AI agent operates server-side so it naturally writes to the DB.

### Decision 5: Linear OAuth via Better-auth social provider

- **Why:** Better-auth already handles OAuth flows, token refresh, and account linking. We replace the Atlassian provider with a custom Linear provider (Linear supports OAuth 2.0 with PKCE).
- **Implementation:** Register a new social provider in `lib/auth.ts` with Linear's OAuth endpoints. Store `access_token` and `refresh_token` in the `account` table, same pattern as the current Atlassian integration.

### Decision 6: Push engine with concurrency-limited batching

- **Why:** Linear API has rate limits. The push engine SHALL process mutations sequentially or with a concurrency limit of 3-5, retrying on transient failures. Each mutation result is tracked so partial failures are reported.
- **Pattern:** Use `Promise.allSettled` with a concurrency pool. Report results per-ticket in the UI.

### Decision 7: Feature structure under `features/linear-sync/`

- **Why:** Follows the project's established Feature-Driven Architecture. All Linear-specific business logic, components, hooks, and types live in one vertical slice.
- **Structure:**
  ```
  features/linear-sync/
  +-- actions/          # Server actions for all mutations
  +-- components/       # UI components (workspace views, diff viewer, etc.)
  +-- hooks/            # Client-side hooks (useWorkspaceTickets, useSyncStatus)
  +-- types.ts          # Feature-specific types and Zod schemas
  +-- utils/            # Hashing, diff computation, batching utilities
  ```

## Risks / Trade-offs

| Risk                                                            | Severity | Mitigation                                                                                                          |
| --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| Linear OAuth provider not natively supported by better-auth     | Medium   | Implement custom provider using better-auth's extensible social provider API; Linear uses standard OAuth 2.0        |
| AI hallucinates invalid ticket fields or non-existent assignees | High     | Enforce strict Zod schemas on all AI outputs; validate against known Linear team members and labels before applying |
| Large projects (500+ tickets) cause slow initial sync           | Medium   | Paginate the Linear SDK fetch; show progressive loading with ticket count; allow partial sync by label or status    |
| Content hash collisions                                         | Very Low | SHA-256 collision probability is negligible for our data sizes                                                      |
| Push fails midway through batch                                 | Medium   | Use `Promise.allSettled`; report per-ticket success/failure in the UI; allow retry of failed tickets                |
| User edits on Linear during workspace editing cause data loss   | Medium   | On push, re-fetch the remote hash; warn user if remote has changed since last pull; offer "Force Push" or "Re-Pull" |

## Migration Plan

### Phase 1: Remove Jira (Non-Breaking database migration)

1. Remove `lib/jira.ts` and `features/jira/` directory
2. Remove Atlassian social provider from `lib/auth.ts`
3. Drop `jiraTokens` table, `jiraProjectKey` from `projects`, `jiraId` from `tickets` via Drizzle migration
4. Remove Jira-related npm packages if any exist

### Phase 2: Add Linear + Workspace Schema

1. Add Linear social provider to Better-auth
2. Create new Drizzle tables: `linear_connections`, `workspace_projects`, `workspace_tickets`
3. Run Drizzle migration (`bun run db:push`)

### Phase 3: Build Feature

1. Scaffold `features/linear-sync/`
2. Implement pull, edit, diff, push in order
3. Build UI components

### Rollback

- Database migrations include both `up` and `down` scripts
- Feature-flagged behind a `FEATURE_LINEAR_SYNC` environment variable during development
- Old Jira code preserved in git history

## Open Questions

- **Q1:** Should we support Linear Personal API Keys in addition to OAuth? (Assumption: OAuth only for V1, PATs as a future enhancement)
- **Q2:** What is the desired behavior when a ticket is deleted on Linear but has local drafts? (Assumption: Show a "Deleted on Remote" badge and block push for that ticket)
- **Q3:** Should the AI be able to change ticket assignments, or only content? (Assumption: Full field editing including assignments, labels, priority, status)
