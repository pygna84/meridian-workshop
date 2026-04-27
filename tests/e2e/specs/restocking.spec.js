import { test, expect } from '@playwright/test'
import { switchLanguage, setFilter, waitForApiIdle } from './helpers.js'

test.describe('Restocking recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking')
    await waitForApiIdle(page)
  })

  test('renders recommendations for items below reorder point', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Restocking Recommendations')
    // With no budget set, the recommendations table should have data rows.
    const rows = page.locator('.card').filter({ hasText: 'Recommended Orders' }).locator('tbody tr')
    await expect(rows.first()).toBeVisible()
    await expect(rows).not.toHaveCount(0)
  })

  test('budget ceiling splits recommendations into in-budget and deferred', async ({ page }) => {
    const budgetInput = page.locator('#budget-input')
    await budgetInput.fill('50000')
    await page.locator('.generate-btn').click()
    await waitForApiIdle(page)

    // Both summary cards visible: items in budget AND deferred section.
    await expect(page.locator('.stat-card', { hasText: 'Deferred' })).toBeVisible()
    await expect(page.locator('.deferred-card')).toBeVisible()

    const inBudgetRows = page.locator('.card').filter({ hasText: 'Recommended Orders' }).locator('tbody tr')
    const deferredRows = page.locator('.deferred-card tbody tr')
    await expect(inBudgetRows).not.toHaveCount(0)
    await expect(deferredRows).not.toHaveCount(0)
  })

  test('warehouse filter narrows recommendations', async ({ page }) => {
    const allWarehousesCount = await page
      .locator('.card').filter({ hasText: 'Recommended Orders' })
      .locator('tbody tr').count()

    await setFilter(page, 'Location', 'Tokyo')
    await waitForApiIdle(page)

    // Every row in the in-budget table should now be Tokyo (column index 3 = Warehouse).
    const warehouseCells = page
      .locator('.card').filter({ hasText: 'Recommended Orders' })
      .locator('tbody tr td:nth-child(4)')
    const count = await warehouseCells.count()
    expect(count).toBeLessThanOrEqual(allWarehousesCount)
    for (let i = 0; i < count; i++) {
      await expect(warehouseCells.nth(i)).toHaveText('Tokyo')
    }
  })

  test('Create PO opens modal prefilled from the recommendation', async ({ page }) => {
    const firstRow = page.locator('.card').filter({ hasText: 'Recommended Orders' }).locator('tbody tr').first()
    const recommendedQty = await firstRow.locator('td').nth(6).innerText() // Recommended Qty column

    await firstRow.locator('button.row-action').click()

    const modal = page.locator('.modal-container')
    await expect(modal).toBeVisible()
    await expect(modal.locator('.modal-title')).toHaveText('Create Purchase Order')

    // Quantity input should be prefilled with the recommended qty.
    const qtyInput = modal.locator('input[type="number"]').nth(0)
    const qtyValue = await qtyInput.inputValue()
    expect(qtyValue).toEqual(recommendedQty.replace(/[, ]/g, ''))
  })

  test('Submit Create PO marks the row as PO Created and disables the button', async ({ page }) => {
    const firstRow = page.locator('.card').filter({ hasText: 'Recommended Orders' }).locator('tbody tr').first()
    const sku = await firstRow.locator('td').nth(1).innerText()

    await firstRow.locator('button.row-action').click()

    const modal = page.locator('.modal-container')
    await modal.locator('input[type="text"]').fill('Test Supplier Co')
    await modal.locator('button[type="submit"]').click()

    // Success banner appears in the modal.
    await expect(modal.locator('.alert-success')).toBeVisible()

    // Close the modal.
    await modal.locator('button.btn-ghost, button.btn-primary').last().click()
    await expect(modal).not.toBeVisible()

    // The row that we acted on now shows the PO Created badge instead of the button.
    const targetRow = page.locator('.card').filter({ hasText: 'Recommended Orders' })
      .locator('tbody tr').filter({ hasText: sku })
    await expect(targetRow.locator('.po-created')).toContainText('PO Created')
    await expect(targetRow.locator('button.row-action')).toHaveCount(0)
  })

  test('switching to Japanese translates the page chrome', async ({ page }) => {
    await switchLanguage(page, '日本語')
    await waitForApiIdle(page)

    await expect(page.locator('h2')).toHaveText('補充推奨')
    // Action button label translates.
    const firstAction = page.locator('button.row-action').first()
    await expect(firstAction).toHaveText('発注作成')
  })
})
