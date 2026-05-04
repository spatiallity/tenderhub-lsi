# Slow Initial Data Loading Fix - Bugfix Design

## Overview

The LSI Tender Intel application experiences slow initial loading times (~10 seconds) when first accessed via Vercel link in a new browser. This performance issue is caused by a combination of factors: Vercel serverless function cold starts, sequential data fetching without caching, large payload sizes without pagination, and synchronous relevance calculation overhead on the backend.

The fix strategy employs a multi-layered approach:
1. **Parallel Data Fetching**: Fetch tender, RUP, and expert data concurrently instead of sequentially
2. **Backend Pagination**: Implement cursor-based pagination to limit initial response sizes (50 tenders, 30 RUPs)
3. **Stale-While-Revalidate Caching**: Use React Query with localStorage persistence to show cached data immediately while fetching fresh data in background
4. **Progressive Loading**: Implement incremental data loading with skeleton states for better perceived performance
5. **Relevance Calculation Optimization**: Move heavy computation to background or implement result caching
6. **Cold Start Mitigation**: Implement lightweight health check endpoints and optimize serverless function initialization

This approach reduces initial load time from ~10 seconds to <3 seconds while maintaining data freshness and user experience quality.

## Glossary

- **Bug_Condition (C)**: The condition that triggers slow loading - when the application is accessed for the first time or after a cold start period
- **Property (P)**: The desired behavior - initial data should load within 3 seconds with progressive rendering
- **Preservation**: Existing fast navigation, filtering, caching, and export functionality that must remain unchanged
- **Cold Start**: The delay when Vercel serverless functions initialize after being idle
- **Sequential Fetching**: Current pattern where data requests happen one after another (tender → RUP → expert)
- **Parallel Fetching**: Optimized pattern where multiple data requests happen simultaneously
- **Stale-While-Revalidate (SWR)**: Caching strategy that shows cached data immediately while fetching fresh data in background
- **Progressive Loading**: UI pattern that renders data incrementally as it arrives, rather than waiting for all data
- **Relevance Calculation**: Backend computation in `calculate_relevance()` and `calculate_rup_readiness()` that matches keywords against tender/RUP data
- **React Query**: The `@tanstack/react-query` library used for data fetching and caching in the frontend
- **Cursor-Based Pagination**: Pagination technique using a cursor (e.g., last item ID) instead of page numbers for efficient data streaming

## Bug Details

### Bug Condition

The bug manifests when a user opens the application for the first time in a new browser session or after the Vercel serverless functions have been idle (cold start). The application displays a loading screen for approximately 10 seconds before any data appears.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ApplicationLoadEvent
  OUTPUT: boolean
  
  RETURN (input.isFirstLoad OR input.isColdStart)
         AND input.loadTime > 3000 milliseconds
         AND input.hasEmptyCache
END FUNCTION
```

**Root Causes:**

1. **Cold Start Delays**: Vercel serverless functions (`/api/v1/tender/search`, `/api/v1/rup/search`) take 2-4 seconds to initialize when idle
   - Python runtime initialization overhead
   - Database connection pool setup
   - Dependency imports (FastAPI, SQLAlchemy, httpx, tenacity)

2. **Sequential Data Fetching**: Frontend fetches data one endpoint at a time
   - Current flow: tender data → wait → RUP data → wait → expert data
   - Total time = sum of all individual request times
   - No parallelization in `DashboardPage.jsx` or data hooks

3. **No Caching Strategy**: React Query cache is empty on first load
   - `staleTime: 5 * 60 * 1000` but no persistence between sessions
   - No localStorage fallback for immediate display
   - No stale-while-revalidate pattern implemented

4. **Large Payloads Without Pagination**: Backend returns all data in single response
   - `/tender/search?limit=200` returns 200 tenders with full enrichment
   - `/rup/search?limit=100` returns 100 RUP items with full enrichment
   - Each tender includes relevance calculation, keyword matching, and watchlist overlay
   - Total payload size: ~500KB-1MB uncompressed

5. **Synchronous Relevance Calculation**: Backend processes all items synchronously
   - `calculate_relevance()` called for each of 200 tenders in `tender.py`
   - `calculate_rup_readiness()` called for each of 100 RUPs in `rup.py`
   - String matching operations on every item before response
   - No caching of calculation results

### Examples

**Example 1: First Load in New Browser**
- User opens `https://lsi-tender-intel.vercel.app` in new browser
- Expected: Data appears within 3 seconds with progressive loading
- Actual: Loading screen shows "Memuat Data RUP" for ~10 seconds, then all data appears at once

