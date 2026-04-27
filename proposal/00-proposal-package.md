# Proposal Response — Meridian Components Inventory Dashboard Modernization

**RFP #:** MC-2026-0417
**Submitted by:** *[Firm Name]*
**Date:** April 27, 2026
**Response due:** May 8, 2026

---

## Table of contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Approach](#2-technical-approach)
3. [Timeline](#3-timeline)
4. [Pricing & Assumptions](#4-pricing--assumptions)
5. [Working Assumptions from Procurement Q&A](#5-working-assumptions-from-procurement-qa)

Individual sections are also available as standalone files in this directory:

- `01-executive-summary.md`
- `02-technical-approach.md`
- `03-timeline.md`
- `04-pricing.md`

---

## 1. Executive Summary

Meridian's operations team depends on the inventory dashboard every day, and right now it isn't carrying its weight. The Reports module is unreliable, restocking decisions still happen in spreadsheets, and IT can't safely approve changes because there's no test coverage to fall back on. The previous engagement ended with the work unfinished and minimal documentation handed over. We've reviewed what's there, and we're confident we can close the gap by the end of Q3.

Our approach is built around three principles:

**Unblock IT first.** Automated browser tests (R3) aren't the last item we ship — they're the foundation. We'll stand up an end-to-end test harness in the first two weeks so every subsequent change lands behind a green build. This converts IT from gatekeeper to partner.

**Fix what's broken before adding what's new.** The Reports remediation (R1) is partly known and partly discovery. We'll triage the eight logged defects in week one, fix them in priority order, and use that work to build our mental model of the codebase before tackling the Restocking view (R2). VP Operations gets visible wins inside the first month.

**Document as we go.** The architecture overview (R4) gets drafted during onboarding and updated through the engagement, not bolted on at the end. Meridian IT inherits a living document, not a snapshot.

**Commercials.** T&M with a not-to-exceed ceiling, phased by requirement. This protects Meridian against scope drift on R2 (where discovery is highest) while giving us room to do R1 properly. Detailed assumptions and pricing are in the sections that follow.

**Why us.** We've taken over half-finished engagements before. We know the pattern: light-touch documentation, mixed code conventions, defects logged but not triaged. Our differentiator is sequencing — getting tests in early, surfacing risk in writing, and shipping incrementally so Meridian's team feels progress every week, not just at milestones.

We'd welcome a kickoff call with Procurement, Operations, and IT in the same room. The faster all three voices are in the conversation, the better the engagement runs.

---

## 2. Technical Approach

### Approach overview

Our plan addresses the four required items (R1–R4) and positions the desired items (D1–D3) as in-scope under the T&M not-to-exceed structure if budget and timeline permit. The sequencing departs from the order Meridian listed for one deliberate reason: **R3 (automated testing) ships first, not last.** IT has paused changes to the production system until test coverage exists. Fixing Reports defects (R1) without that harness in place would replicate the previous vendor's pattern — code lands, regressions follow, IT pushes back. Standing up tests first converts IT from gatekeeper to partner and protects every subsequent change. From there we run R1 (fix-what's-broken) and R4 (document-as-we-go) in parallel, with R2 (the new Restocking view) phased in once the existing system is stable. The Sept 30, 2026 go-live is tight but achievable on this sequence.

### R3 — Automated browser testing (sequenced first)

**Why first.** Treating tests as the unlock rather than the wrap-up gives IT visible confidence inside the first two weeks. It also means every fix we ship in R1 lands behind a passing build, which is what Meridian's IT team has been waiting for.

**Tooling.** We will use Playwright for end-to-end browser testing. The repository already includes a Playwright integration, so the foundation is in place; we extend it with a structured test harness, page objects, and CI wiring.

**Scope proposal.** Critical user flows, in our view, are:

1. **Reports module** — page load, each filter dimension applied independently and in combination, drill-downs, empty-state behavior.
2. **Restocking view (R2)** — once delivered: budget input, recommendation generation, PO creation, multi-warehouse switching.
3. **Authentication and warehouse switching** — the cross-cutting flow every operator runs daily.

We have proposed this scope on Meridian's behalf because the RFP did not specify "critical flows." We would confirm it in the kickoff workshop before locking the test plan.

**Coverage target.** Happy-path end-to-end coverage on the three flows above, plus smoke checks on inventory, orders, and spending views. We are explicitly *not* targeting exhaustive unit coverage of the existing codebase — that is a poor return on T&M dollars given the engagement length, and the RFP asks for *browser* testing specifically.

**Deliverable.** A test suite that runs locally with one command, integrates with whichever CI platform Meridian standardizes on (we will confirm during onboarding), and produces readable failure output. Documentation lives alongside the suite so Meridian's team can extend it after handoff.

### R1 — Reports module remediation

The previous vendor's handoff notes mention "Reports module was in progress; not all filters wired up," and Meridian has logged at least eight defects against the page. We expect the real list to be longer — defect logs grow once someone with fresh eyes drives the application end-to-end.

**Approach.**

1. **Week 1 — Discovery and triage.** We catalog every defect: the eight logged, plus anything we surface ourselves. We categorize them (filter behavior, internationalization gaps, console errors, inconsistent API patterns) and rank by user impact. The output is a shared defect register Meridian Operations can review.
2. **Weeks 2–4 — Fix in priority order.** Each fix lands as a small, reviewable change behind the R3 test harness. We add a regression test for every defect we close, so the harness grows as remediation proceeds.
3. **Code consistency.** The handoff notes that the codebase mixes Options API and Composition API. We will standardize on Composition API in files we touch as part of R1, but we will *not* perform a blanket migration of untouched code. That is a separate engagement Meridian can scope later if it wants the cleanup.

**Assumption.** The logged defect list is a starting point, not a contract. Under T&M-NTE we are able to absorb additional findings without re-paper; we will surface them in weekly status with effort estimates so Meridian retains control.

### R2 — Restocking recommendations

This is Tanaka's feature and the most substantial new build in the engagement. The requirement: a view that recommends purchase orders given current stock, demand forecast, and an operator-supplied budget ceiling.

**Architecture.** A new FastAPI endpoint computes recommendations server-side from the existing inventory, demand, and (where applicable) supplier data. A new Vue view consumes the endpoint, lets the operator set a budget, and presents the recommended POs with the option to export or stage them. We keep the JSON-file data layer unchanged for this engagement (see cross-cutting assumptions).

**Open design questions.** Several requirements are not pinned down in the RFP. We have flagged them rather than guessing:

- **Recommendation algorithm.** The simplest model is a reorder-point calculation: anything below a per-SKU threshold gets recommended up to par stock. A richer model uses the demand forecast to predict near-term draw. The choice has real cost and accuracy trade-offs; Tanaka's team should drive the decision.
- **Multi-warehouse handling.** Recommendations could be per-warehouse (each warehouse plans independently) or global (optimize across the network). The Tokyo opening in 2023 may or may not have changed this expectation.
- **Budget enforcement.** Is the ceiling a hard cap (cut the recommendation list at the dollar line) or a soft target (show what's needed, flag overages)?

**Process.** We schedule a design checkpoint with VP Operations in week 3, with a working prototype to react to. R2 development begins after that checkpoint and ships in weeks 6–10.

### R4 — Architecture documentation

Meridian IT inherits a system the previous vendor barely documented. R4 fixes that.

**Approach.** We draft a current-state architecture overview during onboarding (week 1), refresh it as we make changes through the engagement, and finalize it at handoff. Format: an HTML document checked into the repository with an embedded diagram of components, data flow, and external dependencies. Audience: Meridian IT. Living document, not a one-time deliverable.

This is also genuinely useful internally — it keeps our team aligned and accelerates onboarding any new engineer who joins the engagement.

### Desired items (D1–D3)

These are evaluated but not mandatory. We position them as in-scope-if-budget-permits under the T&M-NTE ceiling, and we are realistic about which we can guarantee.

- **D1 — UI modernization.** Per procurement guidance, modernization means aligning to the Meridian brand system. This is conditional on receiving the brand system (style guide, design tokens, component library) at kickoff. If it does not exist or is not available in time, D1 reduces to component-level cleanup using the existing slate/gray palette. We flag this clearly so Meridian can either provide the assets or revise expectations.
- **D2 — Internationalization.** Extend the existing i18n pattern to the modules that lack it so the Tokyo team can work in Japanese. Validation by a Tokyo-based reviewer is included in the plan.
- **D3 — Dark mode.** Smallest of the three. Once D1's component layer is settled, dark mode is a tokens-and-toggle exercise. We can prototype it in parallel with the rest of the engagement on a feature branch.

### Cross-cutting assumptions

- **Stack remains Vue 3 + FastAPI.** No replatform is proposed; the existing technology choices are sound.
- **Data layer remains JSON files for the engagement.** We flag database migration as recommended future work, with a brief sizing note included in the architecture doc, but it is out of scope here.
- **Single environment assumed.** If Meridian has separate dev/staging/prod environments, please confirm at kickoff so we can plan deployment automation accordingly.
- **Source control.** Meridian provides repository access; we work on feature branches with pull-request review. PRs become the primary status artifact alongside weekly written updates.
- **Stakeholder availability.** R2 in particular requires Tanaka's input at the week-3 design checkpoint. Continuity here is the single biggest schedule risk.

### Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Meridian brand system unavailable or incomplete | Medium | Reduce D1 scope to component cleanup; document the gap in week-1 status |
| Reports defect count grows materially during discovery | High | T&M-NTE absorbs without re-paper; weekly written updates with effort estimates |
| VP Operations unavailable for R2 design checkpoints | Medium | Named risk surfaced at kickoff; backup decision-makers identified early |
| Sept 30 deadline tight given parallel R3 + R1 + R4 | Medium | Phased plan with weekly reviews; D1–D3 deferred if required scope slips |
| Mixed API patterns surface unexpected refactor cost | Low | Standardize only touched files; resist scope creep into untouched code |

---

## 3. Timeline

### Engagement window

- **Proposal due:** May 8, 2026
- **Target award:** mid-May 2026
- **Kickoff:** week of May 18, 2026
- **Hard go-live for R1–R4:** **September 30, 2026**

That is roughly **19 working weeks** from kickoff to go-live. The plan below fits inside that window with two weeks of buffer protected at the end for stabilization, UAT, and handoff.

### Phased plan

**Phase 1 — Foundations (weeks 1–2).** Three-stakeholder kickoff workshop (Procurement, Operations, IT); repository access and CI/CD baseline; architecture review and first R4 draft; Playwright harness scaffolded with first smoke tests green by end of week 2; defect register opened for R1.

**Phase 2 — Reports remediation and test depth (weeks 3–6).** R1 defect fixes shipped iteratively, each behind a regression test; R3 coverage extended to cover Reports flows in depth; R2 design checkpoint with VP Operations in week 3; R4 architecture doc updated as we learn the codebase.

**Phase 3 — Restocking build (weeks 7–12).** R2 backend (recommendation endpoint) and frontend (new Vue view) built together; E2E tests for R2 ship alongside the build; mid-phase demo for Operations in week 9; production-ready review in week 12; D2 (i18n) parallelized if Phase 2 finished clean.

**Phase 4 — Hardening and handoff (weeks 13–19).** D1 (UI alignment to brand system); D3 (dark mode) on parallel branch; UAT with Tanaka's team in San Francisco, remote sessions for London and Tokyo; R4 architecture doc finalized; two-week buffer (weeks 18–19) for late-breaking findings and IT handoff.

### Calendar view

| Week | Dates | Phase | Headline activity |
|---|---|---|---|
| 1 | May 18 | 1 | Kickoff, repo access, R4 first draft |
| 2 | May 25 | 1 | R3 harness scaffolded, defect register triaged |
| 3 | Jun 1 | 2 | R2 design checkpoint with Tanaka |
| 4 | Jun 8 | 2 | First R1 fixes shipped |
| 5 | Jun 15 | 2 | R1 fixes continue |
| 6 | Jun 22 | 2 | Reports remediation complete |
| 7 | Jun 29 | 3 | R2 backend kickoff |
| 8 | Jul 6 | 3 | R2 backend continues |
| 9 | Jul 13 | 3 | R2 mid-phase demo |
| 10 | Jul 20 | 3 | R2 frontend |
| 11 | Jul 27 | 3 | R2 integration & tests |
| 12 | Aug 3 | 3 | R2 production-ready review |
| 13 | Aug 10 | 4 | D1 / D2 work |
| 14 | Aug 17 | 4 | D1 / D3 work |
| 15 | Aug 24 | 4 | UAT begins |
| 16 | Aug 31 | 4 | UAT continues, defect cleanup |
| 17 | Sep 7 | 4 | Final architecture doc, training material |
| 18 | Sep 14 | 4 | **Buffer** — stabilization |
| 19 | Sep 21 | 4 | **Buffer** — IT handoff, go-live Sep 30 |

### Status cadence

- **Weekly written status** every Friday — what shipped, what's blocked, hours burned vs. NTE ceiling.
- **Bi-weekly stakeholder review** alternating between Operations focus (Tanaka) and IT focus.
- **Monthly steering with Procurement** — Okafor — covering schedule, budget burn, risks.

### Critical path and what could move it

The single longest dependency chain is **R2 design checkpoint (week 3) → R2 build (weeks 7–12) → UAT (weeks 15–16)**. Any slip in the design decision compresses Phase 3, which is already the densest phase. Other movers: late brand-system delivery slips D1 only; oversize Reports defect count compresses Phase 4 buffer; VP Operations unavailability at week 3 is the single biggest named schedule risk.

---

## 4. Pricing & Assumptions

### Commercial structure

**Time and Materials with Not-To-Exceed ceiling (T&M-NTE).** We bill for actual time worked, capped by a fixed ceiling per phase. If we deliver under the ceiling, Meridian pays less. If we approach the ceiling, we surface it in writing before we hit it — Meridian decides whether to authorize an increase, descope, or stop.

This structure was chosen with Procurement during the clarifying-questions exchange. The reasoning: R1 (Reports defects) and R2 (Restocking) both carry discovery risk that fixed-fee would force us to price defensively against. T&M-NTE keeps the engagement honest — Meridian pays for what is actually done, with a hard cap protecting the budget.

### Rate card

| Role | Daily rate | Notes |
|---|---|---|
| Engagement Lead | *[FIRM_RATE_LEAD]* | 0.5 FTE through engagement |
| Senior Engineer | *[FIRM_RATE_SR_ENG]* | Two on the engagement, full-time |
| Engineer | *[FIRM_RATE_ENG]* | One full-time |
| QA / Test Engineer | *[FIRM_RATE_QA]* | 0.5 FTE for R3 build, ramps with phases |
| Designer | *[FIRM_RATE_DESIGN]* | On-call for D1 alignment |

Rates are fully loaded (no separate expenses for travel within continental US, software, or tooling). On-site travel to London or Tokyo, if requested, is billed at cost with prior written approval.

> Rate-card values are placeholders pending firm-side rate confirmation. Total ceiling figures below scale directly with the rate card.

### Phase-level NTE ceilings

| Phase | Weeks | Effort range | NTE ceiling | Covers |
|---|---|---|---|---|
| 1 — Foundations | 1–2 | 60–80 person-days | *[PHASE_1_NTE]* | Kickoff, R3 harness, R4 first draft, defect triage |
| 2 — Reports & test depth | 3–6 | 90–110 person-days | *[PHASE_2_NTE]* | R1 remediation, R3 deepening, R2 design checkpoint |
| 3 — Restocking build | 7–12 | 130–160 person-days | *[PHASE_3_NTE]* | R2 backend & frontend, R2 tests, optional D2 |
| 4 — Hardening & handoff | 13–19 | 90–120 person-days | *[PHASE_4_NTE]* | D1, D3, UAT, final R4 doc, two-week buffer |
| **Total engagement** | **19** | **370–470 person-days** | ***[TOTAL_NTE]*** | All required + desired items |

Each phase ceiling stands alone. We do not roll underspend forward without written authorization, and we do not overspend one phase against another's headroom.

### What is included

All engineering, design, QA, and engagement-management time against R1–R4 and D1–D3; code review and PR collaboration; weekly written status and bi-weekly reviews; test suite, architecture documentation, and inline code documentation as deliverables; tooling and software licences used by our team.

### What is not included

Production hosting and infrastructure costs; database migration (flagged as future work); travel beyond continental US; classroom-style operator training programs; 24/7 post-go-live support beyond a 30-day window; any replatform work.

### Assumptions affecting price

1. **Defect count for R1** — priced against ~12 defects (eight logged plus reasonable discovery growth).
2. **R2 algorithm complexity** — priced against reorder-point or forecast-aware, not a custom optimization model.
3. **Brand system availability** — D1 priced against receiving brand assets within first two weeks.
4. **Single environment** — separate dev/staging/prod automation is additional scope.
5. **Stakeholder availability** — priced against the timeline cadence including week-3 R2 checkpoint.
6. **Repository access and CI/CD baseline at kickoff** — delays compress Phase 1.

### Change control

Lightweight written process: either side raises a change in writing with scope and rough effort; we respond within three business days with effort estimate and ceiling impact; Procurement authorizes in writing before work begins. Changes under **0.5 day of effort** are absorbed into the existing phase ceiling without formal change control.

### Payment terms (proposed)

Monthly invoicing against actuals by phase; net-30; no upfront retainer; 10% hold-back against final acceptance, released within 30 days of go-live.

---

## 5. Working Assumptions from Procurement Q&A

The following were locked in during the clarifying-questions exchange with Meridian Procurement (per RFP §6) and inform every section above:

| Topic | Locked assumption |
|---|---|
| UI modernization (D1) direction | Match Meridian brand system (style guide TBD from client) |
| Pricing model | T&M with not-to-exceed |
| Hard go-live | September 30, 2026 |
| Test scope (R3) | Reports + Restocking + login/warehouse switching — proposed by us, to be confirmed at kickoff |

---

*Submitted by: [Firm Name]
Contact: [Lead name, email, phone]*
