import { test, expect } from '../helpers/fixtures';
import { captureScreenshot } from '../helpers/screenshot';

test.describe('01 - Homepage Load', () => {
  test('homepage loads with hero and menu sections', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NelloreRuchullu/i);

    // Hero section
    await expect(page.getByRole('heading', { name: /Authentic Nellore Cuisine/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Taste the tradition, delivered to your door/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Order Now' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible();

    // Categories section
    await expect(page.getByRole('heading', { name: 'Browse Categories' })).toBeVisible();

    // Popular Items section
    await expect(page.getByRole('heading', { name: 'Popular Items' })).toBeVisible();
    await expect(page.getByRole('link', { name: /View All/i })).toBeVisible();

    // About section
    await expect(page.getByRole('heading', { name: 'About NelloreRuchullu' })).toBeVisible();

    // No duplicate render - hero heading should appear exactly once
    const heroHeadings = await page.getByRole('heading', { name: /Authentic Nellore Cuisine/i }).count();
    expect(heroHeadings).toBe(1);

    await captureScreenshot(page, testInfo, 'homepage');
  });

  test('hero links navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Order Now links to /menu
    await page.getByRole('link', { name: 'Order Now' }).click();
    await expect(page).toHaveURL(/\/menu$/);

    // Go back and check Sign Up
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign Up' }).first().click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
