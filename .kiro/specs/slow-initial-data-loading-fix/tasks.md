# Implementation Plan

## Overview

This implementation plan follows the exploratory bugfix workflow using the bug condition methodology. The tasks are ordered to ensure we understand the bug through exploration tests BEFORE implementing the fix, then verify the fix works and preserves existing behavior.

**Key Principles:**
- Write exploration tests BEFORE fixing (to understand the bug)
- Write preservation tests BEFORE fixing (to document baseline behavior)
- Implement fix with understanding from exploration
- Verify fix resolves bug and preserves existing functionality

---

## Phase 1: Exploration - Understand the Bug

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Initial Load Performance Under Cold Start
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate slow loading exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - first load in new browser or after cold start
  - Test implementation details from Bug Condition in design:
    - Measure load time for first application load (isFirstLoad = true)
    - Measure load time after cold start (isColdStart = true)
    - Verify hasEmptyCache = true for these scenarios
  - The test assertions should match the Expected Behavior Properties from design:
    - Assert loadTime < 3000 milliseconds (currently fails with ~10000ms)
    - Assert showsSkeletonImmediately = true
    - Assert showsCachedDataWithin500ms = true (if cache exists)
    - Assert showsFreshDataIncrementally = true
    - Assert usesParallelFetching = true
    - Assert usesPagination = true
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - Actual load time: ~10 seconds (expected: <3 seconds)
    - Sequential fetching observed (expected: parallel)
    - No skeleton states (expected: immediate skeleton)
    - No cached data on reload (expected: cached data within 500ms)
    - Large payloads without pagination (expected: paginated responses)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

---

## Phase 2: Preservation - Document Baseline Behavior

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Fast Navigation and Interaction After Initial Load
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (when data is already loaded):
    - Navigate between Dashboard → Tender → RUP → Dashboard
    - Measure navigation time (should be instant from React Query cache)
    - Apply filters to tender list
    - Measure filter response time (should be instant, no refetch)
    - Open tender detail modal
    - Measure detail view load time (should be instant from cache)
    - Export to Excel/PDF
    - Verify uses cached data without refetch
    - Update internal status
    - Verify localStorage persistence works
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all navigation events where data is cached, response time < 100ms
    - For all filter operations, no API refetch occurs
    - For all detail views, data loads from cache instantly
    - For all export operations, cached data is used
    - For all localStorage operations, data persists correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

---

## Phase 3: Implementation - Apply the Fix

### 3.1 Backend API Optimization

