import { test, expect } from "@playwright/test";

/**
 * Smoke test for the "ideal judge journey" (spec §33): dashboard -> MSME
 * profile -> adaptation plan -> counterfactual hero screen -> evidence ->
 * lender action. Runs entirely against bundled seed data, so it does not
 * require the FastAPI backend to be running.
 */
test("judge can walk the full CLIMASCORE story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /portfolio climate-risk overview/i })).toBeVisible();

  await page.getByRole("link", { name: "Surat Textile Works" }).first().click();
  await expect(page.getByRole("heading", { name: "Surat Textile Works" })).toBeVisible();
  await expect(page.getByText(/78 \/ 100|High/i).first()).toBeVisible();

  await page.getByRole("link", { name: /adaptation plan/i }).click();
  await expect(page.getByRole("heading", { name: /financed adaptation measures/i })).toBeVisible();

  await page.getByRole("link", { name: /see how these measures change/i }).click();
  await expect(page.getByRole("heading", { name: /what changed because of adaptation/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /without adaptation scenario/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /with adaptation scenario/i })).toBeVisible();
  await expect(page.getByText(/resilience delta/i)).toBeVisible();

  await page.getByRole("link", { name: /inspect the supporting evidence/i }).click();
  await expect(page.getByRole("heading", { name: /where these numbers come from/i })).toBeVisible();

  await page.getByRole("link", { name: /continue to lender action/i }).click();
  await expect(page.getByText(/decision support, not autonomous credit approval/i)).toBeVisible();
});
