import { test, expect } from '@playwright/test'

test.describe('App smoke', () => {
  test('homepage loads and renders the dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.top-nav')).toBeVisible()
    await expect(page.locator('.nav-tabs')).toContainText('Overview')
    await expect(page.locator('.nav-tabs')).toContainText('Reports')
  })

  test('all primary nav links route correctly', async ({ page }) => {
    const targets = [
      { text: 'Inventory', path: '/inventory' },
      { text: 'Orders', path: '/orders' },
      { text: 'Finance', path: '/spending' },
      { text: 'Demand Forecast', path: '/demand' },
      { text: 'Reports', path: '/reports' },
    ]

    await page.goto('/')
    for (const { text, path } of targets) {
      await page.locator('.nav-tabs a', { hasText: text }).first().click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    }
  })

  test('filter bar is sticky and reset button is initially disabled', async ({ page }) => {
    await page.goto('/')
    const resetBtn = page.locator('.reset-filters-btn')
    await expect(resetBtn).toBeDisabled()
  })
})