- [ ] 3.1 Implement backend performance optimizations

  - [ ] 3.1.1 Add pagination to tender endpoint
    - Modify `backend/app/api/v1/tender.py`
    - Add `cursor: Optional[int] = None` parameter (last tender ID)
    - Add `page_size: int = 50` parameter (default to 50 for initial load)
    - Modify query to use `WHERE id > cursor ORDER BY id LIMIT page_size + 1`
    - Return `{"data": [...], "nextCursor": last_id, "hasMore": bool}` structure
    - Test with various cursor values and page sizes
    - _Bug_Condition: isBugCondition(input) where input.isFirstLoad OR input.isColdStart_
    - _Expected_Behavior: Initial response contains 50 tenders (not 200), loads within 3 seconds_
    - _Preservation: Existing filtering, sorting, and detail views continue to work_
    - _Requirements: 2.4_

  - [ ] 3.1.2 Add pagination to RUP endpoint
    - Modify `backend/app/api/v1/rup.py`
    - Add `cursor: Optional[int] = None` parameter
    - Add `page_size: int = 30` parameter (default to 30 for initial load)
    - Return paginated response structure with `nextCursor` and `hasMore`
    - Test with various cursor values and page sizes
    - _Bug_Condition: isBugCondition(input) where input.isFirstLoad OR input.isColdStart_
    - _Expected_Behavior: Initial response contains 30 RUPs (not 100), loads within 3 seconds_
    - _Preservation: Existing RUP filtering and detail views continue to work_
    - _Requirements: 2.5_

  - [ ] 3.1.3 Optimize relevance calculation with caching
    - Modify `backend/app/services/relevance.py`
    - Add `@lru_cache(maxsize=1000)` to `calculate_relevance()` function
    - Add `@lru_cache(maxsize=500)` to `calculate_rup_readiness()` function
    - Convert keyword list to tuple for hashability
    - Add cache invalidation logic on keyword updates
    - Pre-compile keyword patterns using `re.compile()` for faster matching
    - Use set-based lookups instead of list iteration
    - Implement early exit for zero matches
    - Test cache hit rates and performance improvement
    - _Bug_Condition: isBugCondition(input) where backend processing time > 2 seconds_
    - _Expected_Behavior: Relevance calculation completes in <500ms with caching_
    - _Preservation: Relevance scores remain accurate and consistent_
    - _Requirements: 2.8_

  - [ ] 3.1.4 Add health check endpoint for cold start mitigation
    - Modify `backend/app/main.py`
    - Add `@app.get("/health")` endpoint that returns `{"status": "ok"}`
    - Ensure no database queries or heavy computation
    - Add `@app.on_event("startup")` handler for database connection pool warm-up
    - Move heavy imports to lazy loading (import inside functions where possible)
    - Test endpoint response time (<50ms)
    - _Bug_Condition: isBugCondition(input) where input.isColdStart = true_
    - _Expected_Behavior: Cold start impact reduced by keep-alive mechanism_
    - _Preservation: Existing endpoints continue to function normally_
    - _Requirements: 2.2_

  - [ ] 3.1.5 Enable response compression
    - Modify `backend/app/main.py`
    - Add `GZipMiddleware` from FastAPI
    - Configure `minimum_size=1000` bytes
    - Test payload size reduction (target: 500KB → ~100KB)
    - Verify compression doesn't impact response time significantly
    - _Bug_Condition: isBugCondition(input) where payload size > 500KB_
    - _Expected_Behavior: Compressed payloads reduce network transfer time_
    - _Preservation: Response data structure remains unchanged_
    - _Requirements: 2.1, 2.7_

  - [ ] 3.1.6 Optimize database connection pool
    - Modify `backend/app/core/database.py`
    - Increase `pool_size` from default 5 to 20
    - Set `max_overflow` to 10 for burst capacity
    - Add `pool_pre_ping=True` to validate connections
    - Reduce `pool_recycle` time to prevent stale connections
    - Test connection pool behavior under load
    - _Bug_Condition: isBugCondition(input) where database connection setup is slow_
    - _Expected_Behavior: Database queries execute faster with optimized pool_
    - _Preservation: Existing database operations continue to work correctly_
    - _Requirements: 2.2_

### 3.2 Frontend Parallel Fetching and Caching

