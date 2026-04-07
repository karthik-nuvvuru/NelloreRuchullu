import type { Page, TestInfo } from '@playwright/test';

const SCREENSHOTS_DIR = 'tests/screenshots';

export async function captureScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const { join } = require('path');
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: true,
  });
  await testInfo.attach(`screenshot-${name}`, {
    path: join(SCREENSHOTS_DIR, `${name}.png`),
    contentType: 'image/png',
  });
}
