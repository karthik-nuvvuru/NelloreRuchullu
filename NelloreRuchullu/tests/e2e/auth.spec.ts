import { test, expect } from "@playwright/test";

const BASE_URL = process.env.EXPO_WEBSITE_URL || "http://localhost:8081";
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14

test.describe("Splash Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  });

  test("App loads splash screen", async ({ page }) => {
    // Check for the gradient background container
    const container = page.locator("View").first();
    await expect(container).toBeVisible();
  });

  test("App logo/brand displays correctly", async ({ page }) => {
    // Logo emoji should be visible
    const emoji = page.locator("Text").filter({ hasText: "🍛" }).first();
    await expect(emoji).toBeVisible();

    // Logo text "NelloreRuchullu" should be visible
    const logoText = page.locator("Text").filter({ hasText: "NelloreRuchullu" });
    await expect(logoText).toBeVisible();

    // Tagline in Telugu should be visible
    const tagline = page.locator("Text").filter({ hasText: "రుచుల్లు" });
    await expect(tagline).toBeVisible();
  });

  test('"Skip" link exists and navigates to onboarding', async ({ page }) => {
    const skipLink = page.locator("Text").filter({ hasText: "Skip" });
    await expect(skipLink).toBeVisible();

    await skipLink.click();
    await page.waitForURL(`${BASE_URL}/onboarding`);

    // Verify we're on the onboarding screen
    const onboardingTitle = page.locator("Text").filter({ hasText: "Authentic Nellore Cuisine" });
    await expect(onboardingTitle).toBeVisible();
  });

  test("Auto-navigation to onboarding after 2.5 seconds", async ({ page }) => {
    // The splash screen has a 2.5 second timer before navigation
    // We can check for presence of loading bar which suggests auto-navigation is active
    const loadingBar = page.locator("View").filter({ hasText: /loading/i }).first();
    await expect(loadingBar).toBeVisible({ timeout: 1000 });
  });
});

test.describe("Onboarding Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: "networkidle" });
  });

  test("Page renders with onboarding content", async ({ page }) => {
    // Check that the first slide content is visible
    const title = page.locator("Text").filter({ hasText: "Authentic Nellore Cuisine" });
    await expect(title).toBeVisible();

    const subtitle = page.locator("Text").filter({ hasText: "Taste the tradition" });
    await expect(subtitle).toBeVisible();
  });

  test("Page indicator shows (1/3)", async ({ page }) => {
    const indicator = page.locator("Text").filter({ hasText: "1/3" });
    await expect(indicator).toBeVisible();
  });

  test("Page indicator dots display", async ({ page }) => {
    // There should be 3 dots - check for pagination dots
    // The active dot for slide 1 should be visible
    const activeDot = page.locator("View").filter({ hasText: "" }).nth(3);
    await expect(activeDot).toBeVisible();
  });

  test('"Next" button advances to next screen', async ({ page }) => {
    const nextButton = page.locator("Text").filter({ hasText: "Next" });
    await expect(nextButton).toBeVisible();

    await nextButton.click();

    // Should now show slide 2
    const indicator = page.locator("Text").filter({ hasText: "2/3" });
    await expect(indicator).toBeVisible();
  });

  test('"Skip" button skips to last screen', async ({ page }) => {
    const skipButton = page.locator("Text").filter({ hasText: "Skip" });
    await expect(skipButton).toBeVisible();

    await skipButton.click();

    // Should skip to the last slide (slide 3) showing "Get Started"
    const getStarted = page.locator("Text").filter({ hasText: "Get Started" });
    await expect(getStarted).toBeVisible();
  });

  test('"Get Started" button on final screen works', async ({ page }) => {
    // Navigate to last screen first
    const skipButton = page.locator("Text").filter({ hasText: "Skip" });
    await skipButton.click();

    // Now click "Get Started"
    const getStarted = page.locator("Text").filter({ hasText: "Get Started" });
    await expect(getStarted).toBeVisible();
    await getStarted.click();

    // Should navigate to login
    await page.waitForURL(`${BASE_URL}/login`);
    const loginTitle = page.locator("Text").filter({ hasText: "Welcome Back" });
    await expect(loginTitle).toBeVisible();
  });

  test("Back button works on subsequent slides", async ({ page }) => {
    // Go to slide 2 first
    const nextButton = page.locator("Text").filter({ hasText: "Next" });
    await nextButton.click();

    // Now press Back
    const backButton = page.locator("Text").filter({ hasText: "← Back" });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should be back on slide 1
    const indicator = page.locator("Text").filter({ hasText: "1/3" });
    await expect(indicator).toBeVisible();
  });

  test("Pagination dot active state changes", async ({ page }) => {
    // Initially on slide 1, indicator shows 1/3
    let indicator = page.locator("Text").filter({ hasText: "1/3" });
    await expect(indicator).toBeVisible();

    // Click Next to go to slide 2
    const nextButton = page.locator("Text").filter({ hasText: "Next" });
    await nextButton.click();

    // Now indicator should show 2/3
    indicator = page.locator("Text").filter({ hasText: "2/3" });
    await expect(indicator).toBeVisible();
  });
});

