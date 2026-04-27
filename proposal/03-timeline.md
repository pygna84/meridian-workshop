# Timeline

**RFP:** MC-2026-0417 — Inventory Dashboard Modernization
**Prepared for:** Meridian Components, Inc.

---

## Engagement window

- **Proposal due:** May 8, 2026
- **Target award:** mid-May 2026
- **Kickoff:** week of May 18, 2026
- **Hard go-live for R1–R4:** **September 30, 2026**

That is roughly **19 working weeks** from kickoff to go-live. The plan below fits inside that window with two weeks of buffer protected at the end for stabilization, UAT, and handoff.

---

## Phased plan

We work in four overlapping phases, not strict serial stages. Overlap is intentional — it keeps Tanaka's team seeing progress every week and prevents R2 (the biggest build) from compressing into a single late-stage block.

### Phase 1 — Foundations (weeks 1–2)

*Kickoff through end of May.*

- Three-stakeholder kickoff workshop (Procurement, Operations, IT)
- Repository access, environment setup, CI/CD baseline
- Architecture review and first draft of the R4 document
- Playwright harness scaffolded (R3) — first smoke tests green by end of week 2
- Defect register opened for R1; full triage of logged defects

**Phase 1 exit criteria:** running test suite in CI, defect register reviewed with Operations, architecture draft circulated.

### Phase 2 — Reports remediation and test depth (weeks 3–6)

*Through end of June.*

- R1 defect fixes shipped iteratively, each behind a regression test
- R3 coverage extended to cover Reports flows in depth
- R2 design checkpoint with VP Operations in week 3 — algorithm choice, multi-warehouse handling, budget enforcement decided here
- R4 architecture doc updated as we learn the codebase

**Phase 2 exit criteria:** Reports module defect-free against the agreed register, R2 design locked, test suite covering Reports plus auth/warehouse switching.

### Phase 3 — Restocking build (weeks 7–12)

*July through mid-August.*

- R2 backend service: recommendation endpoint, integration with inventory and demand data
- R2 frontend: new Vue view, budget input, recommendation table, PO staging
- E2E tests for R2 happen alongside the build, not after — Restocking ships with its test coverage from day one
- Mid-phase demo for Operations in week 9; production-ready review in week 12
- D2 (i18n extension) parallelized here if Phase 2 finished clean

**Phase 3 exit criteria:** R2 demoable end-to-end against real warehouse data, tests green, Tanaka's team has driven it in a working session.

### Phase 4 — Hardening and handoff (weeks 13–19)

*Mid-August through September 30.*

- D1 (UI alignment to brand system) — assuming brand assets received at or before kickoff
- D3 (dark mode) — parallel feature branch, low risk
- UAT with Tanaka's team in San Francisco; remote sessions for London and Tokyo
- R4 architecture doc finalized, including the deferred-DB-migration note
- Two-week buffer (weeks 18–19) absorbs late-breaking findings and runs the final IT handoff

**Phase 4 exit criteria:** all R-items signed off, D-items shipped to whatever degree the budget supports, IT has accepted the documentation and test suite for ongoing ownership.

---

## Calendar view

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

---

## Status cadence

- **Weekly written status** every Friday — what shipped, what's blocked, hours burned vs. NTE ceiling.
- **Bi-weekly stakeholder review** alternating between Operations focus (Tanaka) and IT focus.
- **Monthly steering with Procurement** — Okafor — covering schedule, budget burn, risks.

The point of this cadence is that no week passes without Meridian seeing progress in writing.

---

## Critical path and what could move it

The single longest dependency chain is **R2 design checkpoint (week 3) → R2 build (weeks 7–12) → UAT (weeks 15–16)**. Any slip in the design decision compresses Phase 3, which is already the densest phase.

Movers we can act on:
- If brand system assets arrive late, D1 slips out of Phase 4. R-items are unaffected.
- If Reports defect count exceeds the logged eight by more than ~50%, Phase 2 grows by a week and Phase 4 buffer shrinks. We surface this in weekly status before it bites.
- If VP Operations is unavailable for the week-3 checkpoint, we propose a written-async fallback, but the schedule risk is real and named.

Movers outside our control we ask Meridian to manage:
- Repository and environment access at kickoff.
- A named alternate for Tanaka in case of travel or PTO.
- IT availability for the final handoff week.

---

## Why we are confident in Sept 30

Three reasons. **First**, the test-harness-first sequencing means every week's work is verifiable, not just claimed. **Second**, the two-week buffer at the end is real and not used to cover earlier slippage assumptions. **Third**, we have built engagements on this stack at this scale before — Vue 3, FastAPI, no database, mid-market distributor — and the surprises are mostly known surprises.

We will not promise certainty we cannot deliver. We will promise that if the schedule starts to slip, Meridian will hear it from us in writing the same week, with a recommendation attached.
