# ClearSprint AI - Product Requirements Document (PRD)

## 1. Product Overview
ClearSprint AI ingests PRD/docs via upload, uses OpenAI to generate Jira-ready backlogs (epics > tasks > subtasks), visualizes as editable cards, supports AI tweaks, and pushes hierarchically to user's Jira via OAuth.

**Core Loop**: Upload doc → AI gen cards → Edit/reorder/AI tweak → Push to Jira.
**MVP Goal**: Single-user app; auth → upload → gen → visualize → push.

## 2. Key Features
1. User auth (email/password via better-auth).
2. Jira OAuth connect (store tokens securely).
3. Doc upload (PDF/TXT to Vercel Blob) + text extraction.
4. OpenAI compliant url generation: Doc text → structured JSON backlog (epics array with nested tasks/subtasks).
5. Card visualization: Drag/drop/reorder hierarchy, inline edit.
6. AI actions: "Refine All" (global), "Tweak Card" (per-card prompt).
7. Jira push: Select project → create issues (epic first, link children).

## 3. User Flow
1. Signup/Login → Dashboard.
2. Connect Jira (OAuth button).
3. Upload doc → "Generate Backlog" → Cards view.
4. Edit/reorder cards → AI tweak optional.
5. Select Jira project → "Push to Jira" → Success/links.

## 4. Tech Stack
- Next.js (App Router, Server Actions, TypeScript).
- better-auth (auth).
- Drizzle ORM + PostgreSQL (Neon).
- Tailwind CSS + shadcn/ui (@dnd-kit/core for drag/drop).
- OpenAI API (GPT-4o-mini, structured JSON output).
- Vercel Blob (doc storage).
- Zod (validation).
- pdf-parse (PDF text extraction).

## 5. Database Schema (Drizzle)
```ts
// schema.ts
export const users = pgTable('users', { id: serial('id').primaryKey(), email: text('email').unique(), name: text('name') });
export const jiraTokens = pgTable('jira_tokens', { id: serial('id').primaryKey(), userId: integer('user_id').references(() => users.id), accessToken: text('access_token'), refreshToken: text('refresh_token'), instanceUrl: text('instance_url') });
export const projects = pgTable('projects', { id: serial('id').primaryKey(), userId: integer('user_id').references(() => users.id), name: text('name'), docUrl: text('doc_url'), jiraProjectKey: text('jira_project_key') });
export const tickets = pgTable('tickets', { id: serial('id').primaryKey(), projectId: integer('project_id').references(() => projects.id), type: text('type').$type<'epic'|'task'|'subtask'>(), title: text('title'), description: text('description'), parentId: integer('parent_id'), orderIndex: integer('order_index'), jiraId: text('jira_id') });
```

## 6. UI Components (shadcn/ui + Tailwind)
1. Layout: Sidebar (projects list), Header (connect Jira, new project), Main (cards grid).
2. Upload: Dropzone + Generate button.
3. Cards: shadcn Card (title editable, desc preview, type badge, drag handle, AI button, delete).
4. Modals: AI Tweak (prompt input + gen), Jira Push (project select + confirm).
5. Toasts: Success/error (shadcn Sonner).

## 7. API Integrations
1. OpenAI: POST /chat/completions (system: "Output JSON: {epics: [{title, desc, tasks: [{title, desc, subtasks: []}]}]}").
2. Jira OAuth: better-auth provider → /rest/api/3/issue (bulk create epic → tasks with parent).
3. Vercel Blob: upload → public URL → fetch/extract text.

## 8. Implementation Plan

### Epic 1: Project Setup + Auth (Priority 1)
- [x] 1.1 npx create-next-app@latest --ts --app clearsprint-ai; add drizzle.config.ts, tailwind.config.js.
- [x] 1.2 Install deps: drizzle-orm, better-auth, @shadcn/ui, @dnd-kit/core, openai, pdf-parse, vercel-blob, zod, sonner.
- [x] 1.3 Setup Drizzle: schema.ts, db.ts (Neon connection), migrations.
- [x] 1.4 Integrate better-auth: auth.ts config (email/password), /auth/signin page.
- [x] 1.5 Basic layout: /app/layout.tsx (shadcn Sidebar, Navbar).

### Epic 2: Jira OAuth Connect (Priority 1)
- [x] 2.1 Extend better-auth with Jira OAuth provider (clientId/secret from env).
- [x] 2.2 Server Action: connectJira() → store tokens in jira_tokens table. (Handled by better-auth social provider)
- [x] 2.3 Dashboard button: "Connect Jira" → redirect OAuth → toast success.

### Epic 3: Doc Upload + Storage (Priority 2)
- [ ] 3.1 shadcn Dropzone component in /dashboard.
- [ ] 3.2 Server Action: uploadDoc() →S3 compliant api (minio).put(file) → store URL in new project row.
- [ ] 3.3 PDF/TXT extract: fetch URL → pdf-parse or text() → store raw_text in projects.

### Epic 4: AI Backlog Generation (Priority 2)
- [ ] 4.1 Server Action: generateBacklog(projectId) → OpenAI chat.completions (prompt: doc_text → JSON epics/tasks).
- [ ] 4.2 Parse JSON → insert tickets (set parentId/orderIndex for hierarchy).
- [ ] 4.3 Button on upload: "Generate" → optimistic UI + loading → cards render.

### Epic 5: Cards Visualization + Edit/Drag (Priority 3)
- [ ] 5.1 Fetch /api/projects/[id]/tickets → render grid of shadcn Cards (hierarchy via parentId).
- [ ] 5.2 Inline edit: title/desc → Server Action updateTicket().
- [ ] 5.3 @dnd-kit: Drag/drop reorder → onDrop update orderIndex/parentId in DB.

### Epic 6: AI Tweaks (Priority 3)
- [ ] 6.1 Global "Refine All": Server Action re-gen entire project → diff modal → apply/reject.
- [ ] 6.2 Per-card: Modal "AI Tweak" → user prompt input → OpenAI edit single ticket → replace.
- [ ] 6.3 Log prompt in ticket for history.

### Epic 7: Jira Push (Priority 4)
- [ ] 7.1 Fetch user jira_tokens → list projects via API.
- [ ] 7.2 Modal: Select jira_project_key → confirm.
- [ ] 7.3 Server Action: pushToJira() → create epic → for each task/subtask POST /issue with parent=epicKey → update ticket.jiraId.
- [ ] 7.4 Toast: "Pushed! View in Jira: [link]".

### Epic 8: History + Polish (Priority 5)
- [ ] 8.1 Sidebar: List user projects → click load cards.
- [ ] 8.2 shadcn Sonner for all toasts/errors.
- [ ] 8.3 Zod validate all Server Actions/JSON from OpenAI.
- [ ] 8.4 Responsive: Mobile cards stack, desktop 3-col grid.
- [ ] 8.5 Loading: shadcn Skeleton on cards/gen.
