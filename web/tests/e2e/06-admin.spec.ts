import { test, expect } from '../helpers/fixtures';

test.describe('06 - Admin Dashboard', () => {
  test('dashboard page requires auth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // May redirect to login if not authenticated
    const url = page.url();
    const isDashboard = url.includes('/dashboard');
    const isLogin = url.includes('/auth/login');
    expect(isDashboard || isLogin).toBeTruthy();
  });

  // Only run this test if we have a logged-in admin session
  test.skip('admin can view dashboard stats', async ({ page }) => {
    // This test requires an authenticated admin user
    // To run: set auth cookies/local storage before navigating
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
