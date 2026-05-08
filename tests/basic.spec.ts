import { test, expect } from '@playwright/test';

test.describe('SpendBook Basic e2e', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should be redirected to Neon Auth sign-in
    await expect(page).toHaveURL(/.*\/auth\/sign-in.*/);
    
    // Check if the sign in form is present
    await expect(page.locator('h1')).toContainText('Sign In');
  });
});
