# Bug & Fix Ledger (`BUG-AND-FIX.md`)

| ID | Date | Component | Root Cause | Fix Applied | Status |
|---|---|---|---|---|---|
| `BUG-01-NAVBAR-ZINDEX` | 2026-11-10 | `CanvasHeader.tsx` | Sticky `<header>` used `z-20`, matching `CustomSlider` thumb dot (`z-20`) and lower than range input (`z-30`), causing thumb dots to bleed through and render over sticky navbar on scroll | Elevated `<header>` stacking context to `sticky top-0 z-40` with `bg-white/95 backdrop-blur-md border-b` | CLOSED |
| `BUG-02-SW-QUERY-CACHE-MISS` | 2026-11-10 | `public/sw.js` | Service Worker used `caches.match(request)` without `{ ignoreSearch: true }`, causing ad tracking URLs (`?fbclid=...`, `?gclid=...`) to bypass cache and hit origin on every click. Stale `v1` cache also served old HTML | Upgraded SW to `tiar-tools-bandwidth-v2` with `ignoreSearch: true` on both static & navigation requests and automated cache cleanup | CLOSED |
| `BUG-03-FAVICON-404-LEAK` | 2026-11-10 | `public/favicon.ico` | Missing `favicon.ico` caused every browser visit to fetch full 8KB 404 HTML document | Generated multi-size `public/favicon.ico` (16x16, 32x32, 48x48) cached for 30 days | CLOSED |
