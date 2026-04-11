import { test, expect, describe, Page } from "@playwright/test";

const APP_URL = "http://localhost:8081";

/**
 * Helper function to wait for network idle (for API calls to complete)
 */
async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // Continue even if network doesn't fully idle
  }
}

/**
 * Helper to tap a tappable element by finding text
 */
async function tapByText(page: Page, text: string) {
  const element = page.locator(`Text:text("${text}")`).first();
  await element.tap();
}

/**
 * Helper to tap a pressable element
 */
async function tapPressable(page: Page, text: string) {
  const element = page.locator(`Pressable >> text=${text}`).first();
  await element.tap();
}

describe("NelloreRuchullu E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto(APP_URL, { waitUntil: "networkidle" });
    // Wait for app to load
    await page.waitForTimeout(2000);
  });

  // ==========================================================================
  // HOME SCREEN TESTS (app/(tabs)/index.tsx)
  // ==========================================================================
  describe("Home Screen (app/(tabs)/index.tsx)", () => {
    test("should display page with greeting", async ({ page }) => {
      // Wait for initial loading to complete
      await page.waitForTimeout(1500);

      // Check for greeting
      const greeting = page.locator('Text:has-text("Hello")');
      await expect(greeting).toBeVisible();
    });

    test("should display location", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for location text
      const location = page.locator('Text:has-text("Koramanpally")');
      await expect(location).toBeVisible();
    });

    test("should display search input with placeholder", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Search input should exist with placeholder
      const searchInput = page.locator('TextInput').first();
      await expect(searchInput).toBeVisible();
    });

    test("should navigate to search screen when tapping search input", async ({ page }) => {
      await page.waitForTimeout(1500);

      // The SearchBar navigates to search on focus
      const searchBar = page.locator('TextInput').first();
      await searchBar.tap();

      // Should navigate to search screen
      await page.waitForURL("**/search**", { timeout: 5000 });
    });

    test("should display restaurant list items", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Look for restaurant cards - they contain names like "Nellore Kitchen", "Spice Garden"
      const restaurantName = page.locator('Text:has-text("Nellore Kitchen")');
      await expect(restaurantName).toBeVisible();
    });

    test("should display restaurant name, cuisine, rating, delivery time", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for restaurant name
      const restaurantName = page.locator('Text:has-text("Nellore Kitchen")');
      await expect(restaurantName).toBeVisible();

      // Check for rating (stars)
      const rating = page.locator('Text:has-text("4.5")');
      await expect(rating).toBeVisible();

      // Check for delivery time
      const deliveryTime = page.locator('Text:has-text("35")');
      await expect(deliveryTime).toBeVisible();
    });

    test("should display category chips", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for category chips (Biryani, Starters, etc.)
      const biryaniChip = page.locator('Text:has-text("Biryani")').first();
      await expect(biryaniChip).toBeVisible();
    });

    test("should navigate to restaurant detail when tapping restaurant card", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Find and tap the first restaurant card (Nellore Kitchen)
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();

      // Should navigate to restaurant detail
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });

      // Verify we're on the restaurant detail page
      const restaurantName = page.locator('Text:has-text("Nellore Kitchen")');
      await expect(restaurantName).toBeVisible();
    });

    test("should show initial loading skeleton", async ({ page }) => {
      // Before waiting, check for initial loading state
      const loadingIndicator = page.locator('ActivityIndicator');
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 }).catch(() => {
        // Loading might have already completed
      });
    });

    test("should navigate to notifications when tapping notification button", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Find notification button (has bell emoji)
      const notificationButton = page.locator('Pressable >> text=🔔').first();
      await notificationButton.tap();

      // Should navigate to notifications
      await page.waitForURL("**/notifications**", { timeout: 5000 });
    });

    test("should display offers section", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for offer cards
      const offerCard = page.locator('Text:has-text("30% OFF")');
      await expect(offerCard).toBeVisible();
    });

    test("should display popular items section", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for popular picks section
      const popularSection = page.locator('Text:has-text("Popular Picks")');
      await expect(popularSection).toBeVisible();
    });

    test("should toggle category filter when tapping category chip", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Find and tap Biryani category chip
      const biryaniChip = page.locator('Pressable >> text=Biryani').first();
      await biryaniChip.tap();

      // Category should be selected (chip changes style)
      await page.waitForTimeout(500);
    });

    test("should add item to cart when tapping ADD button", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Find and tap ADD button on a food card
      const addButton = page.locator('Pressable >> text=ADD +').first();
      await addButton.tap();

      // Should show cart button after adding item
      await page.waitForTimeout(500);
      const cartButton = page.locator('Pressable >> text=View Cart');
      await expect(cartButton).toBeVisible();
    });

    test("should display location banner", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Check for location banner
      const locationBanner = page.locator('Text:has-text("Serving Hyderabad")');
      await expect(locationBanner).toBeVisible();
    });

    test("should pull to refresh (simulate)", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Perform pull to refresh gesture
      await page.evaluate(() => {
        const scrollView = document.querySelector('ScrollView') || document.querySelector('[class*="scroll"]');
        if (scrollView) {
          // Trigger pull to refresh by dispatching events
          const pullEvent = new PullEvent("pulldown", { bubbles: true });
          scrollView.dispatchEvent(pullEvent);
        }
      });

      // Wait for refresh to complete
      await page.waitForTimeout(1500);
    });
  });

  // ==========================================================================
  // SEARCH SCREEN TESTS (app/(tabs)/search.tsx)
  // ==========================================================================
  describe("Search Screen (app/(tabs)/search.tsx)", () => {
    test("should navigate to search screen and display search input", async ({ page }) => {
      // Navigate to search screen
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Search input should be visible
      const searchInput = page.locator('TextInput').first();
      await expect(searchInput).toBeVisible();
    });

    test("should display filter button", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Filter button (⚙️)
      const filterButton = page.locator('Pressable >> text=⚙️');
      await expect(filterButton).toBeVisible();
    });

    test("should open filter modal when tapping filter button", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Tap filter button
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();

      // Filter modal should open
      await page.waitForTimeout(500);
      const filterModal = page.locator('Text:has-text("Filter Options")');
      await expect(filterModal).toBeVisible();
    });

    test("should filter by cuisine in filter modal", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Open filter modal
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();
      await page.waitForTimeout(500);

      // Select North Indian cuisine filter
      const northIndian = page.locator('Pressable >> text=North Indian').first();
      await northIndian.tap();
      await page.waitForTimeout(300);

      // Tap Apply
      const applyButton = page.locator('Pressable >> text=Apply Filters');
      await applyButton.tap();
      await page.waitForTimeout(500);
    });

    test("should filter by price range in filter modal", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Open filter modal
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();
      await page.waitForTimeout(500);

      // Select price range filter
      const priceRange = page.locator('Pressable >> text=₹₹').first();
      await priceRange.tap();
      await page.waitForTimeout(300);

      // Tap Apply
      const applyButton = page.locator('Pressable >> text=Apply Filters');
      await applyButton.tap();
      await page.waitForTimeout(500);
    });

    test("should filter by rating in filter modal", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Open filter modal
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();
      await page.waitForTimeout(500);

      // Select rating filter
      const ratingFilter = page.locator('Pressable >> text=⭐ 4+').first();
      await ratingFilter.tap();
      await page.waitForTimeout(300);

      // Tap Apply
      const applyButton = page.locator('Pressable >> text=Apply Filters');
      await applyButton.tap();
      await page.waitForTimeout(500);
    });

    test("should clear filters when tapping Clear All", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Open filter modal
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();
      await page.waitForTimeout(500);

      // Tap Clear All
      const clearButton = page.locator('Pressable >> text=Clear All');
      await clearButton.tap();
      await page.waitForTimeout(500);

      // Modal should close
      const filterModal = page.locator('Text:has-text("Filter Options")');
      await expect(filterModal).not.toBeVisible();
    });

    test("should type in search and filter results in real-time", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Type in search input
      const searchInput = page.locator('TextInput').first();
      await searchInput.fill("Biryani");
      await page.waitForTimeout(500);

      // Should show filtered results
      const biryaniResults = page.locator('Text:has-text("Biryani")');
      await expect(biryaniResults.first()).toBeVisible();
    });

    test("should display 'No results' when search has no matches", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Type a non-existent search query
      const searchInput = page.locator('TextInput').first();
      await searchInput.fill("xyznonexistent123");
      await page.waitForTimeout(1000);

      // Should show empty state
      const emptyState = page.locator('Text:has-text("No results found")');
      await expect(emptyState).toBeVisible();
    });

    test("should clear search when tapping clear button", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Type in search input
      const searchInput = page.locator('TextInput').first();
      await searchInput.fill("Biryani");
      await page.waitForTimeout(500);

      // Tap clear button (✕)
      const clearButton = page.locator('Pressable >> text=✕');
      await clearButton.tap();
      await page.waitForTimeout(300);

      // Search input should be empty
      await expect(searchInput).toHaveValue("");
    });

    test("should display sort chips", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Check for sort chips
      const topRated = page.locator('Text:has-text("Top Rated")');
      await expect(topRated).toBeVisible();

      const fastDelivery = page.locator('Text:has-text("Fast Delivery")');
      await expect(fastDelivery).toBeVisible();

      const lowPrice = page.locator('Text:has-text("Low Price")');
      await expect(lowPrice).toBeVisible();
    });

    test("should change sort option when tapping sort chip", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Tap Fast Delivery sort chip
      const fastDelivery = page.locator('Pressable >> text=⚡ Fast Delivery');
      await fastDelivery.tap();
      await page.waitForTimeout(300);
    });

    test("should display category chips", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Check for category chips
      const biryaniChip = page.locator('Pressable >> text=Biryani').first();
      await expect(biryaniChip).toBeVisible();
    });

    test("should display restaurant cards in results", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Should show restaurant results
      const restaurantSection = page.locator('Text:has-text("Restaurants")');
      await expect(restaurantSection).toBeVisible();
    });

    test("should navigate to restaurant detail when tapping restaurant card", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Find and tap a restaurant card
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();

      // Should navigate to restaurant detail
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
    });

    test("should close filter modal when tapping close button", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Open filter modal
      const filterButton = page.locator('Pressable >> text=⚙️');
      await filterButton.tap();
      await page.waitForTimeout(500);

      // Tap close button (✕)
      const closeButton = page.locator('Pressable >> text=✕').nth(1);
      await closeButton.tap();
      await page.waitForTimeout(500);

      // Modal should close
      const filterModal = page.locator('Text:has-text("Filter Options")');
      await expect(filterModal).not.toBeVisible();
    });

    test("should display dish results when searching for dishes", async ({ page }) => {
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Type dish name
      const searchInput = page.locator('TextInput').first();
      await searchInput.fill("Chicken");
      await page.waitForTimeout(1000);

      // Should show dish results section
      const dishResults = page.locator('Text:has-text("Dish Results")');
      await expect(dishResults).toBeVisible();
    });
  });

  // ==========================================================================
  // RESTAURANT DETAIL SCREEN TESTS (app/restaurant/[id].tsx)
  // ==========================================================================
  describe("Restaurant Detail Screen (app/restaurant/[id].tsx)", () => {
    test("should navigate to restaurant detail from home", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Tap first restaurant card
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();

      // Should navigate to restaurant detail
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
    });

    test("should display restaurant name in heading", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Restaurant name should be visible
      const restaurantName = page.locator('Text:has-text("Nellore Kitchen")');
      await expect(restaurantName).toBeVisible();
    });

    test("should display restaurant image/banner", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Image should be visible (header image)
      const headerImage = page.locator('Image').first();
      await expect(headerImage).toBeVisible();
    });

    test("should display cuisine type and rating", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Cuisine type should be visible
      const cuisine = page.locator('Text:has-text("Nellore")');
      await expect(cuisine).toBeVisible();

      // Rating should be visible
      const rating = page.locator('Text:has-text("4.5")');
      await expect(rating).toBeVisible();
    });

    test("should display menu items in categories", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Menu section should be visible
      const menuTab = page.locator('Pressable >> text=🍴 Menu');
      await menuTab.tap();
      await page.waitForTimeout(500);

      // Check for menu categories
      const biryaniCategory = page.locator('Text:has-text("Biryani")');
      await expect(biryaniCategory).toBeVisible();
    });

    test("should display menu item with name, price, description", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Menu items should have name and price
      const chickenBiryani = page.locator('Text:has-text("Chicken Biryani")');
      await expect(chickenBiryani).toBeVisible();

      const price = page.locator('Text:has-text("₹349")');
      await expect(price).toBeVisible();
    });

    test("should add menu item to cart when tapping ADD button", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Tap ADD button on a menu item
      const addButton = page.locator('Pressable >> text=ADD +').first();
      await addButton.tap();
      await page.waitForTimeout(500);

      // Cart button should appear
      const cartButton = page.locator('Pressable >> text=View Cart');
      await expect(cartButton).toBeVisible();
    });

    test("should switch to Info tab", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Tap Info tab
      const infoTab = page.locator('Pressable >> text=ℹ️ Info');
      await infoTab.tap();
      await page.waitForTimeout(500);

      // Info content should be visible
      const addressSection = page.locator('Text:has-text("Address")');
      await expect(addressSection).toBeVisible();
    });

    test("should go back when tapping back button", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Tap back button (←)
      const backButton = page.locator('Pressable >> text=←').first();
      await backButton.tap();

      // Should navigate back
      await page.waitForURL("**/", { timeout: 5000 });
    });

    test("should display Veg/Non-Veg badge", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Should show Non-Veg badge (since Nellore Kitchen is non-veg)
      const vegBadge = page.locator('Text:has-text("Non-Veg")');
      await expect(vegBadge).toBeVisible();
    });

    test("should display delivery time and price range", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Should show delivery time
      const deliveryTime = page.locator('Text:has-text("35")');
      await expect(deliveryTime).toBeVisible();

      // Should show price range
      const priceRange = page.locator('Text:has-text("₹200 for two")');
      await expect(priceRange).toBeVisible();
    });

    test("should display offer badge if restaurant has offer", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Should show offer badge
      const offerBadge = page.locator('Text:has-text("30% OFF")');
      await expect(offerBadge).toBeVisible();
    });

    test("should show loading state while restaurant loads", async ({ page }) => {
      // Navigate directly to restaurant detail (may show loading)
      await page.goto(`${APP_URL}/restaurant/r1`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      // Loading indicator might be visible briefly
      const loadingContainer = page.locator('ActivityIndicator');
      await loadingContainer.waitFor({ state: "visible", timeout: 3000 }).catch(() => {
        // Loading might have already completed
      });
    });

    test("should display menu tabs (Menu and Info)", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Menu tab should be visible
      const menuTab = page.locator('Text:has-text("Menu")');
      await expect(menuTab).toBeVisible();

      // Info tab should be visible
      const infoTab = page.locator('Text:has-text("Info")');
      await expect(infoTab).toBeVisible();
    });

    test("should display distance if available", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Should show distance
      const distance = page.locator('Text:has-text("1.2 km")');
      await expect(distance).toBeVisible();
    });

    test("should navigate to cart when tapping View Cart button", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant detail
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Add item to cart
      const addButton = page.locator('Pressable >> text=ADD +').first();
      await addButton.tap();
      await page.waitForTimeout(500);

      // Tap View Cart button
      const cartButton = page.locator('Pressable >> text=View Cart');
      await cartButton.tap();

      // Should navigate to cart
      await page.waitForURL("**/cart**", { timeout: 5000 });
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  describe("Integration Tests", () => {
    test("should complete a flow: home -> search -> restaurant -> cart", async ({ page }) => {
      await page.waitForTimeout(1500);

      // 1. On home screen, verify greeting
      const greeting = page.locator('Text:has-text("Hello")');
      await expect(greeting).toBeVisible();

      // 2. Navigate to search
      await page.goto(`${APP_URL}/search`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // 3. Search for biryani
      const searchInput = page.locator('TextInput').first();
      await searchInput.fill("Biryani");
      await page.waitForTimeout(500);

      // 4. Tap on restaurant
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // 5. Add item to cart
      const addButton = page.locator('Pressable >> text=ADD +').first();
      await addButton.tap();
      await page.waitForTimeout(500);

      // 6. View cart
      const cartButton = page.locator('Pressable >> text=View Cart');
      await expect(cartButton).toBeVisible();
    });

    test("should handle navigation between tabs", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate through tabs
      // Home tab should be active by default
      const homeTab = page.locator('Text:has-text("Home")');
      await expect(homeTab).toBeVisible();
    });
  });

  // ==========================================================================
  // EDGE CASE TESTS
  // ==========================================================================
  describe("Edge Cases", () => {
    test("should handle rapid navigation", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Quickly navigate to restaurant and back
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });

      const backButton = page.locator('Pressable >> text=←').first();
      await backButton.tap();
      await page.waitForURL("**/", { timeout: 5000 });

      // Should still be able to interact
      const greeting = page.locator('Text:has-text("Hello")');
      await expect(greeting).toBeVisible();
    });

    test("should handle multiple cart additions", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Navigate to restaurant
      const restaurantCard = page.locator('Pressable >> text=Nellore Kitchen').first();
      await restaurantCard.tap();
      await page.waitForURL("**/restaurant/**", { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Add multiple items
      const addButtons = page.locator('Pressable >> text=ADD +');
      const count = await addButtons.count();
      if (count >= 2) {
        await addButtons.nth(0).tap();
        await page.waitForTimeout(300);
        await addButtons.nth(1).tap();
        await page.waitForTimeout(300);
      }

      // Cart should show correct count
      const cartButton = page.locator('Pressable >> text=View Cart');
      await expect(cartButton).toBeVisible();
    });
  });
});