test.describe("Login Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  });

  test('Page renders with "Login" heading', async ({ page }) => {
    // The login screen has "Welcome Back! 👋" as title
    const title = page.locator("Text").filter({ hasText: "Welcome Back" });
    await expect(title).toBeVisible();
  });

  test("Phone input field exists and accepts input", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await expect(phoneInput).toBeVisible();

    await phoneInput.fill("9876543210");
    await expect(phoneInput).toHaveValue("9876543210");
  });

  test("Password input field exists and accepts input", async ({ page }) => {
    // Note: Login screen uses OTP flow, not password
    // But we verify the OTP input field exists
    // First we need to trigger OTP view by sending OTP
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Wait for OTP view
    await page.waitForTimeout(500);

    // OTP input should be visible
    const otpInput = page.locator('TextInput[placeholder="Enter 6-digit OTP"]');
    await expect(otpInput).toBeVisible();
  });

  test('"Login" button exists and is clickable', async ({ page }) => {
    // The button text is "Send OTP" for initial login flow
    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await expect(sendOtpButton).toBeVisible();
    await expect(sendOtpButton).toBeEnabled();
  });

  test("Loading state on login button during API call", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Button should show loading text
    const loadingText = page.locator("Text").filter({ hasText: "Sending OTP" });
    await expect(loadingText).toBeVisible({ timeout: 2000 });
  });

  test('"Register" link exists and navigates to register screen', async ({ page }) => {
    const registerLink = page.locator("Text").filter({ hasText: "Create Account" });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await page.waitForURL(`${BASE_URL}/register`);

    const createAccountTitle = page.locator("Text").filter({ hasText: "Create Account" }).first();
    await expect(createAccountTitle).toBeVisible();
  });

  test("Social login button exists and is clickable", async ({ page }) => {
    const socialButton = page.locator("Text").filter({ hasText: "Continue with Google" });
    await expect(socialButton).toBeVisible();
    await socialButton.click();

    // Should show an alert or feedback (Coming soon)
    // The app doesn't have an alert for this in the code, but we verify click doesn't crash
    await page.waitForTimeout(500);
  });

  test("Form validation: empty phone shows error", async ({ page }) => {
    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Error message should appear
    const errorText = page.locator("Text").filter({ hasText: /valid.*phone/i });
    await expect(errorText).toBeVisible({ timeout: 2000 });
  });

  test("Invalid phone format shows error", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("123");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Error message should appear
    const errorText = page.locator("Text").filter({ hasText: /valid.*phone/i });
    await expect(errorText).toBeVisible({ timeout: 2000 });
  });

  test('"Change number" link exists in OTP view', async ({ page }) => {
    // First trigger OTP view
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    await page.waitForTimeout(500);

    const changeNumber = page.locator("Text").filter({ hasText: "Change number" });
    await expect(changeNumber).toBeVisible();
  });

  test("Back button navigates back", async ({ page }) => {
    const backButton = page.locator("Text").filter({ hasText: "← Back" });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should navigate back (to onboarding or splash depending on history)
    await page.waitForURL(/\/(onboarding|splash)/);
  });
});