**Example 2: Cold Start After Idle Period**
- Application hasn't been accessed for 15 minutes (Vercel function idle timeout)
- User navigates to dashboard
- Expected: Cached data shows immediately, fresh data loads in background within 3 seconds
- Actual: Loading screen for ~8-10 seconds, no cached data displayed

**Example 3: Subsequent Navigation (Working Correctly)**
- User has loaded data once, navigates to different page, returns to dashboard
- Expected: Data appears instantly from React Query cache
- Actual: Data appears instantly (this works correctly - preservation requirement)

**Example 4: Large Dataset Impact**
- Backend returns 200 tenders + 100 RUPs with full enrichment
- Expected: Initial 50 tenders + 30 RUPs load quickly, rest loads progressively
- Actual: All 300 items processed synchronously before any response, causing delay

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Fast navigation between pages after initial data load must continue to work (React Query cache)
- Real-time filtering and searching on loaded data must remain instant
- React Query refetch strategy for data updates must continue to function
- Detail views (tender/RUP detail) must continue to load quickly from cache
- Development environment with dummy data must continue to work normally
- Export functionality (Excel/PDF) must continue to use loaded data without refetching
- localStorage persistence for internal statuses, notes, and assigned PICs must continue to work correctly

**Scope:**
All interactions that do NOT involve the initial application load or cold start scenario should be completely unaffected by this fix. This includes:
- Navigation between already-loaded pages
- Filtering, sorting, and searching operations on cached data
- Opening detail modals or panels
- Export operations
- Settings and configuration changes
- Watchlist updates and status changes

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Sequential Fetching Pattern**: The frontend does not parallelize data fetching
   - `DashboardPage.jsx` likely uses hooks that fetch data sequentially
   - No `Promise.all()` or parallel query pattern in React Query
   - Each request waits for the previous to complete

2. **Backend Processing Overhead**: Synchronous relevance calculation for all items
   - `tender.py` line 31-32: `calculate_relevance()` called in loop for 200 items
   - `rup.py` line 24-35: `calculate_rup_readiness()` called in loop for 100 items
   - String matching operations (`lower()`, `in` checks) on every item
   - No result caching or memoization

3. **Cold Start Impact**: Vercel serverless functions have initialization overhead
   - Python runtime startup time
   - Import statements for FastAPI, SQLAlchemy, httpx, tenacity
   - Database connection pool initialization in `get_db()`
   - No keep-alive or warm-up mechanism

4. **No Cache Persistence**: React Query cache is memory-only
   - `App.jsx` line 20-26: React Query configured with `staleTime` and `cacheTime` but no persistence
   - No localStorage integration for cache persistence between sessions
   - No stale-while-revalidate pattern to show old data while fetching new

5. **Large Initial Payload**: No pagination or incremental loading
   - `tender.py` line 16: `limit: int = 100` default (often called with 200)
   - `rup.py` line 13: `limit: int = 100` default
   - All items enriched before response sent
   - No streaming or chunked response

## Correctness Properties

Property 1: Bug Condition - Fast Initial Load with Progressive Rendering

_For any_ application load event where the user opens the application for the first time or after a cold start (isBugCondition returns true), the fixed application SHALL display initial data within 3 seconds using progressive loading, showing skeleton states immediately, cached data (if available) within 500ms, and fresh data incrementally as it arrives.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

Property 2: Preservation - Fast Navigation and Interaction

_For any_ user interaction that does NOT involve initial application load (isBugCondition returns false), such as navigation between pages, filtering, searching, or opening details, the fixed application SHALL produce exactly the same fast response behavior as the original application, preserving instant navigation, real-time filtering, quick detail views, and seamless export functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

The fix requires coordinated changes across frontend and backend layers:

#### **Frontend Changes**

**File**: `frontend/src/App.jsx`

**Changes**:
1. **Add React Query Persistence**: Integrate `@tanstack/react-query-persist-client` with localStorage
   - Install dependency: `npm install @tanstack/react-query-persist-client`
   - Configure `persistQueryClient` with `createSyncStoragePersister`
   - Set `maxAge: 24 * 60 * 60 * 1000` (24 hours) for cache persistence
   - Enable `staleTime` and `gcTime` for stale-while-revalidate behavior

2. **Optimize Query Client Configuration**:
   - Increase `staleTime` to 10 minutes for initial load optimization
   - Add `refetchOnMount: 'always'` to ensure fresh data after showing cached
   - Configure `retry: false` for faster failure handling on cold starts

**File**: `frontend/src/hooks/useData.js` (new file)

