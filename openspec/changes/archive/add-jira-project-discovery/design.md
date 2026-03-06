# Design: Jira Project Discovery and One-Click Sync

## Context

### Background
ClearSprint AI currently requires users to navigate through a multi-step modal to discover and import Jira projects. This creates friction and hides available projects from view. The new design surfaces all Jira projects immediately and enables one-click sync, dramatically improving discoverability and reducing time to value.

### Constraints
- Must work with existing Jira API integration (`lib/jira.ts`)
- Must maintain feature-driven architecture (vertical slices)
- Cannot modify existing database schema (use existing `projects` table)
- Must handle multiple Jira sites per user
- Must respect Jira API rate limits

### Stakeholders
- End users: Reduced friction, faster project setup
- Developers: Clear component boundaries, maintainable code
- Product: Improved onboarding metrics, higher sync conversion

## Goals / Non-Goals

### Goals
- Fetch and display all available Jira projects on Projects page load
- Enable one-click sync from discovery interface
- Allow creation of new Jira projects from ClearSprint
- Provide clear sync status indicators
- Optimize performance for users with many projects (50+)
- Maintain responsive design across all viewports

### Non-Goals
- Automatic background sync of new Jira projects (future enhancement)
- Bulk sync operations (future enhancement)
- Project template customization beyond Scrum/Kanban
- Migration of existing project import flow (will deprecate gradually)

## Decisions

### Decision 1: Aggregate Projects at Page Load
**What:** Fetch all Jira projects from all connected sites on Projects page load
**Why:** Provides immediate visibility without user interaction
**Alternatives Considered:**
- Lazy load on tab switch: Adds delay, worse UX
- Load on demand per site: Too many loading states, confusing
**Trade-offs:** Initial page load slower, but overall experience faster

### Decision 2: Server-Side Discovery with Client-Side Caching
**What:** Fetch projects via server action, cache results for 5 minutes
**Why:** Reduces API calls, respects rate limits, faster subsequent loads
**Implementation:**
```typescript
// Server action caches results
export async function getAllAvailableJiraProjects() {
  // Check cache first (5 min TTL)
  // If expired, fetch from Jira API
  // Aggregate from all sites
  // Cross-reference with DB for sync status
  return projects;
}
```

### Decision 3: Derive Sync Status Rather Than Store
**What:** Determine if project is synced by checking `projects.jiraProjectKey`
**Why:** No schema changes, single source of truth, simpler logic
**Implementation:**
```typescript
// In discovery action
const localProjects = await db.select().from(projects);
const syncedKeys = new Set(localProjects.map(p => p.jiraProjectKey));

jiraProjects.forEach(jp => {
  jp.syncStatus = syncedKeys.has(jp.key) ? 'synced' : 'available';
});
```

### Decision 4: Wrapper Action for Quick Sync
**What:** Create `quickSyncJiraProject()` wrapping existing `createProjectFromJira()`
**Why:** Reuses existing logic, simpler interface for one-click use case
**Implementation:**
```typescript
export async function quickSyncJiraProject(input: QuickSyncInput) {
  return createProjectFromJira(
    input.cloudId,
    input.projectKey,
    input.projectName
  );
}
```

### Decision 5: Feature-Driven Component Organization
**What:** Place discovery components in `features/jira/components/`
**Why:** Discovery is Jira-specific functionality, follows vertical slice pattern
**Structure:**
```
features/jira/
├── actions/
│   ├── jira-discovery.server.ts
│   └── create-jira-project.server.ts
└── components/
    ├── jira-projects-discovery.tsx
    ├── jira-project-card.tsx
    ├── quick-sync-button.tsx
    └── create-jira-project-dialog.tsx
```

### Decision 6: Optimistic UI Updates
**What:** Immediately update UI before server action completes
**Why:** Perceived performance, better UX, instant feedback
**Implementation:**
```typescript
// In QuickSyncButton
const handleSync = async () => {
  setIsLoading(true); // Optimistic
  
  const result = await quickSyncJiraProject(data);
  
  if (result.success) {
    router.refresh(); // Refresh server components
    router.push(`/projects/${result.projectId}`);
  } else {
    setIsLoading(false); // Revert on error
    toast.error(result.error);
  }
};
```

