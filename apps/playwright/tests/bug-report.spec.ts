import { expect, test } from "@playwright/test";

test.describe("bug report form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/form-demo");
  });

  test("user sees validation errors when submitting an incomplete report", async ({
    page
  }) => {
    await test.step("submit the empty form", async () => {
      await page.getByRole("button", { name: "Submit" }).click();
    });

    await test.step("verify required validation is visible", async () => {
      await expect(
        page.getByText("Title must be at least 5 characters.")
      ).toBeVisible();
      await expect(
        page.getByText("Description must be at least 20 characters.")
      ).toBeVisible();
      await expect(
        page.getByText("Password must be at least 8 characters.")
      ).toBeVisible();
      await expect(
        page.getByText("You must agree to the terms.")
      ).toBeVisible();
      await expect(page.getByText("Submitted values:")).not.toBeVisible();
    });
  });

  test("user sees submitted values after completing a valid report", async ({
    page
  }) => {
    await test.step("complete the report fields", async () => {
      await page.getByLabel("Bug Title").fill("Login button fails");
      await page.getByLabel("Password").fill("correct-horse");
      await page
        .getByLabel("Description")
        .fill("The login button fails on mobile devices.");
      await page.getByRole("combobox", { name: "Category" }).click();
      await page.getByRole("option", { name: "Bug" }).click();
      await page
        .getByRole("checkbox", { name: "I agree to the terms and conditions" })
        .check();
    });

    await test.step("submit the report and verify user feedback", async () => {
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Submitted values:")).toBeVisible();
      await expect(page.getByText('"Login button fails"')).toBeVisible();
      await expect(
        page.getByText('"The login button fails on mobile devices."')
      ).toBeVisible();
    });
  });
});
