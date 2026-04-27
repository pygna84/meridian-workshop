import { test, expect } from '@playwright/test'
import { switchLanguage, setFilter, waitForApiIdle } from './helpers.js'

test.describe('Reports module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await waitForApiIdle(page)
  })

  test('renders quarterly performance and monthly trend cards', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Performance Reports')
    await expect(page.locator('.card-title')).toContainText(['Quarterly Performance', 'Monthly Revenue Trend', 'Month-over-Month Analysis'])
    // Bar chart should render at least one bar after data loads
    await expect(page.locator('.bar')).not.toHaveCount(0)
  })

  test('warehouse filter reshapes both quarterly and monthly tables', async ({ page }) => {
    const initialOrders = await page.locator('.reports-table tbody tr').first().locator('td').nth(1).innerText()

    await setFilter(page, 'Location', 'Tokyo')
    await waitForApiIdle(page)

    const tokyoOrders = await page.locator('.reports-table tbody tr').first().locator('td').nth(1).innerText()
    expect(tokyoOrders).not.toEqual(initialOrders)
  })

  test('time period filter exposes May correctly (regression: months.may was missing)', async ({ page }) => {
    const periodSelect = page.locator('.filter-group').filter({ hasText: 'Time Period' }).locator('select')

    // The dropdown's <option> for 2025-05 must render the localized name "May",
    // not the raw key string `months.may` that the previous build was leaking.
    const mayOption = periodSelect.locator('option[value="2025-05"]')
    await expect(mayOption).toHaveText('May')
  })

  test('empty filter combination renders the empty-state message', async ({ page }) => {
    // Backordered + Tokyo + April + Power Supplies is unlikely to match anything.
    await setFilter(page, 'Location', 'Tokyo')
    await setFilter(page, 'Category', 'power supplies')
    await setFilter(page, 'Order Status', 'backordered')
    await setFilter(page, 'Time Period', '2025-04')
    await waitForApiIdle(page)

    const emptyMessages = page.locator('.empty')
    // At least one of the cards should report no data for the current filters.
    await expect(emptyMessages.first()).toBeVisible()
  })

  test('switching to Japanese translates page chrome and currency', async ({ page }) => {
    await switchLanguage(page, '日本語')
    await waitForApiIdle(page)

    await expect(page.locator('h2')).toHaveText('パフォーマンスレポート')
    // Currency should flip to JPY. Intl.NumberFormat('ja-JP') uses the fullwidth
    // yen symbol U+FFE5 (￥) rather than the ASCII U+00A5 (¥) — accept either.
    const firstRevenueCell = page.locator('.reports-table tbody tr').first().locator('td').nth(2)
    await expect(firstRevenueCell).toContainText(/[¥￥]/)
  })

  test('bar chart bars expose accessible labels', async ({ page }) => {
    const firstBar = page.locator('.bar').first()
    const ariaLabel = await firstBar.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toMatch(/\$|¥/)
  })
})