### Decision 7: Pagination for Large Project Lists
**What:** Load 20 projects initially, lazy load more on demand
**Why:** Performance optimization for users with 50+ projects
**Implementation:**
```typescript
// In discovery component
const [displayCount, setDisplayCount] = useState(20);
const visibleProjects = allProjects.slice(0, displayCount);

// Load more button
<Button onClick={() => setDisplayCount(prev => prev + 20)}>
  Load More
</Button>
```

## Technical Architecture

### Data Flow
```
User loads Projects page
    ↓
Server Component: app/dashboard/projects-list/page.tsx
    ↓
Server Action: getAllAvailableJiraProjects()
    ↓
[Parallel] getJiraSites() → getJiraProjectsList(site1)
                          → getJiraProjectsList(site2)
                          → ...
    ↓
Aggregate results
    ↓
Query DB for local projects (sync status check)
    ↓
Return enriched project list
    ↓
Client Component: JiraProjectsDiscovery
    ↓
Render cards with sync buttons
```

### Component Hierarchy
```
ProjectsListPage (Server Component)
├── ProjectList (Server Component - existing)
│   └── ProjectCard (Client Component - existing)
└── Suspense
    └── JiraProjectsDiscovery (Client Component)
        ├── SearchBar (Client Component)
        ├── Filters (Client Component)
        └── JiraProjectCard (Client Component)
            ├── ProjectSyncStatusBadge (Client Component)
            └── QuickSyncButton (Client Component)
```

### Type Definitions
```typescript
// types/jira.ts
export interface JiraProjectDiscovery {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead?: {
    displayName: string;
    avatarUrls: { '48x48': string };
  };
  projectTypeKey: string;
  cloudId: string;
  siteName: string;
  siteUrl: string;
  syncStatus: 'synced' | 'available' | 'syncing' | 'error';
  localProjectId?: number;
  lastSyncedAt?: Date;
}

export interface QuickSyncInput {
  cloudId: string;
  projectKey: string;
  projectName: string;
}

export interface CreateJiraProjectInput {
  name: string;
  key: string;
  description?: string;
  cloudId: string;
  projectTypeKey: 'software' | 'business';
  projectTemplateKey?: string;
}
```

## API Integration

### Jira REST API Calls

**List Projects:**
```typescript
GET /rest/api/3/project/search
Query: maxResults=100&startAt=0

Response: {
  values: [
    {
      id: "10000",
      key: "PROJ",
      name: "Project Name",
      projectTypeKey: "software",
      lead: { displayName: "John Doe", ... },
      description: "..."
    }
  ],
  nextPage: "..."
}
```

**Create Project:**
```typescript
POST /rest/api/3/project

Body: {
  key: "NEWPROJ",
  name: "New Project",
  projectTypeKey: "software",
  projectTemplateKey: "com.pyxis.greenhopper.jira:gh-scrum-template",
  description: "Project description",
  leadAccountId: "user-id"
}

Response: {
  id: "10001",
  key: "NEWPROJ",
  self: "https://..."
}
```

### Error Handling Strategy

**Rate Limit (429):**
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  return {
    error: `Rate limit exceeded. Retry in ${retryAfter}s`,
    retryAfter: parseInt(retryAfter)
  };
}
```

**Network Failure:**
```typescript
try {
  const response = await fetch(url);
} catch (error) {
  return {
    error: 'Network error. Please check your connection.',
    retryable: true
  };
}
```

**Project Already Exists:**
```typescript
// Check before creation
const existing = await db
  .select()
  .from(projects)
  .where(eq(projects.jiraProjectKey, projectKey))
  .limit(1);

if (existing.length > 0) {
  return {
    error: 'Project already synced',
    projectId: existing[0].id
  };
}
```

## Performance Optimization

### Caching Strategy
```typescript
// Simple in-memory cache with TTL
const cache = new Map<string, { data: any, expiresAt: number }>();

