# Granular Task & Swarm Checklist (`TASK.md`)

## Milestone 1: Pre-Flight Planning & Architecture Approval
- [x] Gather requirements & pitch closing psychology
- [x] Design 6-tool suite for Tiar Property pitching
- [x] Initialize 12-file `readme-ai-agent/` documentation
- [x] Author `USER_FLOW_AND_PAGE_ARCHITECTURE.md`
- [x] Scrape real bank rates via Chrome CDP (BTN, Mandiri, BCA, BSI, BRI, BNI)

## Milestone 2: Next.js 15 App Router Scaffolding & Layout
- [x] Initialize Next.js 15 App Router with TypeScript, Tailwind CSS, Iconify, Framer Motion
- [x] Left Sidebar navigation (`AppSidebar.tsx`) with collapsible toggle
- [x] Minimal clean canvas header (`CanvasHeader.tsx`)
- [x] Dual-sync CurrencyInput and CustomSlider components
- [x] Real bank selector modal (`BankRateSelectorModal.tsx`)

## Milestone 3: Interactive Tools Implementation
- [x] Build Tool 1: Interactive KPR Simulator with Multi-Developer Custom Promo Engine & Micro-Installment
- [x] Build Tool 2: High-DPI Whiteboard Scratchpad with Canvas Drawing, Highlighting, Eraser, Templates & PNG Export
- [x] Build Tool 3: Joint Income & Debt Burden Ratio (DBR 40%) Analyzer
- [x] Build Tool 4: Rent vs Buy Financial Comparison Engine
- [x] Build Tool 5: Capital Gain & Infrastructure Catalyst Projector (RSUD Sedati 2027)
- [x] Build Tool 6: Official Slip Generator & 1-Click WhatsApp Closer

## Milestone 4: Polish, Vision QA & Production Export
- [x] Verify responsive layout across tablet & desktop via Chrome CDP (port 9223)
- [x] Confirm zero horizontal overflow & clean tabular-nums
- [x] Static build export (`out/`) running live on port 3005
- [x] Git snapshot commit `bcd8241` tagged `restore-sidebar-custom-dev-v1`

## Milestone 5: Vercel Zero-Bandwidth Shield, GitHub Sync & Production Deployment
- [x] Fix CanvasHeader z-index layer bug (`z-40`) to prevent slider thumbs bleed-through on scroll
- [x] Configure `vercel.json` with extreme bandwidth caching headers & HTTP security policies
- [x] Update `next.config.ts` with `compress`, `generateEtags`, `trailingSlash: false`, and `poweredByHeader: false`
- [x] Service Worker PWA upgrade (`tiar-tools-bandwidth-v2`) with `ignoreSearch: true` for ad traffic
- [x] Generate multi-size `favicon.ico` to eliminate 404 origin bandwidth leak
- [x] Production build validation (`npm run build`) with static export (`out/`)
- [x] Push to GitHub repository `arstate/tiar-property-tools`
- [x] Deploy to Vercel production with zero-usage configuration
