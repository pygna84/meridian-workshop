# Technical Approach

**RFP:** MC-2026-0417 — Inventory Dashboard Modernization
**Prepared for:** Meridian Components, Inc.

---

## Approach overview

Our plan addresses the four required items (R1–R4) and positions the desired items (D1–D3) as in-scope under the T&M not-to-exceed structure if budget and timeline permit. The sequencing departs from the order Meridian listed for one deliberate reason: **R3 (automated testing) ships first, not last.** IT has paused changes to the production system until test coverage exists. Fixing Reports defects (R1) without that harness in place would replicate the previous vendor's pattern — code lands, regressions follow, IT pushes back. Standing up tests first converts IT from gatekeeper to partner and protects every subsequent change. From there we run R1 (fix-what's-broken) and R4 (document-as-we-go) in parallel, with R2 (the new Restocking view) phased in once the existing system is stable. The Sept 30, 2026 go-live is tight but achievable on this sequence.

---

## R3 — Automated browser testing (sequenced first)

**Why first.** Treating tests as the unlock rather than the wrap-up gives IT visible confidence inside the first two weeks. It also means every fix we ship in R1 lands behind a passing build, which is what Meridian's IT team has been waiting for.

**Tooling.** We will use Playwright for end-to-end browser testing. The repository already includes a Playwright MCP integration in `.mcp.json`, so the foundation is in place; we extend it with a structured test harness, page objects, and CI wiring.

**Scope proposal.** Critical user flows, in our view, are:

1. **Reports module** — page load, each filter dimension applied independently and in combination, drill-downs, empty-state behavior.
2. **Restocking view (R2)** — once delivered: budget input, recommendation generation, PO creation, multi-warehouse switching.
3. **Authentication and warehouse switching** — the cross-cutting flow every operator runs daily.

We have proposed this scope on Meridian's behalf because the RFP did not specify "critical flows." We would confirm it in the kickoff workshop before locking the test plan.

**Coverage target.** Happy-path end-to-end coverage on the three flows above, plus smoke checks on inventory, orders, and spending views. We are explicitly *not* targeting exhaustive unit coverage of the existing codebase — that is a poor return on T&M dollars given the engagement length, and the RFP asks for *browser* testing specifically.

**Deliverable.** A test suite that runs locally with one command, integrates with whichever CI platform Meridian standardizes on (we will confirm during onboarding), and produces readable failure output. Documentation lives alongside the suite so Meridian's team can extend it after handoff.

---

## R1 — Reports module remediation

The previous vendor's handoff notes mention "Reports module was in progress; not all filters wired up," and Meridian has logged at least eight defects against the page. We expect the real list to be longer — defect logs grow once someone with fresh eyes drives the application end-to-end.

**Approach.**

1. **Week 1 — Discovery and triage.** We catalog every defect: the eight logged, plus anything we surface ourselves. We categorize them (filter behavior, internationalization gaps, console errors, inconsistent API patterns) and rank by user impact. The output is a shared defect register Meridian Operations can review.
2. **Weeks 2–4 — Fix in priority order.** Each fix lands as a small, reviewable change behind the R3 test harness. We add a regression test for every defect we close, so the harness grows as remediation proceeds.
3. **Code consistency.** The handoff notes that the codebase mixes Options API and Composition API. We will standardize on Composition API in files we touch as part of R1, but we will *not* perform a blanket migration of untouched code. That is a separate engagement Meridian can scope later if it wants the cleanup.

**Assumption.** The logged defect list is a starting point, not a contract. Under T&M-NTE we are able to absorb additional findings without re-paper; we will surface them in weekly status with effort estimates so Meridian retains control.

---

## R2 — Restocking recommendations

This is Tanaka's feature and the most substantial new build in the engagement. The requirement: a view that recommends purchase orders given current stock, demand forecast, and an operator-supplied budget ceiling.

**Architecture.** A new FastAPI endpoint computes recommendations server-side from the existing inventory, demand, and (where applicable) supplier data. A new Vue view consumes the endpoint, lets the operator set a budget, and presents the recommended POs with the option to export or stage them. We keep the JSON-file data layer unchanged for this engagement (see cross-cutting assumptions).

