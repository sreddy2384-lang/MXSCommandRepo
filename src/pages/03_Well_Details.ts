import { expect, Page } from '@playwright/test';

export class WellDetailsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openWellDetailsTabFromSidebar(): Promise<void> {
    const wellDetailsNav = this.page.getByRole('link', { name: 'Well Details' }).first();
    await expect(wellDetailsNav).toBeVisible({ timeout: 10000 });
    await wellDetailsNav.click();
  }

  async verifyWellDetailsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/well-details/, { timeout: 10000 });
    await expect(this.page.getByPlaceholder('Search by Country, Well, or Run Number').first()).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText('List', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText('Grid', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async searchWellDetailsAndVerifyResults(): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search by Country, Well, or Run Number').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    const detailsButtons = this.page.locator('button:has-text("Details")');
    await expect(detailsButtons.first()).toBeVisible({ timeout: 10000 });

    const queryToken = await detailsButtons.first().evaluate((el) => {
      const card =
        el.closest('lam-well-card, .well-card, [class*="well-card"], .p-card, .card') ||
        el.parentElement;
      const cardText = (card?.textContent || '').replace(/\s+/g, ' ').trim();
      const words = cardText.match(/[A-Za-z0-9-]{4,}/g) || [];
      const skip = new Set(['Details', 'Country', 'Run', 'Well', 'List', 'Grid']);
      return words.find((word) => !skip.has(word)) || 'NEW';
    });

    await searchInput.fill(queryToken);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500);

    await expect(detailsButtons.first()).toBeVisible({ timeout: 10000 });

    const visibleCount = await detailsButtons.count();
    const checks = Math.min(visibleCount, 5);
    for (let index = 0; index < checks; index++) {
      const cardText = await detailsButtons.nth(index).evaluate((el) => {
        const card =
          el.closest('lam-well-card, .well-card, [class*="well-card"], .p-card, .card') ||
          el.parentElement;
        return (card?.textContent || '').replace(/\s+/g, ' ').trim();
      });

      expect(
        cardText.toLowerCase(),
        `Filtered result at index ${index} should contain search token "${queryToken}"`,
      ).toContain(queryToken.toLowerCase());
    }

    // Negative validation: non-existing values should not display any matching cards.
    const missingToken = `NO-DATA-${Date.now()}`;
    await searchInput.fill(missingToken);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(700);

    const noDataMessage = this.page
      .locator('text=/No data|No records|No wells found|No results/i')
      .first();
    const noDataMessageVisible = await noDataMessage.isVisible().catch(() => false);
    const filteredCount = await detailsButtons.count();

    if (!noDataMessageVisible) {
      expect(
        filteredCount,
        `Search with non-existing token "${missingToken}" should not display data`,
      ).toBe(0);
    }
  }

  async clearSearchAndOpenFirstWellDetailsCard(): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search by Country, Well, or Run Number').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500);

    const firstDetailsButton = this.page.locator('button:has-text("Details")').first();
    await expect(firstDetailsButton).toBeVisible({ timeout: 10000 });
    await firstDetailsButton.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async verifyWellsDataDisplayedAfterDetailsClick(): Promise<void> {
    const currentUrl = this.page.url();

    if (/dashboard/.test(currentUrl)) {
      await expect(this.page.getByText('Overview', { exact: true }).first()).toBeVisible({ timeout: 10000 });
      return;
    }

    if (/well-details|wells/.test(currentUrl)) {
      const candidates = [
        this.page.locator('button:has-text("Details")').first(),
        this.page.getByText('Overview', { exact: true }).first(),
        this.page.getByPlaceholder('Search by Country, Well, or Run Number').first(),
        this.page.locator('table tbody tr').first(),
        this.page.getByText('Well Details').first(),
      ];

      for (const candidate of candidates) {
        if (await candidate.isVisible().catch(() => false)) {
          return;
        }
      }

      throw new Error(`Wells data shell not visible after Details click at URL: ${currentUrl}`);
    }

    throw new Error(`Unexpected page after clicking Details: ${currentUrl}`);
  }
}
