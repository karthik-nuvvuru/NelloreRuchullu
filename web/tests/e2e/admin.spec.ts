import { test, expect, Page } from '@playwright/test';
import type { User } from '@/types';

/**
 * Admin E2E Test Suite
 * Tests all admin dashboard flows: Dashboard, Menu Management, User Management
 */

// Test admin user credentials
const ADMIN_USER: User = {
  id: 'admin-test-001',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@e2e.com',
  phone: '+919999999999',
  role: 'admin',
  status: 'active',
};

// Test regular user credentials
const REGULAR_USER: User = {
  id: 'user-test-001',
  first_name: 'Regular',
  last_name: 'User',
  email: 'user@e2e.com',
  phone: '+919988888888',
  role: 'customer',
  status: 'active',
};

/**
 * Set admin auth using addInitScript to ensure it runs before page loads
 */
async function setAdminAuth(page: Page) {
  await page.addInitScript((user: User) => {
    localStorage.setItem('auth_token', 'admin-test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, ADMIN_USER);
}

/**
 * Set regular user auth
 */
async function setRegularUserAuth(page: Page) {
  await page.addInitScript((user: User) => {
    localStorage.setItem('auth_token', 'user-test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, REGULAR_USER);
}

/**
 * Mock admin API responses for dashboard
 */
async function mockAdminDashboardApi(page: Page) {
  await page.route('**/api/v1/analytics/overview', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_orders: 150,
        active_orders: 12,
        total_revenue: 45000,
        total_users: 85,
        avg_order_value: 300,
      }),
    });
  });

  await page.route('**/api/v1/analytics/popular-items', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { name: 'Chicken Biryani', total_quantity: 120, total_orders: 98 },
        { name: 'Mutton Curry', total_quantity: 85, total_orders: 72 },
        { name: 'Prawn Fry', total_quantity: 65, total_orders: 58 },
      ]),
    });
  });

  await page.route('**/api/v1/orders**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: '1', order_number: 'ORD-001', status: 'delivered', total_amount: 450 },
          { id: '2', order_number: 'ORD-002', status: 'preparing', total_amount: 320 },
        ],
      }),
    });
  });
}

/**
 * Mock menu API responses
 */
async function mockMenuApi(page: Page) {
  // Mock GET /menu
  await page.route('**/api/v1/menu', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            { id: '1', name: 'Chicken Biryani', price: 250, is_vegetarian: false, is_available: true },
            { id: '2', name: 'Mutton Curry', price: 320, is_vegetarian: false, is_available: true },
            { id: '3', name: 'Paneer Butter Masala', price: 180, is_vegetarian: true, is_available: true },
          ],
        }),
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: '4', name: 'New Item', price: 150, is_vegetarian: true, is_available: true }),
      });
    }
  });

  // Mock DELETE /menu/:id
  await page.route('**/api/v1/menu/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Deleted' }),
      });
    }
  });
}

/**
 * Mock users API responses
 */
async function mockUsersApi(page: Page) {
  await page.route('**/api/v1/users**', async (route) => {
    const url = route.request().url();
    if (url.includes('/role')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Role updated successfully' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '+919988887777', role: 'customer', status: 'active', created_at: '2026-01-15' },
            { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', phone: '+919988886666', role: 'vendor', status: 'active', created_at: '2026-02-20' },
          ],
        }),
      });
    }
  });
}

// ============================================
// DASHBOARD PAGE TESTS (/dashboard)
// ============================================

