import { expect, test } from "@playwright/test";

test.describe("web navigation", () => {
  test("user can reach the bug report form from the home page", async ({
    page
  }) => {
    await test.step("open the web app home page", async () => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "TanStack Demo" })
      ).toBeVisible();
    });

    await test.step("open the form demo through visible navigation", async () => {
      await page.getByRole("link", { name: "Form Demo" }).click();
      await expect(page).toHaveURL(/\/form-demo$/);
      await expect(page.getByText("Bug Report", { exact: true })).toBeVisible();
    });
  });
});
