# Meridian — End-to-End Test Suite

Playwright browser tests covering Meridian's critical user flows. These tests
are the harness IT asked for as part of R3: every PR should land green here
before merge.

## What's covered today

| Spec | Flow |
|---|---|
| `smoke.spec.js` | App boots, primary nav routes, FilterBar reset state |
| `reports.spec.js` | Reports filters reshape data, May-key regression, locale + currency switch, accessibility on chart bars, empty-state messaging |
| `warehouse-switching.spec.js` | Warehouse selector filters Inventory, persists across navigation, reset clears |

Restocking (R2) coverage is added in a follow-up once that PR is merged to
main, since the harness branches off main and Restocking isn't there yet.

## Running locally

The dev servers must be running on the standard ports — start them with
`/start` (or `./scripts/start.sh`) before invoking the suite. Then:

```bash
cd tests/e2e
npm install                 # one-time
npx playwright install      # one-time, downloads browsers
npm test                    # headless run, list + html reporter
npm run test:ui             # interactive UI mode
npm run test:headed         # watch the browser run
npm run test:report         # open the last HTML report
```

To have Playwright start the servers itself (CI mode), set
`E2E_AUTOSTART=1` before `npm test`. The default assumes long-lived dev
servers because that matches the developer workflow.

## Conventions

- Specs live in `specs/` and import from `specs/helpers.js`.
- Tests are serialized (`workers: 1`) because the backend's mock data is
  in-memory and shared. Parallel runs would race on filter-state effects.
- Selectors prefer existing structural classes (`.filter-group`,
  `.nav-tabs a`, `.reports-table`) over data-test-id attributes. As the
  app stabilizes we should add `data-test-id` hooks to reduce brittleness.

## Known gaps (next iteration)

- Restocking flow + Create-PO modal once R2 is merged.
- API-level tests for the new restocking endpoints.
- CI wiring (GitHub Actions workflow) so PRs report status checks.
- Visual regression for the Reports bar chart.
