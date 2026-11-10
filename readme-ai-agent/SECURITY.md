# Security & Confidentiality Audit (`SECURITY.md`)

## 1. Domain Confidentiality (Non-Negotiable)
- **Zero BLT Leakage:** Strictly forbidden to include any reference, variable name, or UI text containing "BLT" (Bantuan Likuiditas Transaksi). All marketing bonuses must be represented purely as developer customer subsidies or legal fee waivers.

## 2. Client-Side Input Sanitization
- All client phone numbers and names sanitized with Zod / regex before generating WhatsApp URL schemes (`encodeURIComponent`).
- Zero eval or dangerouslySetInnerHTML on canvas notes.