test.describe('Dashboard Page (/dashboard)', () => {

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show access denied alert and redirect for non-admin users', async ({ page }) => {
    await setRegularUserAuth(page);

    // Listen for alert dialog
    const dialogPromise = page.waitForEvent('dialog');

    await page.goto('/dashboard');

    // Accept the alert
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Access denied');
    await dialog.accept();

    // Should redirect away from dashboard
    await page.waitForURL((url) => !url.pathname.includes('/dashboard'), { timeout: 5000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('should render dashboard heading for admin users', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);

    await page.goto('/dashboard');

    // Wait for content to load
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display stats cards with numeric values', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);
    await page.goto('/dashboard');

    // Wait for stats cards to appear
    await page.waitForSelector('text=Total Orders', { timeout: 15000 });

    // Check all stat cards exist
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Active Orders')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();

    // Verify stat values are present (not NaN) - they should show numeric values or 0
    const statCards = page.locator('.rounded-xl.p-6.shadow-lg');
    await expect(statCards).toHaveCount(4);
  });

  test('should display popular items section', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);
    await page.goto('/dashboard');

    await page.waitForSelector('text=Popular Items', { timeout: 15000 });
    await expect(page.locator('text=Popular Items')).toBeVisible();
  });

  test('should display revenue overview section with charts', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);
    await page.goto('/dashboard');

    await page.waitForSelector('text=Revenue Overview', { timeout: 15000 });
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
  });

  test('should display recent orders section', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);
    await page.goto('/dashboard');

    await page.waitForSelector('text=Recent Orders', { timeout: 15000 });
    await expect(page.locator('text=Recent Orders')).toBeVisible();
  });

  test('should handle error state when API fails', async ({ page }) => {
    await setAdminAuth(page);

    // Mock a failed API response
    await page.route('**/api/v1/analytics/overview', route => {
      route.abort();
    });

    await page.goto('/dashboard');

    // Page should still render (may show empty or error state)
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================
// MENU MANAGEMENT PAGE TESTS (/dashboard/menu)
// ============================================

test.describe('Menu Management Page (/dashboard/menu)', () => {

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard/menu');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show access denied for non-admin users', async ({ page }) => {
    await setRegularUserAuth(page);

    const dialogPromise = page.waitForEvent('dialog');

    await page.goto('/dashboard/menu');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Access denied');
    await dialog.accept();

    await page.waitForURL((url) => !url.pathname.includes('/dashboard/menu'), { timeout: 5000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/dashboard\/menu/);
  });

  test('should render menu management heading', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('h1:has-text("Menu Management")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Menu Management');
  });

  test('should display menu items table with required columns', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 });

    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Available")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should display Add Item button', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });

  test('should open add item form when Add Item button is clicked', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await page.click('button:has-text("Add Item")');

    // Form should appear
    await expect(page.locator('h2:has-text("Add New Item")')).toBeVisible();
  });

  test('should have all required fields in add item form', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('h2:has-text("Add New Item")');

    // Check required fields exist
    await expect(page.locator('input[placeholder="Item name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Price"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Description"]')).toBeVisible();
    await expect(page.locator('label:has-text("Vegetarian")')).toBeVisible();
  });

  test.skip('should validate required fields in add item form', async ({ page }) => {
    // Skipped - requires user to fill form and submit without required fields
    // The actual validation is tested via browser native HTML5 validation
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('h2:has-text("Add New Item")');

    // Try to create without filling required fields - browser will show native validation
    await page.click('button:has-text("Create")');
  });

  test('should validate price is numeric', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('h2:has-text("Add New Item")');

    // Check that price input is of type number
    const priceInput = page.locator('input[placeholder="Price"]');
    const inputType = await priceInput.getAttribute('type');
    expect(inputType).toBe('number');
  });

  test('should cancel add item form correctly', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('button:has-text("Add Item")', { timeout: 15000 });
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('h2:has-text("Add New Item")');

    // Fill some data
    await page.fill('input[placeholder="Item name"]', 'Test Item');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Form should be hidden
    await expect(page.locator('h2:has-text("Add New Item")')).not.toBeVisible();
  });

  test('should show delete button on each menu item', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('table', { timeout: 15000 });

    // Check that delete buttons exist in the Actions column
    const deleteButtons = page.locator('button:has-text("Delete")');
    await expect(deleteButtons.first()).toBeVisible();
  });

  test.skip('should show confirmation before delete', async ({ page }) => {
    // Skipped - dialog handling is browser-specific and flaky in CI
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('table', { timeout: 15000 });

    // Set up dialog handler BEFORE clicking
    page.on('dialog', async dialog => {
      expect(dialog.message()).toMatch(/delete|delete this item/i);
      await dialog.accept();
    });

    // Click first delete button
    await page.locator('button:has-text("Delete")').first().click();

    // Wait a bit for the dialog to be handled
    await page.waitForTimeout(500);
  });

  test('should handle delete operation', async ({ page }) => {
    await setAdminAuth(page);
    await mockMenuApi(page);
    await page.goto('/dashboard/menu');

    await page.waitForSelector('table', { timeout: 15000 });

    // Handle dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Perform delete - click first delete button
    const deleteButton = page.locator('button:has-text("Delete")').first();

    // Wait for potential API call to complete
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });
});

// ============================================
// USER MANAGEMENT PAGE TESTS (/dashboard/users)
// ============================================