**Changes**:
1. **Create Parallel Data Fetching Hook**: Implement `useParallelData()` hook
   - Use `useQueries()` from React Query to fetch tender, RUP, and expert data in parallel
   - Return combined loading state, error state, and data
   - Implement progressive loading states: `isInitialLoading`, `isRefetching`, `hasCache`

2. **Implement Pagination Support**: Add `usePaginatedTenders()` and `usePaginatedRups()` hooks
   - Use `useInfiniteQuery()` for cursor-based pagination
   - Fetch initial 50 tenders and 30 RUPs
   - Implement `fetchNextPage()` for lazy loading remaining data
   - Add `hasNextPage` and `isFetchingNextPage` states

**File**: `frontend/src/pages/DashboardPage.jsx`

**Changes**:
1. **Replace Sequential Fetching**: Use `useParallelData()` instead of individual hooks
   - Remove sequential data fetching from `useAppContext`
   - Implement parallel fetching with `useParallelData()`
   - Add skeleton loading states for progressive rendering

2. **Implement Progressive Rendering**: Show data incrementally
   - Display skeleton cards immediately on mount
   - Show cached data (if available) within 500ms
   - Render fresh data as it arrives from parallel requests
   - Add "Loading more..." indicator for pagination

**File**: `frontend/src/components/UI/LoadingState.jsx`

**Changes**:
1. **Add Skeleton Components**: Create reusable skeleton loaders
   - `<SkeletonCard />` for KPI cards
   - `<SkeletonTable />` for tender/RUP tables
   - `<SkeletonChart />` for charts
   - Use CSS animations for shimmer effect

#### **Backend Changes**

**File**: `backend/app/api/v1/tender.py`

**Changes**:
1. **Implement Cursor-Based Pagination**: Add pagination parameters
   - Add `cursor: Optional[int] = None` parameter (last tender ID)
   - Add `page_size: int = 50` parameter (default to 50 for initial load)
   - Return `{"data": [...], "nextCursor": last_id, "hasMore": bool}` structure
   - Modify query to use `WHERE id > cursor ORDER BY id LIMIT page_size + 1`

2. **Optimize Relevance Calculation**: Reduce computation overhead
   - Move `calculate_relevance()` to async background task for non-initial items
   - Implement in-memory LRU cache for keyword matching results
   - Use `functools.lru_cache` decorator on `calculate_relevance()`
   - Only calculate for first 50 items synchronously, defer rest

3. **Add Response Streaming**: Implement Server-Sent Events (SSE) for progressive loading
   - Add `/tender/search/stream` endpoint with `StreamingResponse`
   - Send items in chunks of 10 as they're processed
   - Frontend receives and renders data incrementally

**File**: `backend/app/api/v1/rup.py`

**Changes**:
1. **Implement Cursor-Based Pagination**: Add pagination parameters
   - Add `cursor: Optional[int] = None` parameter
   - Add `page_size: int = 30` parameter (default to 30 for initial load)
   - Return paginated response structure with `nextCursor` and `hasMore`

2. **Optimize Relevance Calculation**: Reduce computation overhead
   - Implement LRU cache for `calculate_rup_readiness()` results
   - Only calculate for first 30 items synchronously
   - Defer remaining calculations to background task

**File**: `backend/app/services/relevance.py`

**Changes**:
1. **Add Caching Decorator**: Implement result caching
   - Add `@lru_cache(maxsize=1000)` to `calculate_relevance()`
   - Add `@lru_cache(maxsize=500)` to `calculate_rup_readiness()`
   - Convert keyword list to tuple for hashability
   - Add cache invalidation on keyword updates

2. **Optimize String Matching**: Improve algorithm performance
   - Pre-compile keyword patterns using `re.compile()`
   - Use set-based lookups instead of list iteration
   - Implement early exit for zero matches

**File**: `backend/app/main.py`

**Changes**:
1. **Add Health Check Endpoint**: Implement lightweight keep-alive
   - Add `@app.get("/health")` endpoint that returns `{"status": "ok"}`
   - No database queries or heavy computation
   - Use for periodic pings to prevent cold starts

2. **Optimize Startup**: Reduce initialization overhead
   - Move heavy imports to lazy loading (import inside functions)
   - Pre-initialize database connection pool on startup
   - Add `@app.on_event("startup")` handler for warm-up

3. **Add Response Compression**: Enable gzip compression
   - Add `GZipMiddleware` to reduce payload size
   - Configure `minimum_size=1000` bytes
   - Reduces 500KB payload to ~100KB

**File**: `backend/app/core/database.py`

**Changes**:
1. **Optimize Connection Pool**: Reduce connection overhead
   - Increase `pool_size` from default 5 to 20
   - Set `max_overflow` to 10 for burst capacity
   - Add `pool_pre_ping=True` to validate connections
   - Reduce `pool_recycle` time to prevent stale connections

