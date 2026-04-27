// Shared helpers for the Meridian e2e specs.

/**
 * Open the language switcher and pick the named locale.
 *  page    — Playwright page
 *  locale  — 'English' or '日本語'
 */
export async function switchLanguage(page, locale) {
  await page.locator('.language-button').click()
  await page.locator('.dropdown-item', { hasText: locale }).click()
  // dropdown closes after selection
  await page.locator('.dropdown-item').first().waitFor({ state: 'detached' }).catch(() => {})
}

/**
 * Pick a value in a FilterBar select by its visible label.
 *  page  — Playwright page
 *  label — exact label text shown above the select (e.g. 'Time Period', 'Location')
 *  value — option value attribute (e.g. 'Tokyo', '2025-05', 'all')
 */
export async function setFilter(page, label, value) {
  const group = page.locator('.filter-group').filter({ hasText: label })
  await group.locator('select').selectOption(value)
}

/**
 * Wait for any in-flight network requests against the API to settle so we can
 * assert against rendered data rather than a stale snapshot.
 */
export async function waitForApiIdle(page) {
  await page.waitForLoadState('networkidle')
}
