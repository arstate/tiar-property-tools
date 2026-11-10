# Technical Architecture & Stack Specification (`TECHSTACK.md`)

## 1. Selected Stack: Option 1 — Next.js 15 App Router (Static Export `output: 'export'`)
- **Framework:** Next.js 15 (App Router, React 19)
- **Export Mode:** `output: 'export'` (100% static HTML, CSS, JS client bundle, zero server compute overhead, instant tablet loading even with spotty internet on site surveys).
- **Styling Core:** Tailwind CSS v3.4 + OKLCH Color space (`tokens.css`).
- **Component Primitives:** `shadcn/ui` (Radix UI unstyled primitives for Dialog, Tabs, Tooltips, Sliders).
- **Icons:** `lucide-react` (uniform 1.5px/2.0px stroke weight).
- **Animation Engine:** Framer Motion (v11/v12) for layout animations, tab morphing, slider tooltips, and drawer reveals.
- **Canvas Subsystem:** Custom HTML5 2D Canvas with pointer event handling, quadratic curve smoothing, undo/redo stack, and PNG export pipeline.

## 2. Architectural Decisions (ADR)
- **ADR-001: Static Export over Serverless:** As a pitching and calculation tool used during physical client meetings, speed and offline-reliability are paramount. A static Next.js export guarantees LCP < 0.8s, zero cold starts, zero API failures, and zero server hosting bills.
- **ADR-002: Client-side State Persistence:** Use lightweight `zustand` or React Context + `localStorage` so the sales consultant never loses active calculations or client notes when switching between tools.
- **ADR-003: High-DPI Canvas for Whiteboard:** The whiteboard automatically scales by `window.devicePixelRatio` so stylus drawings on iPad Retina screens or high-res laptops look razor sharp.

## 3. Performance & Quality Contracts
- **LCP:** < 1.0s
- **CLS:** 0.00
- **Bundle Size:** < 120 KB initial JS
- **Mobile/Tablet Optimization:** 100% touch friendly, min-touch target >= 44px, zero horizontal overflow (`html, body { overflow-x: clip; }`).
