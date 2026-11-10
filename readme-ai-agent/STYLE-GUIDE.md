# Style Guide & Design DNA (`STYLE-GUIDE.md`)

## 1. Visual Vibe: Crisp Modern Light Mode (High-Trust Pitching Suite)
- **Aesthetic:** Modern, tactile, clean, and rounded. Built for high legibility under daylight conditions (survey field, outdoor cafe, brightly lit sales office).
- **Surface Mode:** `Operate` & `Persuade` (Fast interactive calculations + persuasive closing visuals).

## 2. Color Palette (OKLCH Base & Tokens)
- **Primary Background:** `#F8F9FA` / Alabaster Light (`oklch(0.985 0.005 240)`)
- **Card Surface:** `#FFFFFF` Pure White (`oklch(1.0 0 0)`) with soft border `border-slate-200/80` and subtle elevation `shadow-sm`.
- **Primary Ink:** `#0F172A` Deep Slate (`oklch(0.20 0.02 260)`) — ensures crisp WCAG AAA contrast.
- **Secondary Muted Text:** `#64748B` Slate 500 (`oklch(0.55 0.02 260)`).
- **Brand Accent 1 (ACC Bank / Approval Green):** `#059669` Emerald 600 (`oklch(0.60 0.16 155)`) — psychologically reinforces financial confidence, bank approval, and positive equity.
- **Brand Accent 2 (Developer Promo Amber):** `#D97706` Amber 600 (`oklch(0.68 0.16 65)`) — highlights special limited developer subsidies.
- **Surface Danger/Warning:** `#E11D48` Rose 600 (`oklch(0.60 0.22 25)`) — marks high DBR alert.

## 3. Typography & Numerical Discipline
- **Display Font:** `Plus Jakarta Sans` (SemiBold / Bold, tracking -0.02em).
- **Body Font:** `Plus Jakarta Sans` (Regular / Medium, 15px - 16px).
- **Number & Currency Standard:** Wajib `font-variant-numeric: tabular-nums;` on all Rupiah figures, interest percentages, and years to prevent jitter during slider scrubbing.
- **Zero Italic Headings:** All display headlines are strictly upright roman (`font-style: normal`).

## 4. Geometry & Tactility
- **Cards & Panels:** `rounded-2xl` (16px) or `rounded-3xl` (24px).
- **Buttons & Pills:** `rounded-xl` for form controls, `rounded-full` for badges and primary CTAs.
- **Micro-Interactions:** Tactile press feedback `active:scale-[0.98]` with cubic-bezier spring transitions.