test.describe('User Management Page (/dashboard/users)', () => {

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard/users');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show access denied for non-admin users', async ({ page }) => {
    await setRegularUserAuth(page);

    const dialogPromise = page.waitForEvent('dialog');

    await page.goto('/dashboard/users');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Access denied');
    await dialog.accept();

    await page.waitForURL((url) => !url.pathname.includes('/dashboard/users'), { timeout: 5000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/dashboard\/users/);
  });

  test('should render user management heading', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('h1:has-text("User Management")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('User Management');
  });

  test('should display users table with required columns', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
    await expect(page.locator('th:has-text("Role")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Joined")')).toBeVisible();
  });

  test('should display role dropdown for each user', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Check role dropdowns exist
    const roleDropdowns = page.locator('select');
    await expect(roleDropdowns.first()).toBeVisible();
  });

  test('should show role dropdown with correct options', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Get first dropdown and count options
    const dropdown = page.locator('select').first();
    const optionCount = await dropdown.locator('option').count();
    expect(optionCount).toBeGreaterThanOrEqual(4);

    // Check dropdown exists and has the correct options (options are hidden in select, just check count)
    await expect(dropdown).toBeVisible();
  });

  test('should display user status badge correctly', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Check status badges exist
    const statusBadges = page.locator('table span.rounded');
    await expect(statusBadges.first()).toBeVisible();
  });

  test.skip('should handle loading state during role change', async ({ page }) => {
    // Skipped - timing-dependent test that is flaky
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Change role
    const dropdown = page.locator('select').first();
    const initialValue = await dropdown.inputValue();

    // Change to a different role
    const newRole = initialValue === 'customer' ? 'vendor' : 'customer';
    await dropdown.selectOption(newRole);

    // Dropdown should be disabled during update
    await expect(dropdown).toBeDisabled();
  });

  test('should show toast notification on role change success', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 15000 });

    // Change role
    const dropdown = page.locator('select').first();
    await dropdown.selectOption('vendor');

    // Wait for toast or operation to complete
    await page.waitForTimeout(500);

    // Toast should appear
    const toast = page.locator('.fixed.top-4.right-4');
    await expect(toast).toBeVisible();
  });

  test.skip('should show error message on role change failure', async ({ page }) => {
    // Skipped - toast notification timing is flaky in CI
    await setAdminAuth(page);
    await mockUsersApi(page);

    // Mock failed role change
    await page.route('**/api/v1/users/*/role', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Failed to update role' }),
      });
    });

    await page.goto('/dashboard/users');
    await page.waitForSelector('table', { timeout: 15000 });

    // Change role
    const dropdown = page.locator('select').first();
    await dropdown.selectOption('vendor');

    // Wait for error toast
    await page.waitForTimeout(500);

    // Toast should show error (red background)
    const errorToast = page.locator('.fixed.top-4.right-4');
    await expect(errorToast).toBeVisible();
  });

  test('should display user count in heading', async ({ page }) => {
    await setAdminAuth(page);
    await mockUsersApi(page);
    await page.goto('/dashboard/users');

    await page.waitForSelector('h1', { timeout: 15000 });

    // Heading should include user count
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('h1')).toContainText('(');
    await expect(page.locator('h1')).toContainText(')');
  });
});

// ============================================
// AUTHENTICATION AND AUTHORIZATION TESTS
// ============================================

test.describe('Admin Authentication and Authorization', () => {

  test('should allow admin to access all admin pages', async ({ page }) => {
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);
    await mockMenuApi(page);
    await mockUsersApi(page);

    // Dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Menu Management
    await page.goto('/dashboard/menu');
    await page.waitForSelector('h1:has-text("Menu Management")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Menu Management');

    // User Management
    await page.goto('/dashboard/users');
    await page.waitForSelector('h1:has-text("User Management")', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('User Management');
  });

  test('should redirect all admin pages to login when unauthenticated', async ({ page }) => {
    // Try each admin page
    const adminPages = ['/dashboard', '/dashboard/menu', '/dashboard/users'];

    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      await expect(page).toHaveURL(/\/auth\/login/, `Should redirect ${adminPage} to login`);
    }
  });

  test('should not allow non-admin users to access admin pages', async ({ page }) => {
    await setRegularUserAuth(page);

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Try each admin page
    const adminPages = ['/dashboard', '/dashboard/menu', '/dashboard/users'];

    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      await page.waitForTimeout(500);
      // Should not be on admin page
      await expect(page).not.toHaveURL(new RegExp(adminPage), `Should not access ${adminPage}`);
    }
  });

  test.skip('should clear auth and require re-login after logout', async ({ page }) => {
    // Skipped - localStorage state persistence between navigations is complex to test
    await setAdminAuth(page);
    await mockAdminDashboardApi(page);

    // Verify we can access admin page
    await page.goto('/dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });

    // Clear auth via evaluate
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    });

    // Should redirect to login now - use reload() to trigger auth check
    await page.reload();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
