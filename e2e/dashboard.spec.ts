import { test, expect } from '@playwright/test';

test('dashboard page loads and displays cards', async ({ page }) => {
  await page.goto('/');

  // Wait for the cards to load
  await expect(page.locator('.text-2xl.font-bold')).toHaveCount(4);

  // Check if table exists
  await expect(page.locator('table')).toBeVisible();

  // Test filter applying
  const districtSelect = page.locator('button[role="combobox"]').first();
  await districtSelect.click();
  // Assume there is an option, we just verify the dropdown opens
  await expect(page.getByRole('listbox')).toBeVisible();
});
