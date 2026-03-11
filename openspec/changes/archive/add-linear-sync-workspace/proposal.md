# Change: Replace Jira with Linear and Add AI-Powered Workspace Sync

## Why

ClearSprint AI is pivoting from Jira to Linear as its sole project management integration. The existing Jira-based workflow is being replaced with a fundamentally different approach: users pull Linear project tickets into a local workspace, use AI agents to bulk-edit, refine, create sub-issues, and restructure work, then review a visual diff of all changes before pushing them back to Linear in a single atomic operation. This gives users a safe "sandbox" to perform sweeping AI-driven modifications without touching the live source of truth until they are ready.

## What Changes

- **BREAKING**: Remove all Jira integration code (`lib/jira.ts`, `features/jira/`, Atlassian OAuth, `jiraTokens` table, `jiraProjectKey` column, `jiraId` column)
- **BREAKING**: Replace Atlassian social provider in Better-auth with Linear OAuth
- Add `@linear/sdk` package for Linear GraphQL API access
- Add `ai` (Vercel AI SDK v6) and `@ai-sdk/openai` packages for structured AI ticket editing
- Create new `features/linear-sync/` feature module with:
  - Linear OAuth connection and project selection
  - One-way pull: fetch Linear project issues into local `workspace_tickets` table
  - Content hashing to detect local vs. remote drift
  - AI agent integration for bulk ticket editing, sub-issue creation, description rewriting
  - Draft state management: all AI edits stay local until explicitly pushed
  - Visual diff view comparing original Linear state with local drafts
  - Push engine: batch sync local changes back to Linear via GraphQL mutations
- Add new database tables: `linear_connections`, `workspace_projects`, `workspace_tickets`
- Create new app routes: `/dashboard/workspace/[projectId]`
- Build List View and Kanban View with toggle for workspace tickets
- Build diff review modal with change summary before push

## Impact

- Affected specs: `linear-integration` (new), `workspace-tickets` (new), `ai-ticket-editing` (new), `sync-engine` (new)
- Affected code:
  - `lib/auth.ts` (swap Atlassian for Linear OAuth)
  - `lib/db/schema.ts` (remove Jira tables, add Linear/workspace tables)
  - `lib/jira.ts` (DELETE entirely)
  - `features/jira/` (DELETE entirely)
  - `features/linear-sync/` (CREATE new feature)
  - `app/dashboard/workspace/` (CREATE new routes)
  - `app/api/ai/` (CREATE new API routes for AI SDK streaming)
  - `types/` (add Linear and workspace types)
  - `package.json` (add `@linear/sdk`, `ai`, `@ai-sdk/openai`; remove Jira/Atlassian deps)
  - `openspec/project.md` (update project context to reflect Linear pivot)
