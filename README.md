# ChargeBack.in

**A free, local-first assistant that takes an Indian bank customer from "I was charged wrongly" to a filed, maintainable RBI Ombudsman complaint — with the bank-escalation stage, evidence dossier, deadline tracking, and the RBI CMS form's undocumented input traps handled.**

> ChargeBack.in is **not a law firm and does not provide legal advice**. It helps you organise and file your own complaint. No outcome is predicted or guaranteed, anywhere.

Built from the Recourse PRD v1.0 (2026-06-12), itself grounded in a real 65-day dispute fought to the RBI Ombudsman. Knowledge layer inherited from the [dispute-desk](https://github.com/vishaltorc/dispute-desk) repo (regulations verified against official sources).

## What v1 does (text-first slice)

1. **Intake** — plain-language triage into a canonical Case object (no jargon, <5 minutes).
2. **Maintainability gates** — the RB-IOS eligibility conditions, enforced *before* filing: bank-first, the 30-day trigger, the filing window, sub-judice/advocate/duplicate/staff exclusions. Failed gates explain themselves and redirect; the filing page stays locked until all pass.
3. **Legal mapping** — deterministic dispute-type → grounds table (never LLM-decided): Visa/Mastercard dispute codes + RBI rules, two pillars wherever both exist, rail-agnostic grounds flagged, RuPay honestly handled (NPCI publishes no public codes). Plus a correspondence log that converts bank stalls into a deficiency-in-service record.
4. **Drafts** — RE complaint, reminder, GRO and PNO escalations. Claude words them under hard constraints (only supplied facts, only supplied grounds, no outcome language); a no-AI fill-in template fallback always works.
5. **Dossier** — printable complaint summary + correspondence/deficiency tables (browser print-to-PDF), sized for the CMS upload caps.
6. **RBI filing sheet** — every CMS field with the exact value to paste, the upload-slot map, and a one-tap **sanitised Facts string** (≤2000 chars; decimals→"point", no quotes/parens/colons/hyphens — the portal's observed rejection rules).
7. **Deadline tracker** — bank response window, the **90-day Ombudsman window** (RB-IOS 2026; no condonation exists), appeal window, with urgency states. Scheme-aware: complaints before 2026-07-01 compute under RB-IOS 2021 rules.

Deferred to v2: evidence upload/OCR/redaction, programmatic PDFs, public redacted dossier, push reminders.

## Architecture

- **Local-first**: the Case lives only in browser localStorage. No DB, no auth, no analytics, export/import/delete controls. See `/privacy`.
- **One server endpoint**: `POST /api/draft` proxies the Claude API (model `claude-opus-4-8`) for drafting only, with a minimised payload (no name/address/email). Without `ANTHROPIC_API_KEY`, the app degrades gracefully to templates.
- **Versioned knowledge config** (`src/config/knowledge/`): every regulatory value is `{value, asOf, sourceUrl, status}` where status ∈ `verified` (read from the official source on that date) / `UNVERIFIED` (flagged in the UI, never guessed) / `observed` (real-filing operational knowledge, e.g. the CMS traps). Scheme texts verbatim-verified 2026-06-12: RB-IOS 2021 + 2026, Visa Core Rules 18 Apr 2026 ed., Mastercard Chargeback Guide 19 May 2026, RBI e-mandate framework 2026, RBC Directions 2025 ch.IV-D.
- **Deterministic core, tested**: gates, deadline math (both schemes), mapping table, CMS sanitiser, filing sheet — vitest, `npm test`.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for AI drafting
npm run dev                  # http://localhost:3000
npm test                     # logic-core test suite
npm run build                # production build
```

## Knowledge-base freshness

| Area | As of | Source |
|---|---|---|
| RB-IOS 2026 (90-day window, ₹30L/₹3L, appeal terms) | 2026-06-12 | scheme PDF, rbidocs.rbi.org.in |
| RB-IOS 2021 (sunset 2026-06-30) | 2026-06-10/12 | scheme PDF (as amended 2022-08-05) |
| RBI e-mandate framework 2026 + predecessors | 2026-06-10 | rbi.org.in |
| Liability (RBC Directions 2025 ch.IV-D) | 2026-06-10 | rbi.org.in |
| Visa 13.1/13.2/13.6/13.7/12.6/10.4 | 2026-06-10/12 | Visa Core Rules public PDF |
| Mastercard 4853/4837/4834 (+2028 renumbering note) | 2026-06-10/12 | Chargeback Guide |
| RuPay | UNVERIFIED (member-bank manual only) | npcisupport.org.in |
| CMS portal form + traps | 2026-06-12 | observed, real filing (PRD §7.8) |

Regulation changes; the config is designed to be re-verified and re-dated, not trusted forever. The UI surfaces every `UNVERIFIED` status to the user.
