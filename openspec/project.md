# ClearSprint AI — Project Spec

## Purpose

ClearSprint AI is a **Linear-native ticket editing tool**. The core value is speed: users connect their Linear workspace, load a project, view all its issues, and rapidly edit them — with AI assistance or manually — then push changes back to Linear in real time.

> The goal is to let users edit and update Linear tickets **FAST**, with AI help, from a purpose-built interface.

---

## Core User Flow

1. **Sign in** via email/password.
2. **Connect Linear** (OAuth 2.0 via Settings page).
3. **Load a Linear project** (select from project picker).
4. **View all issues** in the workspace (Kanban or list view, filterable by state/priority/assignee).
5. **Edit tickets** — click any ticket to open the detail sheet, edit fields (title, description, status, priority, assignee, labels, estimate, due date, parent/child).
6. **AI assistance** — use the AI prompt bar to bulk-edit or refine individual tickets.
7. **Review diffs** — see exactly what changed (field-by-field diff viewer) before committing.
8. **Push changes** — push edits to Linear using the safety-first patch engine (only changed fields are sent).
9. **Pull latest** — pull the latest Linear state at any time to stay in sync.

---

## Features

### Authentication
- Email/password sign-in and sign-up.
- OAuth 2.0 integration with Linear (via `better-auth` + `genericOAuth` plugin).
- Session management with drizzle-backed session store.
- Settings page shows Linear connection status with connect/disconnect controls.

### Linear Workspace
- Load any Linear project the user has access to.
- Pull all issues with full field resolution (status, assignee, labels, estimate, dueDate, parent, children, subscribers).
- Kanban view (grouped by status) and list view.
- Toolbar with filters (status, priority, assignee, search).
- Ticket detail sheet — full field editing for every tracked field.
- Diff review modal — review per-field changes before pushing.
- Bulk select + bulk AI edit via prompt bar.

### Sync Engine (Safety-First)
- **Pull**: Fetches all issues from Linear with parallel relation resolution (250 issues/page). Computes a SHA-256 hash per issue to detect remote changes. Stores `originalData` as the ground truth snapshot.
- **Push**: `buildUpdatePayload` compares `draftData` against `originalData` field by field. Only fields that have **actually changed** are sent to Linear. Untouched fields are never mutated. After a successful push, re-pulls the fresh snapshot to keep `originalData` accurate.
- **Conflict detection**: Tickets marked as `remote_changed` when a pull detects the remote changed since last pull.

### AI Features
- **Single-ticket edit**: AI rewrites selected fields based on a natural-language prompt.
- **Bulk edit**: AI edits multiple selected tickets simultaneously.
- **Subtask generation**: AI generates child issues from a parent ticket.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | better-auth + genericOAuth |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Linear SDK | @linear/sdk |
| AI | OpenAI-compatible endpoint (OpenRouter) |
| Package manager | Bun |

---

## Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification` | Better-auth managed |
| `workspace_projects` | Cached Linear project metadata per user |
| `workspace_tickets` | Cached Linear issue data, draft edits, sync status |

`workspace_tickets` stores:
- `linearId` — Linear issue ID
- `originalData` — JSON snapshot from last successful pull/push
- `draftData` — JSON of user edits (null if not modified)
- `syncStatus` — `synced | modified | new_local | remote_changed | remote_deleted`

---

## Architecture

Feature-Driven (vertical slices):

```
features/linear-sync/
├── actions/
│   ├── connect.server.ts        # Disconnect Linear OAuth
│   ├── pull-sync.server.ts      # Pull issues from Linear → DB
│   ├── push-sync.server.ts      # Push DB diffs → Linear
│   ├── tickets.server.ts        # CRUD for workspace tickets
│   └── workspace-crud.server.ts # Workspace project management
├── components/
│   ├── workspace-client.tsx     # Main workspace orchestrator
│   ├── workspace-kanban-view.tsx
│   ├── workspace-list-view.tsx
│   ├── workspace-header.tsx     # Pull/Push controls
│   ├── workspace-toolbar.tsx    # Filters & search
│   ├── workspace-ticket-card.tsx
│   ├── ticket-detail-sheet.tsx  # Full editing sheet
│   ├── diff-review-modal.tsx    # Pre-push diff review
│   ├── diff-field-viewer.tsx    # Per-field diff renderer
│   ├── ai-prompt-bar.tsx        # AI prompt input
│   ├── bulk-select-toolbar.tsx  # Multi-select controls
│   ├── connect-linear-button.tsx
│   └── linear-project-picker.tsx
├── hooks/
│   └── use-ai-edit.ts
├── utils/
│   ├── diff.ts                  # Field diff computation
│   ├── hash.ts                  # SHA-256 ticket hash
│   ├── filter.ts                # Client-side filter logic
│   ├── status.ts                # Status color/label helpers
│   └── batch.ts                 # Parallel batch utilities
└── types.ts                     # LinearIssueData, TicketDraftData, TicketDiff
```

---

## Project Conventions

### Code Style
- Functions: camelCase | Components: PascalCase | Files: kebab-case
- **NO `any`** — use `unknown` if type is truly unknown
- All mutations via server actions with Zod validation
- Return `{ success, data?, error? }` from all server actions
- `'use server'` on all action files, `'use client'` only when necessary

### Key Principles
- **Feature isolation**: All business logic stays in `features/*/actions/`
- **Server-first**: Default to Server Components
- **No emojis** anywhere in UI or code
- **Safety-first sync**: Never mutate a field in Linear that wasn't changed by the user

---

## Settings Page

`/dashboard/settings` — allows the user to:
- See their Linear connection status (connected / not connected)
- Connect or disconnect their Linear account via OAuth
- View their account email (read-only)

---

## Spec Status

| Feature | Status |
|---|---|
| Email auth | Done |
| Linear OAuth | Done |
| Settings / Linear management | Done |
| Pull sync (250 issues, parallel) | Done |
| Push sync (safety-first patch) | Done |
| Kanban + list view | Done |
| Filters (status, priority, assignee, search) | Done |
| Ticket detail sheet (full fields) | Done |
| Diff review modal | Done |
| AI single-ticket edit | Done |
| AI bulk edit | Done |
| AI subtask generation | Done |
| Hash-based remote change detection | Done |
