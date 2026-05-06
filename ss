[33m70277f61[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mclaude/sharp-jones-7d653b[m[33m, [m[1;32mclaude/loving-yonath-771273[m[33m)[m feat: wire auth flow and add real-time watchlist sync
[33mbba9f95a[m[33m ([m[1;31morigin/claude/goofy-noether-8b142a[m[33m, [m[1;32mclaude/goofy-noether-8b142a[m[33m)[m feat: wire auth flow and add real-time watchlist sync
[33mba09ffd9[m feat: auth system, user management, and security hardening
[33mb461cbf4[m fix(sync): resolve UI state reverting by fixing browser caching in fetchTenders and ensuring correct status dispatch
[33mbebc8130[m chore: sync remaining updates (package.json and main.py)
[33me88eab82[m feat: migrate watchlist data from localStorage to backend DB
[33m62951596[m chore: update TenderHub implementation and fix sync
[33m1c9afb5a[m feat: sort experts by newest, add global vs local keyword logic, add keywords to realtime sync
[33mb064d07e[m fix: restore supabase key and disable dummy data expansion
[33m2e376ff6[m style: remove document icon from sidebar
[33m3cd7d423[m fix: make application startup resilient to database connection failures
[33m29becf48[m fix: update supabase anon key for websocket auth
[33mfb3aaf61[m fix: update supabase url to match active dashboard project
[33m5ef85437[m feat: instant local state patching for realtime events
[33m68e426c6[m fix: dynamic deadline logic to prevent tenders from being stuck in past stages
[33mb8ab92d3[m chore: add diagnostic logs for realtime subscription
[33ma6af9b6b[m feat: stabilize realtime sync and resolve expert duplication issues
[33mec02f561[m fix: correct Supabase URL and add cache-buster for tender sync
[33m67210fdc[m fix: expert sorting desc, global vs local keywords, realtime keyword sync
[33mfaf83e60[m fix: resolve POST/PATCH trailing slash CORS errors on HF Spaces & fix TenderDetailPanel watchlist save state
[33mf4282bf2[m fix: resolve asyncpg DuplicatePreparedStatementError with Supabase transaction pooler by dynamically generating statement names
[33m592b49d9[m fix: resolve backend API CORS & Mixed Content errors caused by HTTP redirects on Hugging Face load balancer. Added proxy-headers to uvicorn and fixed expert trailing slash route.
[33m14a7722b[m feat: integrate Supabase Realtime for instant cross-user synchronization
[33m76690e4f[m fix: Force HTTPS API URL in production - fixes mixed content blocking that prevented all API communication
[33m04c9d865[m fix: Remove localStorage for experts, add pending-delete tracking to prevent resurrection
[33m75ff6840[m fix: API data is now source of truth - fixes cross-user sync for statuses, notes, and experts
[33m7c620455[m perf: Optimistic UI for all CRUD operations - instant response on slow servers
[33m26b0eab5[m feat: Optimize expert management, fix dates, and improve UI UX
[33m270b4df3[m feat: improve UX with button debounce and update branding
[33m24366e6b[m feat: implement real-time data synchronization between users
[33mf46ec505[m feat(spec): add bugfix requirements for slow initial data loading
[33m4624fad7[m fix: use ssl.create_default_context() for Supabase SSL connection
[33m99e1ff5d[m fix: remove startCommand from railway.toml, let Dockerfile handle PORT
[33m30be9bb9[m fix: proper Supabase SSL config for Railway deployment
[33m6480272a[m fix: disable prepared statements for pgbouncer pooler compatibility
[33mdc7a08e5[m fix: wrap uvicorn startCommand in /bin/sh -c for $PORT expansion (#1)
[33m575ac1ec[m fix: disable prepared statements for Supabase pgbouncer compatibility
[33m4d5d275e[m chore: add Railway deployment config
[33m32c8ee3c[m fix: add retry logic for 429 rate limit and network errors
[33m873fd953[m feat: refresh on tab focus to sync changes from other users
[33m30df5867[m fix: persist internalStatuses, tenderNotes, assignedPICs to localStorage
[33m0f19ba57[m fix: expert CRUD, kanban board, QA/QC improvements
[33ma0134b90[m docs: add Hugging Face Spaces configuration metadata to README
[33md7e28b28[m feat: add README documentation for FastAPI backend service
[33m170eeb69[m feat: implement TenderPage for browsing and filtering project opportunities
[33md86c5f92[m fix: expert CRUD, PATCH endpoint, notes sync, delete expert/history, field mapping
[33mf102a64a[m Implement persistent tender status synchronization across users
[33m7815cbce[m Trigger auto-sync to Hugging Face
[33mf417e064[m Add token check to sync script
[33mffa9ef25[m Update sync script version and retry deployment
[33m11bfefad[m Add Arvian Riatmaja to expert list and test auto-deployment
[33m6eaea74f[m Add GitHub Action for auto-sync to Hugging Face
[33m313ff736[m Setup Docker for Hugging Face
[33m93d1b3be[m Initial commit with deployment configs
