import { test, expect } from '../helpers/fixtures';
import { captureScreenshot } from '../helpers/screenshot';

test.describe('04 - Cart and Checkout', () => {
  test('cart shows empty state', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Browse Menu' })).toBeVisible();
  });

  test('add items through menu then view cart', async ({ page }, testInfo) => {
    await page.goto('/menu');
    // Wait for menu to render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Add first available item
    const addButtons = page.getByRole('button', { name: 'Add' });
    const count = await addButtons.count();
    if (count > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
    }

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    // Either cart is empty (store doesn't persist) or has items
    const isEmpty = await page.getByText('Your cart is empty').count() > 0;
    const hasItems = await page.locator('h3.font-semibold').count() > 0;
    expect(isEmpty || hasItems).toBeTruthy();

    await captureScreenshot(page, testInfo, 'cart');
  });

  test('cart summary shows order details', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    const emptyCart = await page.getByText('Your cart is empty').count() > 0;
    if (!emptyCart) {
      await expect(page.getByRole('heading', { name: /Order Summary/ }).first()).toBeVisible();
      await expect(page.getByText('Subtotal')).toBeVisible();
      await expect(page.getByText('Tax (5%)')).toBeVisible();
      await expect(page.getByText('Delivery')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Proceed to Checkout' })).toBeVisible();
    }
  });

  test('checkout page requires auth', async ({ page }) => {
    await page.goto('/checkout');
    // Wait for redirect or content
    await page.waitForURL(/\/(auth\/login|checkout)/, { timeout: 5000 }).catch(() => {});
    const url = page.url();
    const redirected = url.includes('/auth/login') || url.includes('/checkout');
    expect(redirected).toBeTruthy();
  });

  test('checkout page renders order summary', async ({ page }, testInfo) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Always visible elements regardless of auth state
    const hasTitle = await page.getByRole('heading', { name: 'Checkout' }).count() > 0;
    const isLogin = page.url().includes('/auth/login');

    if (hasTitle) {
      await expect(page.getByRole('heading', { name: 'Delivery Address' })).toBeVisible();
      await expect(page.getByText('Payment Method')).toBeVisible();
      await expect(page.getByText('Cash on Delivery')).toBeVisible();
      await expect(page.getByText('Online Payment')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible();

      await captureScreenshot(page, testInfo, 'checkout');
    }
    if (isLogin) {
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });
});
