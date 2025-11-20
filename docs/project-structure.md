# ClearSprint AI - Project Structure

## Complete Directory Tree

```
clearsprint-ai/
│
├── 📁 actions/                    # Server Actions (use server directive)
│   ├── jira.server.ts            # Jira API operations
│   ├── upload.server.ts          # Document upload & processing
│   └── user.server.ts            # User profile operations
│
├── 📁 app/                        # Next.js App Router
│   │
│   ├── 📁 api/                    # API Routes
│   │   └── 📁 auth/
│   │       └── 📁 [...all]/
│   │           └── route.ts      # Better-auth handler
│   │
│   ├── 📁 auth/                   # Authentication Pages
│   │   ├── 📁 signin/
│   │   │   └── page.tsx         # Sign in page
│   │   └── 📁 signup/
│   │       └── page.tsx         # Sign up page
│   │
│   ├── 📁 dashboard/              # Protected Dashboard
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard overview
│   │   │
│   │   ├── 📁 projects/          # Individual Projects
│   │   │   └── 📁 [id]/
│   │   │       ├── layout.tsx   # Project layout
│   │   │       └── page.tsx     # Project details
│   │   │
│   │   ├── 📁 projects-list/     # All Projects
│   │   │   └── page.tsx         # Projects grid view
│   │   │
│   │   ├── 📁 settings/           # User Settings
│   │   │   └── page.tsx         # Settings page
│   │   │
│   │   └── 📁 test/               # Jira API Testing
│   │       └── page.tsx         # API test interface
│   │
│   ├── 📁 upload-test/            # Upload Testing
│   │   └── page.tsx              # Upload test page
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── 📁 components/                 # React Components
│   │
│   ├── 📁 ui/                     # shadcn/ui Primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── scroll-area.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ...
│   │
│   ├── 📁 examples/               # Example Components
│   │   ├── jira-integration-dashboard.tsx
│   │   └── update-jira-issue-dialog.tsx
│   │
│   ├── auth-layout.tsx           # Auth page wrapper
│   ├── connect-jira-button.tsx   # Jira OAuth button
│   ├── dropzone.tsx              # File upload zone
│   ├── new-project-modal.tsx     # Create project dialog
│   ├── project-card.tsx          # Project grid item
│   ├── project-list.tsx          # Projects grid
│   ├── push-to-jira-modal.tsx    # Jira sync dialog
│   ├── sidebar.tsx               # Main app sidebar
│   ├── skeletons.tsx             # Loading skeletons
│   ├── theme-provider.tsx        # Theme context
│   ├── theme-switcher.tsx        # Theme toggle
│   ├── theme-toggle.tsx          # Theme button
│   ├── ticket-item.tsx           # Ticket display
│   └── user-profile.tsx          # User profile widget
│
├── 📁 lib/                        # Utility Libraries
│   │
│   ├── 📁 db/                     # Database
│   │   ├── schema.ts             # Drizzle schema
│   │   └── index.ts              # DB client
│   │
│   ├── auth.ts                   # Better-auth config
│   ├── auth-client.ts            # Client-side auth
│   ├── jira.ts                   # Jira API client
│   ├── s3.ts                     # S3 storage client
│   └── utils.ts                  # Utility functions
│
├── 📁 types/                      # TypeScript Types
│   ├── index.ts                  # Central exports
│   ├── database.ts               # DB model types
│   ├── jira.ts                   # Jira API types
│   ├── pdf.ts                    # PDF parsing types
│   └── actions.ts                # Server action types
│
├── 📁 drizzle/                    # Database Migrations
│   ├── 0000_initial.sql
│   ├── 0001_add_jira.sql
│   └── ...
│
├── 📁 docs/                       # Documentation
│   ├── app-reorganization.md
│   ├── jira-api-search-fix.md
│   ├── jira-integration-changes.md
│   ├── jira-setup.md
│   └── types-migration.md
│
├── 📁 public/                     # Static Assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 hooks/                      # Custom React Hooks
│   └── use-mobile.tsx
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── AGENTS.md                     # Development guidelines
├── README.md                     # Project documentation
├── biome.json                    # Biome config
├── components.json               # shadcn/ui config
├── drizzle.config.ts             # Drizzle config
├── next.config.ts                # Next.js config
├── package.json                  # Dependencies
├── plan.md                       # Project plan
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── bun.lock                      # Lock file
```

## Key Directories Explained

### 📁 actions/
Server-side operations with `'use server'` directive. All database operations and external API calls go here.

**Rules:**
- Must end with `.server.ts`
- Must start with `'use server'`
- Group by feature/domain

### 📁 app/
Next.js App Router structure. File-based routing.

**Rules:**
- `page.tsx` = route page
- `layout.tsx` = shared layout
- `loading.tsx` = loading state
- Folders create routes

### 📁 components/
Reusable React components.

**Rules:**
- UI primitives in `ui/` folder
- Feature components at root
- Use `'use client'` for interactive components
- Server components by default

### 📁 lib/
Utility libraries and configurations.

**Rules:**
- Pure functions when possible
- No React components here
- Configuration files for external services

### 📁 types/
Centralized TypeScript type definitions.

**Rules:**
- **ALWAYS** import from `@/types`
- Group by domain (database, jira, pdf, etc.)
- Export from `index.ts`
- Never use inline types for shared data

## Import Path Rules

```typescript
// ✅ Correct
import { User } from '@/types';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

// ❌ Wrong
import { User } from '../../../types';
import { db } from '../../lib/db';
```

## File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`
- **Utilities**: `kebab-case.ts` (e.g., `auth-client.ts`)
- **Server Actions**: `feature.server.ts` (e.g., `jira.server.ts`)
- **Types**: `kebab-case.ts` (e.g., `database.ts`)

## Protected Routes

All routes under `/dashboard/*` are protected and require authentication.

## Public Routes

- `/` - Landing page
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up

## API Routes

- `/api/auth/*` - Better-auth endpoints (handled automatically)