**Open design questions.** Several requirements are not pinned down in the RFP. We have flagged them rather than guessing:

- **Recommendation algorithm.** The simplest model is a reorder-point calculation: anything below a per-SKU threshold gets recommended up to par stock. A richer model uses the demand forecast to predict near-term draw. The choice has real cost and accuracy trade-offs; Tanaka's team should drive the decision.
- **Multi-warehouse handling.** Recommendations could be per-warehouse (each warehouse plans independently) or global (optimize across the network). The Tokyo opening in 2023 may or may not have changed this expectation.
- **Budget enforcement.** Is the ceiling a hard cap (cut the recommendation list at the dollar line) or a soft target (show what's needed, flag overages)?

**Process.** We schedule a design checkpoint with VP Operations in week 3, with a working prototype to react to. R2 development begins after that checkpoint and ships in weeks 6–10.

---

## R4 — Architecture documentation

Meridian IT inherits a system the previous vendor barely documented. R4 fixes that.

**Approach.** We draft a current-state architecture overview during onboarding (week 1), refresh it as we make changes through the engagement, and finalize it at handoff. Format: an HTML document checked into the repository with an embedded diagram of components, data flow, and external dependencies. Audience: Meridian IT. Living document, not a one-time deliverable.

This is also genuinely useful internally — it keeps our team aligned and accelerates onboarding any new engineer who joins the engagement.

---

## Desired items (D1–D3)

These are evaluated but not mandatory. We position them as in-scope-if-budget-permits under the T&M-NTE ceiling, and we are realistic about which we can guarantee.

- **D1 — UI modernization.** Per procurement guidance, modernization means aligning to the Meridian brand system. This is conditional on receiving the brand system (style guide, design tokens, component library) at kickoff. If it does not exist or is not available in time, D1 reduces to component-level cleanup using the existing slate/gray palette. We flag this clearly so Meridian can either provide the assets or revise expectations.
- **D2 — Internationalization.** Extend the existing i18n pattern to the modules that lack it so the Tokyo team can work in Japanese. Validation by a Tokyo-based reviewer is included in the plan.
- **D3 — Dark mode.** Smallest of the three. Once D1's component layer is settled, dark mode is a tokens-and-toggle exercise. We can prototype it in parallel with the rest of the engagement on a feature branch.

---

## Cross-cutting assumptions

- **Stack remains Vue 3 + FastAPI.** No replatform is proposed; the existing technology choices are sound.
- **Data layer remains JSON files for the engagement.** We flag database migration as recommended future work, with a brief sizing note included in the architecture doc, but it is out of scope here.
- **Single environment assumed.** If Meridian has separate dev/staging/prod environments, please confirm at kickoff so we can plan deployment automation accordingly.
- **Source control.** Meridian provides repository access; we work on feature branches with pull-request review. PRs become the primary status artifact alongside weekly written updates.
- **Stakeholder availability.** R2 in particular requires Tanaka's input at the week-3 design checkpoint. Continuity here is the single biggest schedule risk.

---

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Meridian brand system unavailable or incomplete | Medium | Reduce D1 scope to component cleanup; document the gap in week-1 status |
| Reports defect count grows materially during discovery | High | T&M-NTE absorbs without re-paper; weekly written updates with effort estimates |
| VP Operations unavailable for R2 design checkpoints | Medium | Named risk surfaced at kickoff; backup decision-makers identified early |
| Sept 30 deadline tight given parallel R3 + R1 + R4 | Medium | Phased plan with weekly reviews; D1–D3 deferred if required scope slips |
| Mixed API patterns surface unexpected refactor cost | Low | Standardize only touched files; resist scope creep into untouched code |

---

## Summary

The shape of the engagement is straightforward: tests first, fixes second, the new feature on top, documentation throughout, and the desirable items folded in where the ceiling permits. The sequencing decisions in this document are choices, not defaults — and we have explained the reasoning so Meridian can challenge any of them at kickoff.
