const { test, expect } = require("@playwright/test");

test("User can submit card", async (page: any) => {
  await page.goto("https://aurellcard.fly.dev");

  await page.fill('input[name="name"]', "Test User");
  await page.fill('textarea[name="message"]', "This is a test message");
  await page.click('button[type="submit"]');

  await expect(page.locator("text=Thank you")).toBeVisible();
});