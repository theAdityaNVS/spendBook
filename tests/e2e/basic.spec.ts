import { test, expect } from "@playwright/test";

test.describe("SpendBook Basic e2e", () => {
  test("should show the development account picker when bypass auth is active", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/.*\/dev-login.*/);
    await expect(page.getByRole("heading", { name: "SpendBook" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who's tracking today?" })).toBeVisible();
  });
});
