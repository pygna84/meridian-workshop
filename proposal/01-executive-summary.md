# Executive Summary

**RFP:** MC-2026-0417 — Inventory Dashboard Modernization
**Prepared for:** Meridian Components, Inc.
**Date:** April 27, 2026

---

Meridian's operations team depends on the inventory dashboard every day, and right now it isn't carrying its weight. The Reports module is unreliable, restocking decisions still happen in spreadsheets, and IT can't safely approve changes because there's no test coverage to fall back on. The previous engagement ended with the work unfinished and minimal documentation handed over. We've reviewed what's there, and we're confident we can close the gap by the end of Q3.

Our approach is built around three principles:

**Unblock IT first.** Automated browser tests (R3) aren't the last item we ship — they're the foundation. We'll stand up an end-to-end test harness in the first two weeks so every subsequent change lands behind a green build. This converts IT from gatekeeper to partner.

**Fix what's broken before adding what's new.** The Reports remediation (R1) is partly known and partly discovery. We'll triage the eight logged defects in week one, fix them in priority order, and use that work to build our mental model of the codebase before tackling the Restocking view (R2). VP Operations gets visible wins inside the first month.

**Document as we go.** The architecture overview (R4) gets drafted during onboarding and updated through the engagement, not bolted on at the end. Meridian IT inherits a living document, not a snapshot.

**Commercials.** T&M with a not-to-exceed ceiling, phased by requirement. This protects Meridian against scope drift on R2 (where discovery is highest) while giving us room to do R1 properly. Detailed assumptions and pricing are in the sections that follow.

**Why us.** We've taken over half-finished engagements before. We know the pattern: light-touch documentation, mixed code conventions, defects logged but not triaged. Our differentiator is sequencing — getting tests in early, surfacing risk in writing, and shipping incrementally so Meridian's team feels progress every week, not just at milestones.

We'd welcome a kickoff call with Procurement, Operations, and IT in the same room. The faster all three voices are in the conversation, the better the engagement runs.
