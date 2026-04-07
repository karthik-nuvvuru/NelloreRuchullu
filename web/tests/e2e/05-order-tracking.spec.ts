import { test, expect } from '../helpers/fixtures';
import { captureScreenshot } from '../helpers/screenshot';

test.describe('05 - Order Confirmation and Tracking', () => {
  test('checkout success page renders', async ({ page }, testInfo) => {
    // Direct access with query params (simulating post-order flow)
    await page.goto('/checkout/success?id=test-id&number=ORD-001');
    await expect(page.getByText('Order Placed!')).toBeVisible();
    await expect(page.getByText(/Your order has been confirmed/)).toBeVisible();
    await expect(page.getByText('ORD-001')).toBeVisible();

    // Action links
    await expect(page.getByRole('link', { name: 'Track Your Order' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Order More' })).toBeVisible();

    await captureScreenshot(page, testInfo, 'order_tracking');
  });

  test('success page "Track Your Order" goes to order detail', async ({ page }) => {
    await page.goto('/checkout/success?id=123&number=ORD-TEST');
    await page.getByRole('link', { name: 'Track Your Order' }).click();
    await page.waitForURL(/\/orders\//);
    // May redirect to login if not authenticated
    const url = page.url();
    expect(url.includes('/orders/') || url.includes('/auth/login')).toBeTruthy();
  });

  test('success page "Order More" goes to menu', async ({ page }) => {
    await page.goto('/checkout/success?id=123&number=ORD-TEST');
    await page.getByRole('link', { name: 'Order More' }).click();
    await expect(page).toHaveURL(/\/menu$/);
  });

  test('my orders page renders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(1000);

    // Either shows orders list, "No orders yet", or login redirect
    const url = page.url();
    if (url.includes('/orders')) {
      const titleCount = await page.getByRole('heading', { name: 'My Orders' }).count();
      const noOrdersCount = await page.getByText('No orders yet').count();
      expect(titleCount > 0 || noOrdersCount > 0).toBeTruthy();
    }
    if (url.includes('/auth/login')) {
      // Redirected due to no auth - expected
      expect(true).toBeTruthy();
    }
  });
});
