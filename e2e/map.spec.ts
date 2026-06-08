import { test, expect } from '@playwright/test';

test('map page loads and shows controls', async ({ page }) => {
  await page.goto('/map');

  // Verify basemap switcher is visible
  await expect(page.getByText('Raster')).toBeVisible();
  await expect(page.getByText('Vector')).toBeVisible();

  // Verify layer controls
  await expect(page.getByText('Heatmap')).toBeVisible();
  await expect(page.getByText('Choropleth')).toBeVisible();
});