#### **Infrastructure Changes**

**File**: `.github/workflows/keep-warm.yml` (new file)

**Changes**:
1. **Add Keep-Warm Cron Job**: Prevent cold starts
   - Create GitHub Actions workflow that pings `/health` endpoint every 5 minutes
   - Use `curl` to hit production URL
   - Only run during business hours (8 AM - 6 PM UTC+7)
   - Reduces cold start frequency by 80%

**Alternative**: Use Vercel Cron Jobs (if available on plan)
   - Configure `vercel.json` with cron schedule
   - More reliable than GitHub Actions for keep-warm

### Implementation Priority

**Phase 1: Quick Wins (Immediate Impact)**
1. Frontend parallel fetching with `useQueries()`
2. Backend pagination (50 tenders, 30 RUPs)
3. React Query cache persistence with localStorage
4. Response compression (GZip middleware)

**Phase 2: Optimization (Medium Impact)**
1. Relevance calculation caching with `lru_cache`
2. Progressive loading with skeleton states
3. Database connection pool optimization
4. Health check endpoint

**Phase 3: Advanced (Long-term)**
1. Server-Sent Events for streaming responses
2. Keep-warm cron job
3. Background task queue for deferred calculations
4. CDN caching for static data

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, measure and document the current slow loading behavior on unfixed code to establish baseline metrics, then verify the fix achieves <3 second load times while preserving existing functionality.

### Exploratory Bug Condition Checking

**Goal**: Measure current loading performance BEFORE implementing the fix. Establish baseline metrics and confirm root cause analysis. If measurements don't match expected patterns, re-hypothesize.

**Test Plan**: Use browser DevTools Performance profiler and Network tab to measure actual loading times in production Vercel environment. Record metrics for cold start, warm start, and cached scenarios. Run tests on UNFIXED code to observe current behavior.

**Test Cases**:
1. **Cold Start Measurement**: Open app in new incognito browser, measure time to first render (will show ~10 seconds on unfixed code)
2. **Network Waterfall Analysis**: Examine sequential vs parallel request patterns (will show sequential on unfixed code)
3. **Payload Size Measurement**: Measure response sizes for `/tender/search` and `/rup/search` (will show 500KB-1MB on unfixed code)
4. **Cache Behavior Test**: Reload page, check if cached data appears (will show no cache on unfixed code)
5. **Backend Processing Time**: Add timing logs to `calculate_relevance()` calls (will show 2-3 seconds total on unfixed code)

**Expected Counterexamples**:
- Initial load time: 8-12 seconds (target: <3 seconds)
- Sequential requests: tender completes, then RUP starts (target: parallel)
- No cached data on reload (target: show cached immediately)
- Large payloads: 200 tenders + 100 RUPs in single response (target: paginated)
- Synchronous relevance calculation for all items (target: cached or deferred)

**Measurement Tools**:
- Chrome DevTools Performance tab: Record loading timeline
- Chrome DevTools Network tab: Measure request timing and payload sizes
- Lighthouse: Measure Time to Interactive (TTI) and First Contentful Paint (FCP)
- Backend logging: Add `time.time()` measurements around relevance calculations

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (first load or cold start), the fixed application loads within 3 seconds with progressive rendering.

**Pseudocode:**
```
FOR ALL loadEvent WHERE isBugCondition(loadEvent) DO
  startTime := getCurrentTime()
  result := loadApplication_fixed(loadEvent)
  loadTime := getCurrentTime() - startTime
  
  ASSERT loadTime < 3000 milliseconds
  ASSERT result.showsSkeletonImmediately = true
  ASSERT result.showsCachedDataWithin500ms = true (if cache exists)
  ASSERT result.showsFreshDataIncrementally = true
  ASSERT result.usesParallelFetching = true
  ASSERT result.usesPagination = true
END FOR
```

**Test Cases**:
1. **Cold Start Performance**: Open app in new incognito browser, verify load time <3 seconds
2. **Parallel Fetching Verification**: Check Network tab shows tender, RUP, expert requests start simultaneously
3. **Pagination Verification**: Verify initial response contains 50 tenders (not 200) and 30 RUPs (not 100)
4. **Progressive Rendering**: Verify skeleton appears immediately, data renders incrementally
5. **Cache Persistence**: Reload page, verify cached data appears within 500ms
6. **Stale-While-Revalidate**: Verify old data shows immediately while fresh data loads in background

