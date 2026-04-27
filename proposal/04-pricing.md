# Pricing & Assumptions

**RFP:** MC-2026-0417 — Inventory Dashboard Modernization
**Prepared for:** Meridian Components, Inc.

---

## Commercial structure

**Time and Materials with Not-To-Exceed ceiling (T&M-NTE).**

We bill for actual time worked, capped by a fixed ceiling per phase. If we deliver under the ceiling, Meridian pays less. If we approach the ceiling, we surface it in writing before we hit it — Meridian decides whether to authorize an increase, descope, or stop.

This structure was chosen with Procurement during the clarifying-questions exchange. The reasoning: R1 (Reports defects) and R2 (Restocking) both carry discovery risk that fixed-fee would force us to price defensively against. T&M-NTE keeps the engagement honest — Meridian pays for what is actually done, with a hard cap protecting the budget.

---

## Rate card

| Role | Daily rate (placeholder) | Notes |
|---|---|---|
| Engagement Lead | *[FIRM_RATE_LEAD]* | 0.5 FTE through engagement |
| Senior Engineer | *[FIRM_RATE_SR_ENG]* | Two on the engagement, full-time |
| Engineer | *[FIRM_RATE_ENG]* | One full-time |
| QA / Test Engineer | *[FIRM_RATE_QA]* | 0.5 FTE for R3 build, ramps with phases |
| Designer | *[FIRM_RATE_DESIGN]* | On-call for D1 alignment |

Rates are fully loaded (no separate expenses for travel within continental US, software, or tooling). On-site travel to London or Tokyo, if requested, is billed at cost with prior written approval.

> **Note for internal review:** rate-card values are placeholders. The firm needs to confirm actual rates and team composition before this section is finalized. Total ceiling figures below scale directly with the rate card; they are illustrative until rates are filled in.

---

## Phase-level NTE ceilings

The ceilings below are scoped against the timeline in the previous section. They are illustrative pending rate confirmation.

| Phase | Weeks | Effort range | NTE ceiling (placeholder) | Covers |
|---|---|---|---|---|
| 1 — Foundations | 1–2 | 60–80 person-days | *[PHASE_1_NTE]* | Kickoff, R3 harness scaffold, R4 first draft, defect triage |
| 2 — Reports & test depth | 3–6 | 90–110 person-days | *[PHASE_2_NTE]* | R1 remediation, R3 deepening, R2 design checkpoint |
| 3 — Restocking build | 7–12 | 130–160 person-days | *[PHASE_3_NTE]* | R2 backend & frontend, R2 tests, optional D2 |
| 4 — Hardening & handoff | 13–19 | 90–120 person-days | *[PHASE_4_NTE]* | D1, D3, UAT, final R4 doc, two-week buffer |
| **Total engagement** | **19** | **370–470 person-days** | ***[TOTAL_NTE]*** | All required + desired items |

Each phase ceiling stands alone. We do not roll underspend forward without written authorization, and we do not overspend one phase against another's headroom. This protects Meridian against the failure mode where a vendor "borrows" from late-phase budget to cover early-phase slippage.

---

## What is included

- All engineering, design, QA, and engagement-management time against R1–R4 and D1–D3.
- Code review, pull-request collaboration with Meridian engineers if/when assigned.
- Weekly written status, bi-weekly stakeholder reviews, monthly procurement steering.
- Test suite, architecture documentation, and inline code documentation as deliverables.
- Tooling and software licences used by our team.

---

## What is not included

- **Production hosting and infrastructure costs.** Meridian's environment, Meridian's bill.
- **Database migration.** Flagged as recommended future work in the architecture doc but explicitly out of this engagement's scope.
- **Travel beyond continental US.** Billed at cost with written approval.
- **Operator training programs.** We provide written documentation and a one-hour walk-through per warehouse; classroom-style training would be a separate engagement.
- **24/7 support after go-live.** A 30-day post-go-live support window is included; ongoing support is a separate agreement Meridian can scope at handoff.
- **Replatform work.** The Vue 3 + FastAPI stack stays. If Meridian wants a different stack, that is not this engagement.

---

## Assumptions affecting price

1. **Defect count for R1.** Priced against a register of up to ~12 defects (the eight logged plus reasonable discovery growth). If discovery surfaces materially more, we surface the impact in weekly status before we approach the Phase 2 ceiling.
2. **R2 algorithm complexity.** Priced against either a reorder-point or a forecast-aware recommendation, not a custom optimization model. A bespoke optimizer is a different engagement.
3. **Brand system availability.** D1 priced against receiving brand assets within the first two weeks of kickoff. Late delivery reduces D1 scope, not budget — work shifts to D3 or buffer.
4. **Single environment.** If Meridian runs separate dev/staging/prod and asks us to manage deployment automation across them, that is additional scope.
5. **Stakeholder availability.** Priced against the cadence in the timeline section, including Tanaka's availability for the week-3 design checkpoint and UAT in weeks 15–16.
6. **Repository access and CI/CD baseline at kickoff.** Delays here compress Phase 1 and may push later phases right.

---

## Change control

Change requests follow a lightweight written process:

1. Either side raises a change in writing, with scope, rationale, and rough effort.
2. We respond within three business days with effort estimate and ceiling impact.
3. Procurement (Okafor) authorizes in writing before work begins.
4. Approved changes appear on the next weekly status with revised burn-down.

Changes under **0.5 day of effort** are absorbed into the existing phase ceiling without formal change control — small fixes shouldn't generate paperwork.

---

## Payment terms (proposed)

- **Monthly invoicing** against actual hours worked, by phase.
- **Net-30** payment terms.
- **No upfront retainer** — first invoice covers Phase 1 actuals at end of week 4.
- **Hold-back of 10%** of total against final acceptance, released within 30 days of go-live.

These are our standard terms; we are open to negotiation during contracting.

---

## Summary

T&M-NTE structure, four phase-level ceilings, transparent burn-down, explicit assumptions. We have priced for honesty rather than for the lowest headline number — the goal is no surprises in week 12. Final rate and ceiling figures will be filled in pending firm-side rate confirmation; the framework above is the commercial structure we are committing to regardless of which numbers fill the placeholders.
