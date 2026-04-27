import { test, expect } from '@playwright/test'
import { setFilter, waitForApiIdle } from './helpers.js'

test.describe('Warehouse switching via FilterBar', () => {
  test('inventory list filters down when a warehouse is selected', async ({ page }) => {
    await page.goto('/inventory')
    await waitForApiIdle(page)

    const initialRows = await page.locator('table tbody tr').count()
    expect(initialRows).toBeGreaterThan(0)

    await setFilter(page, 'Location', 'Tokyo')
    await waitForApiIdle(page)

    const tokyoRows = await page.locator('table tbody tr').count()
    expect(tokyoRows).toBeGreaterThan(0)
    expect(tokyoRows).toBeLessThan(initialRows)
  })

  test('reset button enables once any filter is active and clears it', async ({ page }) => {
    await page.goto('/inventory')
    await waitForApiIdle(page)

    const resetBtn = page.locator('.reset-filters-btn')
    await expect(resetBtn).toBeDisabled()

    await setFilter(page, 'Location', 'London')
    await expect(resetBtn).toBeEnabled()

    await resetBtn.click()
    await expect(resetBtn).toBeDisabled()

    const locationSelect = page.locator('.filter-group').filter({ hasText: 'Location' }).locator('select')
    await expect(locationSelect).toHaveValue('all')
  })

  test('warehouse filter persists across navigation', async ({ page }) => {
    await page.goto('/inventory')
    await setFilter(page, 'Location', 'San Francisco')

    await page.locator('.nav-tabs a', { hasText: 'Reports' }).first().click()
    await expect(page).toHaveURL(/\/reports$/)

    const locationSelect = page.locator('.filter-group').filter({ hasText: 'Location' }).locator('select')
    await expect(locationSelect).toHaveValue('San Francisco')
  })
})