- [ ] 3.2 Implement frontend performance optimizations

  - [ ] 3.2.1 Add React Query cache persistence
    - Install dependency: `npm install @tanstack/react-query-persist-client`
    - Modify `frontend/src/App.jsx`
    - Import `persistQueryClient` and `createSyncStoragePersister`
    - Configure persister with localStorage
    - Set `maxAge: 24 * 60 * 60 * 1000` (24 hours) for cache persistence
    - Update QueryClient configuration:
      - Increase `staleTime` to 10 minutes
      - Add `refetchOnMount: 'always'` for fresh data after showing cached
      - Configure `retry: false` for faster failure handling
    - Test cache persistence across browser sessions
    - _Bug_Condition: isBugCondition(input) where input.hasEmptyCache = true_
    - _Expected_Behavior: Cached data appears within 500ms on reload_
    - _Preservation: Existing React Query refetch strategy continues to work_
    - _Requirements: 2.6_

  - [ ] 3.2.2 Create parallel data fetching hook
    - Create new file `frontend/src/hooks/useData.js`
    - Implement `useParallelData()` hook using `useQueries()` from React Query
    - Fetch tender, RUP, and expert data in parallel (not sequential)
    - Return combined loading state: `isInitialLoading`, `isRefetching`, `hasCache`
    - Return combined error state and data
    - Handle partial success scenarios (some queries succeed, others fail)
    - Test parallel fetching behavior with Network tab
    - _Bug_Condition: isBugCondition(input) where sequential fetching causes delay_
    - _Expected_Behavior: All data requests start simultaneously, reducing total load time_
    - _Preservation: Data structure and error handling remain consistent_
    - _Requirements: 2.3_

  - [ ] 3.2.3 Create paginated data hooks
    - In `frontend/src/hooks/useData.js`
    - Implement `usePaginatedTenders()` hook using `useInfiniteQuery()`
    - Implement `usePaginatedRups()` hook using `useInfiniteQuery()`
    - Configure initial page size: 50 tenders, 30 RUPs
    - Implement `fetchNextPage()` for lazy loading remaining data
    - Add `hasNextPage` and `isFetchingNextPage` states
    - Handle cursor-based pagination from backend
    - Test pagination behavior with scroll or "Load More" button
    - _Bug_Condition: isBugCondition(input) where large payloads cause slow initial load_
    - _Expected_Behavior: Initial data loads quickly, remaining data loads on demand_
    - _Preservation: All data eventually loads, filtering works on loaded data_
    - _Requirements: 2.4, 2.5, 2.7_

  - [ ] 3.2.4 Update DashboardPage to use parallel fetching
    - Modify `frontend/src/pages/DashboardPage.jsx`
    - Replace sequential data fetching with `useParallelData()` hook
    - Remove individual `useTenders()`, `useRups()`, `useExperts()` calls if sequential
    - Implement progressive rendering:
      - Show skeleton states immediately on mount
      - Show cached data (if available) within 500ms
      - Render fresh data as it arrives from parallel requests
    - Add "Loading more..." indicator for pagination
    - Test loading sequence: skeleton → cached → fresh
    - _Bug_Condition: isBugCondition(input) where sequential fetching and no progressive loading_
    - _Expected_Behavior: Data appears incrementally, improving perceived performance_
    - _Preservation: Final rendered state matches original application_
    - _Requirements: 2.1, 2.3, 2.7_

  - [ ] 3.2.5 Create skeleton loading components
    - Modify `frontend/src/components/UI/LoadingState.jsx`
    - Create `<SkeletonCard />` component for KPI cards
    - Create `<SkeletonTable />` component for tender/RUP tables
    - Create `<SkeletonChart />` component for charts
    - Add CSS animations for shimmer effect
    - Ensure skeleton components match actual component dimensions
    - Test skeleton appearance and transitions
    - _Bug_Condition: isBugCondition(input) where no immediate visual feedback_
    - _Expected_Behavior: Skeleton states appear immediately, improving perceived performance_
    - _Preservation: Loading states for other scenarios continue to work_
    - _Requirements: 2.1, 2.7_

### 3.3 Infrastructure and Monitoring

- [ ] 3.3 Set up infrastructure improvements

  - [ ] 3.3.1 Create keep-warm cron job (optional, if cold starts persist)
    - Create `.github/workflows/keep-warm.yml`
    - Configure GitHub Actions workflow to ping `/health` endpoint every 5 minutes
    - Use `curl` to hit production Vercel URL
    - Schedule only during business hours (8 AM - 6 PM UTC+7)
    - Add error handling and notifications
    - Test cron job execution
    - Alternative: Configure Vercel Cron Jobs in `vercel.json` if available
    - _Bug_Condition: isBugCondition(input) where input.isColdStart = true_
    - _Expected_Behavior: Cold start frequency reduced by 80%_
    - _Preservation: No impact on application functionality_
    - _Requirements: 2.2_

  - [ ] 3.3.2 Add performance monitoring
    - Set up Vercel Analytics or similar monitoring tool
    - Track metrics: FCP, LCP, TTI, TTFB
    - Set up alerts for P95 load time >3 seconds
    - Monitor cold start frequency and duration
    - Track cache hit rates and stale-while-revalidate effectiveness
    - Create dashboard for performance metrics
    - _Bug_Condition: isBugCondition(input) for ongoing monitoring_
    - _Expected_Behavior: Real-world performance data informs future optimizations_
    - _Preservation: Monitoring is passive, no impact on functionality_
    - _Requirements: 2.1_