export async function getCachedJiraProjects(userId: string) {
  const key = `jira-projects-${userId}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  
  const data = await fetchFromJira();
  cache.set(key, {
    data,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
  });
  
  return data;
}
```

### Parallel Fetching
```typescript
// Fetch from all sites in parallel
const sites = await getJiraSites();
const projectLists = await Promise.allSettled(
  sites.map(site => getJiraProjectsList(site.id))
);

// Handle partial failures
const projects = projectLists
  .filter(result => result.status === 'fulfilled')
  .flatMap(result => result.value);
```

### Pagination
```typescript
// Load first page immediately
const firstPage = projects.slice(0, 20);

// Lazy load subsequent pages
const loadMore = () => {
  setDisplayed(prev => [...prev, ...projects.slice(prev.length, prev.length + 20)]);
};
```

## Risks / Trade-offs

### Risk 1: Jira API Rate Limits
**Impact:** High - Could block discovery for users with many sites
**Mitigation:**
- Implement caching (5 min TTL)
- Batch requests when possible
- Exponential backoff on rate limit errors
- Display cached data with "refresh" button

### Risk 2: Slow Initial Page Load
**Impact:** Medium - Users with 10+ sites may see delay
**Mitigation:**
- Use Suspense boundary with loading skeleton
- Parallel fetching across sites
- Pagination for large result sets
- Cache results aggressively

### Risk 3: Stale Sync Status
**Impact:** Low - User syncs project in another tab, status not updated
**Mitigation:**
- Cache invalidation on sync action
- Manual refresh button
- Accept slight staleness (5 min max)

### Risk 4: Duplicate Project Creation
**Impact:** Medium - User clicks sync multiple times quickly
**Mitigation:**
- Disable button during sync
- Check for existing project before creating
- Use database unique constraint on `jiraProjectKey`

## Migration Plan

### Phase 1: Deploy Discovery (Week 1)
1. Deploy new components without removing old modal
2. Monitor error rates and performance
3. Gather user feedback
4. A/B test if needed

### Phase 2: Gradual Deprecation (Week 2)
1. Add banner to old modal: "Try new discovery interface"
2. Track usage metrics (old vs new)
3. Prepare deprecation notice

### Phase 3: Remove Old Flow (Week 3)
1. Remove old import modal components
2. Update documentation
3. Clean up unused code

### Rollback Plan
If critical issues found:
1. Feature flag to hide discovery section
2. Revert to old modal as primary flow
3. Fix issues in development
4. Re-deploy when stable

## Open Questions

1. **Q:** Should we auto-refresh discovery on focus/visibility change?
   **A:** No for MVP, add manual refresh button. Consider for Phase 2.

2. **Q:** How to handle projects with no sync permission?
   **A:** Show in list with disabled sync button and tooltip explaining permissions.

3. **Q:** Should we show archived Jira projects?
   **A:** No, filter out archived projects from discovery list.

4. **Q:** What if user has 100+ projects across sites?
   **A:** Implement pagination (20 per page) and search/filter. Virtual scrolling if needed.

5. **Q:** Should we cache sync status separately?
   **A:** No, derive from database on each render. Acceptable performance impact.

## Success Metrics

### Technical Metrics
- Discovery fetch time: < 3 seconds (p95)
- Sync operation time: < 5 seconds (p95)
- Page load time: < 2 seconds (p95)
- Error rate: < 2%
- Cache hit rate: > 60%

### UX Metrics
- Time to first sync: < 30 seconds (down from ~60s)
- Sync conversion rate: > 50% (up from ~30%)
- User satisfaction: > 4.5/5 stars
- Discovery visibility: 100% (vs 0% with modal)

### Monitoring
```typescript
// Track with analytics
trackEvent('jira_discovery_loaded', {
  projectCount,
  sitesCount,
  loadTime,
  cacheHit
});

trackEvent('quick_sync_clicked', {
  projectKey,
  cloudId
});

trackEvent('quick_sync_completed', {
  projectKey,
  duration,
  success
});
```
