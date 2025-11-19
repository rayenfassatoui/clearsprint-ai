# Jira API Issue Fetching - Fixed

## Problem

When fetching Jira issues, the API returned an error:
```
The requested API has been removed. Please migrate to the /rest/api/3/search/jql API.
```

## Root Cause

Jira deprecated the old `/rest/api/3/search` GET endpoint and requires using the new `/rest/api/3/search/jql` POST endpoint.

## Solution

Updated `lib/jira.ts` - `getJiraIssues()` function:

### Before (Deprecated):
```typescript
// GET request with query params
const params = new URLSearchParams({
  maxResults: maxResults.toString(),
  startAt: startAt.toString(),
  fields: 'summary,description,status,...',
  jql: jql,
});

fetch(`${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/search?${params}`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

### After (New API):
```typescript
// POST request with JSON body
const requestBody = {
  maxResults,
  startAt,
  fields: ['summary', 'description', 'status', ...],
  jql: jql,
};

fetch(`${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/search/jql`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
```

## Key Changes

1. **Endpoint**: `/search` → `/search/jql`
2. **Method**: `GET` → `POST`
3. **Parameters**: URL query params → JSON body
4. **Fields**: Comma-separated string → Array of strings
5. **Content-Type**: Added `application/json` header

## Testing

Now when you:
1. Go to `/dashboard/test`
2. Fetch Sites
3. Fetch Projects  
4. Fetch Issues

It should successfully return all issues from the selected project without the "Gone" error.

## API Reference

Following: [Jira Cloud REST API v3 - Search for issues using JQL (POST)](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-jql-post)

This is the current recommended way to search for Jira issues and supports:
- JQL queries
- Field selection
- Pagination
- Sorting
- Expansion of nested resources