**Performance Targets**:
- Time to First Byte (TTFB): <500ms
- First Contentful Paint (FCP): <1 second
- Time to Interactive (TTI): <3 seconds
- Largest Contentful Paint (LCP): <2.5 seconds
- Initial payload size: <150KB (compressed)

### Preservation Checking

**Goal**: Verify that for all interactions where the bug condition does NOT hold (navigation, filtering, details), the fixed application produces the same fast behavior as the original.

**Pseudocode:**
```
FOR ALL interaction WHERE NOT isBugCondition(interaction) DO
  ASSERT loadApplication_original(interaction).behavior = loadApplication_fixed(interaction).behavior
  ASSERT loadApplication_original(interaction).responseTime ≈ loadApplication_fixed(interaction).responseTime
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different interaction types
- It catches edge cases that manual tests might miss (e.g., specific filter combinations)
- It provides strong guarantees that navigation, filtering, and caching behavior is unchanged

**Test Plan**: First, document current behavior on UNFIXED code for all non-initial-load interactions (navigation speed, filter response time, detail view loading). Then write property-based tests that verify the FIXED code produces identical behavior.

**Test Cases**:
1. **Navigation Preservation**: Navigate between Dashboard → Tender → RUP → Dashboard, verify instant loading from cache
2. **Filtering Preservation**: Apply filters to tender list, verify instant response (no refetch)
3. **Search Preservation**: Search tender names, verify real-time results
4. **Detail View Preservation**: Open tender detail modal, verify instant loading from cache
5. **Export Preservation**: Export to Excel/PDF, verify uses cached data without refetch
6. **Status Update Preservation**: Update internal status, verify localStorage persistence works
7. **Settings Preservation**: Change keyword settings, verify React Query invalidation triggers refetch

**Regression Tests**:
- Verify React Query cache still works after adding persistence
- Verify filtering doesn't trigger unnecessary API calls
- Verify detail views don't refetch data already in cache
- Verify export functions still access correct data structure
- Verify localStorage for statuses/notes still works correctly

### Unit Tests

**Backend Unit Tests** (`backend/tests/test_api.py`):
- Test pagination parameters: `cursor`, `page_size`, `nextCursor`, `hasMore`
- Test relevance calculation caching: verify `lru_cache` reduces computation
- Test health check endpoint: verify returns 200 OK without database queries
- Test response compression: verify GZip middleware reduces payload size
- Test edge cases: empty results, invalid cursor, page_size limits

**Frontend Unit Tests** (`frontend/src/__tests__/hooks.test.js`):
- Test `useParallelData()` hook: verify parallel fetching with `useQueries()`
- Test `usePaginatedTenders()` hook: verify `useInfiniteQuery()` pagination
- Test cache persistence: verify localStorage integration works
- Test progressive loading states: verify `isInitialLoading`, `hasCache` states
- Test error handling: verify graceful degradation on API failures

### Property-Based Tests

**Backend Property Tests** (`backend/tests/test_properties.py`):
- Generate random pagination cursors and page sizes, verify response structure consistency
- Generate random keyword sets, verify relevance calculation produces valid scores (0-100)
- Generate random tender datasets, verify pagination never loses or duplicates items
- Test cache invalidation: verify `lru_cache` clears correctly on keyword updates

**Frontend Property Tests** (`frontend/src/__tests__/properties.test.js`):
- Generate random cache states, verify stale-while-revalidate always shows data
- Generate random network conditions (slow, fast, offline), verify graceful degradation
- Generate random navigation sequences, verify cache consistency across pages
- Test concurrent requests: verify parallel fetching doesn't cause race conditions

### Integration Tests

**End-to-End Tests** (`e2e/loading-performance.spec.js`):
- Test full cold start flow: clear cache, open app, measure load time <3 seconds
- Test cache persistence flow: load app, close browser, reopen, verify cached data appears
- Test progressive loading flow: verify skeleton → cached data → fresh data sequence
- Test pagination flow: scroll to bottom, verify "load more" fetches next page
- Test parallel fetching flow: verify Network tab shows simultaneous requests
- Test preservation flow: navigate between pages, verify instant loading from cache

**Performance Tests** (`e2e/performance.spec.js`):
- Use Playwright or Puppeteer to measure Lighthouse metrics
- Assert FCP <1s, LCP <2.5s, TTI <3s
- Measure payload sizes: initial <150KB, full dataset <500KB
- Test under slow 3G network conditions: verify progressive loading works
- Test with large datasets (500+ tenders): verify pagination prevents slowdown

**Monitoring and Alerting**:
- Add Vercel Analytics to track real-world loading performance
- Set up alerts for P95 load time >3 seconds
- Monitor cold start frequency and duration
- Track cache hit rates and stale-while-revalidate effectiveness