### 3.4 Verification - Confirm Fix Works

- [ ] 3.4 Verify bug condition exploration test now passes

  - [ ] 3.4.1 Re-run exploration test from Phase 1
    - **Property 1: Expected Behavior** - Initial Load Performance Under Cold Start
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify all assertions pass:
      - loadTime < 3000 milliseconds ✓
      - showsSkeletonImmediately = true ✓
      - showsCachedDataWithin500ms = true ✓
      - showsFreshDataIncrementally = true ✓
      - usesParallelFetching = true ✓
      - usesPagination = true ✓
    - Document performance improvements:
      - Load time reduced from ~10s to <3s
      - Parallel fetching implemented
      - Pagination reduces initial payload
      - Progressive loading improves perceived performance
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 3.5 Verify preservation tests still pass

  - [ ] 3.5.1 Re-run preservation tests from Phase 2
    - **Property 2: Preservation** - Fast Navigation and Interaction After Initial Load
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation requirements:
      - Navigation between pages remains instant ✓
      - Filtering and searching remain real-time ✓
      - Detail views load instantly from cache ✓
      - Export functionality uses cached data ✓
      - localStorage persistence works correctly ✓
      - React Query refetch strategy unchanged ✓
    - Confirm all tests still pass after fix (no regressions)
    - Document any edge cases discovered
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

---

## Phase 4: Final Validation

- [ ] 4. Checkpoint - Ensure all tests pass and performance targets met
  - Run full test suite (unit, integration, property-based, e2e)
  - Verify all tests pass without failures
  - Measure performance metrics in production:
    - Time to First Byte (TTFB): <500ms ✓
    - First Contentful Paint (FCP): <1 second ✓
    - Time to Interactive (TTI): <3 seconds ✓
    - Largest Contentful Paint (LCP): <2.5 seconds ✓
    - Initial payload size: <150KB compressed ✓
  - Test in multiple scenarios:
    - Cold start in new incognito browser
    - Warm start with cached data
    - Slow 3G network conditions
    - Large dataset (500+ tenders)
  - Verify no regressions in existing functionality
  - Document any remaining issues or edge cases
  - Ask the user if questions arise or if additional optimizations are needed

---

## Notes

**Testing Tools:**
- Chrome DevTools Performance tab for timeline recording
- Chrome DevTools Network tab for request timing and payload analysis
- Lighthouse for FCP, LCP, TTI measurements
- Playwright or Puppeteer for e2e performance tests
- Backend logging with `time.time()` for relevance calculation timing

**Performance Targets:**
- Initial load time: <3 seconds (from ~10 seconds)
- Time to First Byte: <500ms
- First Contentful Paint: <1 second
- Time to Interactive: <3 seconds
- Initial payload size: <150KB compressed (from ~500KB)

**Key Files Modified:**
- Backend: `tender.py`, `rup.py`, `relevance.py`, `main.py`, `database.py`
- Frontend: `App.jsx`, `DashboardPage.jsx`, `LoadingState.jsx`, new `hooks/useData.js`
- Infrastructure: `.github/workflows/keep-warm.yml` (optional)

**Dependencies Added:**
- Frontend: `@tanstack/react-query-persist-client`

**Implementation Priority:**
1. Phase 1 & 2: Exploration and preservation tests (understand the bug)
2. Phase 3.1: Backend optimizations (pagination, caching, compression)
3. Phase 3.2: Frontend optimizations (parallel fetching, cache persistence, progressive loading)
4. Phase 3.3: Infrastructure improvements (keep-warm, monitoring)
5. Phase 3.4 & 3.5: Verification (confirm fix works and preserves existing behavior)
6. Phase 4: Final validation and deployment
