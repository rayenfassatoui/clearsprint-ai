# ClearSprint AI

AI-powered Linear ticket management. Connect your Linear workspace, edit tickets with AI, review changes visually, and sync them back — all in one place.

## What It Does

ClearSprint AI eliminates the friction of manually managing Linear tickets. The core loop is:

1. **Connect** — Authorize your Linear account via OAuth.
2. **Import** — Select any Linear project. All issues are pulled and stored locally.
3. **Edit** — Select tickets and use the AI prompt bar to rewrite descriptions, change priorities, create subtasks, and more.
4. **Review** — Open the Diff Viewer to see exactly what changed (field by field) before touching Linear.
5. **Sync** — Click "Review & Push" to open the change summary modal and push only the changes you approve.

A floating bottom bar appears whenever you have unsaved changes, making it impossible to accidentally forget to push.

## Tech Stack

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| Framework       | Next.js 16 (App Router)                        |
| Language        | TypeScript (Strict)                            |
| Styling         | Tailwind CSS v4, shadcn/ui, Framer Motion      |
| Database        | PostgreSQL (Neon), Drizzle ORM                 |
| Auth            | Better-auth (including Linear OAuth)           |
| AI              | OpenAI-compatible API (OpenRouter recommended) |
| Package Manager | Bun                                            |

## Architecture

Feature-Driven (Vertical Slices). Each domain lives entirely in its own `features/` directory.

```
features/
  linear-sync/       # Core product: connecting Linear, syncing, AI editing
    actions/         # Server Actions for pull, push, CRUD
    components/      # Workspace UI, Diff modal, Kanban/List views
    hooks/           # useAiEdit — AI streaming hook
    utils/           # Hash, diff, batch utilities
    types.ts         # LinearIssueData, TicketDraftData, Zod schemas
  auth/              # Sign in, sign up, password reset
  landing/           # Marketing pages
  projects/          # Project creation (local Kanban, not Linear)
  tickets/           # Internal Kanban board for local projects

app/                 # Routing layer only (Next.js App Router)
components/ui/       # Generic shadcn/ui primitives only
lib/                 # Shared: DB, auth client, Linear SDK client
types/               # Centralized TypeScript definitions
```

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in all values in `.env` (see table below).

### 3. Set Up Linear OAuth App

1. Go to [linear.app/settings/api](https://linear.app/settings/api) → "Create new OAuth application".
2. Set the redirect URI to: `http://localhost:3000/api/auth/callback/linear`
3. Copy the **Client ID** and **Client Secret** into `.env`.

### 4. Initialize the Database

```bash
bun run db:push
```

### 5. Run the Dev Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable               | Required | Description                                             |
| ---------------------- | -------- | ------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | Neon (or any Postgres) connection string                |
| `BETTER_AUTH_SECRET`   | Yes      | Random secret: `openssl rand -base64 32`                |
| `BETTER_AUTH_URL`      | Yes      | App base URL (e.g. `http://localhost:3000`)             |
| `NEXT_PUBLIC_APP_URL`  | Yes      | Same as above, used client-side                         |
| `LINEAR_CLIENT_ID`     | Yes      | From your Linear OAuth app                              |
| `LINEAR_CLIENT_SECRET` | Yes      | From your Linear OAuth app                              |
| `LINEAR_REDIRECT_URI`  | Yes      | `{APP_URL}/api/auth/callback/linear`                    |
| `OPENAI_API_KEY`       | Yes      | API key for OpenAI or OpenRouter                        |
| `OPENAI_BASE_URL`      | No       | Override base URL (e.g. `https://openrouter.ai/api/v1`) |
| `OPENAI_MODEL_NAME`    | No       | Model to use (default: `gpt-4o-mini`)                   |
| `SMTP_HOST`            | No       | For password reset emails                               |
| `SMTP_PORT`            | No       | SMTP port (typically `587`)                             |
| `SMTP_USER`            | No       | SMTP username                                           |
| `SMTP_PASS`            | No       | SMTP password                                           |
| `SMTP_FROM`            | No       | Sender address                                          |

## Commands

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `bun run dev`       | Start development server        |
| `bun run build`     | Build for production            |
| `bun run lint`      | Run Biome linter                |
| `bun run db:push`   | Sync Drizzle schema to database |
| `bun run db:studio` | Open Drizzle Studio (DB GUI)    |

## Testing

### Manual End-to-End Test

1. Sign up and log in.
2. Navigate to **Dashboard → Workspace**.
3. Click **Connect Linear** and authorize your account.
4. Click **Load a Linear Project**, select a project, and click **Import**.
5. Verify all issues appear in the List or Kanban view.
6. Click any ticket to open the detail sheet. Use the AI prompt bar to edit it (e.g. "make the description more concise").
7. Click **Save Draft** — the ticket should receive a "Modified" badge and the bottom bar should appear.
8. Click **Review & Push**. Verify the diff modal shows the exact fields that changed.
9. Click **Push Selected** and confirm the change appears on [linear.app](https://linear.app).
10. Click **Pull from Linear** — verify the local hashes update and no changes are pending.

### Automated Tests

Unit tests for the hashing and diff utilities live in:

```
features/linear-sync/__tests__/
```

Run them with:

```bash
bun test
```

## Key Design Decisions

- **No auto-push**: Changes are always reviewed before reaching Linear. The diff modal is the safety gate.
- **Hash-based drift detection**: A deterministic SHA-256 hash of core issue fields (title, description, status, priority, assignee, labels) is stored alongside each ticket. Pull sync recomputes the hash and only updates rows where it differs.
- **Batch rate-limiting**: Push operations run in batches of 5 concurrent requests to respect Linear's API rate limits.
- **Draft state**: All local edits are stored in a `draftData` JSONB column and are never written to Linear until the user explicitly pushes.
