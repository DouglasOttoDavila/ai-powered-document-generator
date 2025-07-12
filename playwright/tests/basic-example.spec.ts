import { test, expect } from '@playwright/test';

test.describe('Basic Example Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the website before each test
        await page.goto('https://example.com');
    });

    test('should have correct page title', async ({ page }) => {
        // Verify page title
        await expect(page).toHaveTitle('Example Domain');
    });

    test('should contain expected heading', async ({ page }) => {
        // Check for main heading
        const heading = page.locator('h1');
        await expect(heading).toHaveText('Example Domain');
    });

    test('should have working link', async ({ page }) => {
        // Check if the link exists and has correct href
        const link = page.locator('a');
        await expect(link).toHaveAttribute('href', 'https://www.iana.org/domains/example');
    });
});