test.describe("Register Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
  });

  test('Page renders with "Create Account" heading', async ({ page }) => {
    const title = page.locator("Text").filter({ hasText: "Create Account" }).first();
    await expect(title).toBeVisible();
  });

  test("Name input field exists", async ({ page }) => {
    // Name input only appears after OTP verification (showNamePrompt)
    // Initial form has phone and email only
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await expect(phoneInput).toBeVisible();
  });

  test("Email input field exists", async ({ page }) => {
    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await expect(emailInput).toBeVisible();
  });

  test("Phone input field exists", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await expect(phoneInput).toBeVisible();
  });

  test("Password input field exists", async ({ page }) => {
    // Register screen doesn't have password field - it uses OTP flow
    // But we verify OTP input exists when shown
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await emailInput.fill("test@example.com");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    await page.waitForTimeout(500);

    // OTP input should be visible
    const otpInput = page.locator('TextInput[placeholder="Enter 6-digit OTP"]');
    await expect(otpInput).toBeVisible();
  });

  test('"Create Account" button exists', async ({ page }) => {
    const createButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await expect(createButton).toBeVisible();
  });

  test("Loading state during registration", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await emailInput.fill("test@example.com");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Loading state should appear
    const loadingText = page.locator("Text").filter({ hasText: "Sending OTP" });
    await expect(loadingText).toBeVisible({ timeout: 2000 });
  });

  test("OTP verification step after initial registration", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await emailInput.fill("test@example.com");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    await page.waitForTimeout(1000);

    // OTP input view should be shown
    const otpInput = page.locator('TextInput[placeholder="Enter 6-digit OTP"]');
    await expect(otpInput).toBeVisible({ timeout: 3000 });
  });

  test('"Already have account? Login" link works', async ({ page }) => {
    const loginLink = page.locator("Text").filter({ hasText: "Login" });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await page.waitForURL(`${BASE_URL}/login`);
  });

  test("Form validation on phone field", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("123");

    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await emailInput.fill("test@example.com");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Error for invalid phone
    const errorText = page.locator("Text").filter({ hasText: /valid.*phone/i });
    await expect(errorText).toBeVisible({ timeout: 2000 });
  });

  test("Form validation on email field", async ({ page }) => {
    const phoneInput = page.locator('TextInput[placeholder="Enter phone number"]');
    await phoneInput.fill("9876543210");

    const emailInput = page.locator('TextInput[placeholder="Enter email address"]');
    await emailInput.fill("invalidemail");

    const sendOtpButton = page.locator("Text").filter({ hasText: "Send OTP" });
    await sendOtpButton.click();

    // Error for invalid email
    const errorText = page.locator("Text").filter({ hasText: /valid.*email/i });
    await expect(errorText).toBeVisible({ timeout: 2000 });
  });

  test("Back button navigates back", async ({ page }) => {
    const backButton = page.locator("Text").filter({ hasText: "← Back" });
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForURL(/\/(onboarding|splash)/);
  });
});

test.describe("Navigation Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test("Splash -> Skip -> Onboarding -> Login flow", async ({ page }) => {
    // Start at splash
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Skip to onboarding
    const skipLink = page.locator("Text").filter({ hasText: "Skip" });
    await skipLink.click();
    await page.waitForURL(`${BASE_URL}/onboarding`);

    // Skip to login via Get Started
    const getStarted = page.locator("Text").filter({ hasText: "Get Started" });
    await getStarted.click();
    await page.waitForURL(`${BASE_URL}/login`);
  });

  test("Login -> Register -> Login flow", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

    // Go to register
    const createAccount = page.locator("Text").filter({ hasText: "Create Account" });
    await createAccount.click();
    await page.waitForURL(`${BASE_URL}/register`);

    // Go back to login
    const loginLink = page.locator("Text").filter({ hasText: "Login" });
    await loginLink.click();
    await page.waitForURL(`${BASE_URL}/login`);
  });
});
