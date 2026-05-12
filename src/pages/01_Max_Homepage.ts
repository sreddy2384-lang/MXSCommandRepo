import { Page, Locator } from '@playwright/test';
import { BasePage } from './001_Max_CommandBasePage';
import { getConfig } from '../config/Max_CommandEnv';

/**
 * Homepage Page Object - Self-Healing Pattern
 * Handles all interactions with the Logix Alert Management application homepage
 */
export class MaxCommandHomepage extends BasePage {
  private readonly TIMEOUT = 8000;
  private shouldAddSearchedWell = true;

  // Selectors - with multiple fallbacks
  private readonly selectors = {
    appTitle: 'text=Logix Alert Management',
    applicationHeader: '[class*="logix"], [class*="alert"], h1:has-text("Logix Alert Management")',
    navigationMenu: 'nav, [class*="menu"], [class*="sidebar"]',
    dashboardMenu: 'text=Dashboard',
    wellDetailsMenu: 'text=Well Details',
    wellSettingsMenu: 'text=Well Settings',
    adminMenu: 'text=Admin',
    userInfo: '[class*="user"], [data-testid="user-info"]',
    addWellButton: 'button:has-text("Add Well"), [role="button"]:has-text("Add Well")',
    wellborePopupTitle: 'text=Wellbore List',
    popupSearchWellInput: 'input[placeholder*="Search Well"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // ======================
  // Self-Healing Resolver
  // ======================
  private async resolve(locators: Locator[], name: string): Promise<Locator> {
    for (const locator of locators) {
      try {
        await locator.first().waitFor({ state: 'visible', timeout: this.TIMEOUT });
        console.log(`✓ [SELF-HEALING] Found ${name}`);
        return locator.first();
      } catch {
        // try next locator
      }
    }
    throw new Error(`✗ [SELF-HEALING] Unable to locate ${name}`);
  }

  private async clickLocator(locators: Locator[], name: string) {
    const el = await this.resolve(locators, name);
    await el.click();
  }

  // ======================
  // Locator Groups
  // ======================
  private appTitleLocators(): Locator[] {
    return [
      this.page.getByText('Logix Alert Management'),
      this.page.locator('h1:has-text("Logix Alert Management")'),
      this.page.locator('[class*="logix"]'),
    ];
  }

  private navigationMenuLocators(): Locator[] {
    return [
      this.page.locator('nav'),
      this.page.locator('[class*="sidebar"]'),
      this.page.locator('[class*="menu"]'),
    ];
  }

  private dashboardMenuLocators(): Locator[] {
    return [
      this.page.getByText(/^Dashboard$/),
      this.page.locator('button:has-text("Dashboard")'),
      this.page.locator('a:has-text("Dashboard")'),
    ];
  }

  private wellDetailsMenuLocators(): Locator[] {
    return [
      this.page.getByText(/^Well Details$/),
      this.page.locator('button:has-text("Well Details")'),
      this.page.locator('a:has-text("Well Details")'),
    ];
  }

  private wellSettingsMenuLocators(): Locator[] {
    return [
      this.page.getByText(/^Well Settings$/),
      this.page.locator('button:has-text("Well Settings")'),
      this.page.locator('a:has-text("Well Settings")'),
    ];
  }

  private adminMenuLocators(): Locator[] {
    return [
      this.page.getByText(/^Admin$/),
      this.page.locator('button:has-text("Admin")'),
      this.page.locator('a:has-text("Admin")'),
    ];
  }

  private addWellButtonLocators(): Locator[] {
    return [
      this.page.getByRole('button', { name: /Add Well/i }),
      this.page.locator('button:has-text("Add Well")'),
      this.page.locator(this.selectors.addWellButton),
    ];
  }

  private wellborePopupLocators(): Locator[] {
    return [
      this.page.locator('[role="dialog"]').filter({ hasText: 'Wellbore List' }),
      this.page.locator('div:has(h1:has-text("Wellbore List"))'),
      this.page.locator('div:has-text("Wellbore List")').first(),
    ];
  }

  private addToDashboardButtonLocators(): Locator[] {
    return [
      this.page.getByRole('button', { name: /Add to Dashboard/i }),
      this.page.locator('button:has-text("Add to Dashboard")'),
    ];
  }

  private closePopupButtonLocators(popup: Locator): Locator[] {
    return [
      popup.locator('button:has(.pi.pi-times.p-button-icon.ng-star-inserted)').first(),
      popup.locator('button:has(.pi.pi-times.p-button-icon)').first(),
      popup.locator('.pi.pi-times.p-button-icon.ng-star-inserted').first(),
      popup.locator('.pi.pi-times.p-button-icon').first(),
      this.page.locator('button:has(.pi.pi-times.p-button-icon.ng-star-inserted)').first(),
      this.page.locator('button:has(.pi.pi-times.p-button-icon)').first(),
      this.page.locator('.pi.pi-times.p-button-icon.ng-star-inserted').first(),
      this.page.locator('.pi.pi-times.p-button-icon').first(),
      popup.getByRole('button', { name: /close/i }).first(),
      popup.getByRole('button', { name: /^x$/i }).first(),
      popup.locator('button[aria-label*="close" i]').first(),
      popup.locator('button[title*="close" i]').first(),
      popup.locator('button:has-text("×")').first(),
      popup.locator('button:has-text("x")').first(),
    ];
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async getRunValueForWellInPopup(wellName: string): Promise<string> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');
    const row = popup.locator('tr').filter({ hasText: wellName }).first();
    await row.waitFor({ state: 'visible', timeout: this.TIMEOUT });

    const headerCells = popup.locator('thead th');
    const headerCount = await headerCells.count();

    if (headerCount > 0) {
      let runColumnIndex = -1;
      for (let i = 0; i < headerCount; i++) {
        const headerText = ((await headerCells.nth(i).textContent()) || '').trim().toLowerCase();
        if (headerText.includes('run')) {
          runColumnIndex = i;
          break;
        }
      }

      if (runColumnIndex >= 0) {
        const runCellText = ((await row.locator('td').nth(runColumnIndex).textContent()) || '').trim();
        if (runCellText) {
          return runCellText;
        }
      }
    }

    const naChip = row.getByText(/^NA$/i).first();
    if (await naChip.isVisible().catch(() => false)) {
      return 'NA';
    }

    const runChip = row.locator('td').locator(':text-matches("^\\s*\\d+\\s*$", "i")').first();
    const runChipText = ((await runChip.textContent()) || '').trim();
    return runChipText;
  }

  private async closeWellborePopup(): Promise<void> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');

    for (const closeButton of this.closePopupButtonLocators(popup)) {
      try {
        await closeButton.waitFor({ state: 'visible', timeout: 2000 });

        // If locator resolves to icon element, click nearest parent button.
        const tagName = await closeButton.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
        if (tagName && tagName !== 'button') {
          const parentButton = closeButton.locator('xpath=ancestor::button[1]').first();
          await parentButton.waitFor({ state: 'visible', timeout: 3000 });
          await parentButton.click({ timeout: 3000 });
        } else {
          await closeButton.click({ timeout: 3000 });
        }

        await this.page.locator(this.selectors.wellborePopupTitle).first().waitFor({ state: 'hidden', timeout: 8000 });
        return;
      } catch {
        // try next close strategy
      }
    }

    // Fallback: ESC usually dismisses modal dialogs.
    await this.page.keyboard.press('Escape');
    await this.page.locator(this.selectors.wellborePopupTitle).first().waitFor({ state: 'hidden', timeout: 8000 });
  }

  // ======================
  // Public Actions
  // ======================

  /**
   * Navigate to homepage (application homepage)
   */
  async navigateToHomepage(): Promise<void> {
    const config = getConfig();
    await this.page.goto(config.appURL, { waitUntil: 'domcontentloaded' });
    console.log(`✓ Navigated to application: ${config.appURL}`);
  }

  /**
   * Verify Logix Alert Management title is visible
   */
  async isAppTitleVisible(): Promise<boolean> {
    try {
      const locators = this.appTitleLocators();
      for (const locator of locators) {
        try {
          await locator.first().waitFor({ state: 'visible', timeout: this.TIMEOUT });
          return true;
        } catch {
          // try next locator
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get app title text
   */
  async getAppTitle(): Promise<string> {
    const locators = this.appTitleLocators();
    const el = await this.resolve(locators, 'App Title');
    return await el.textContent() || '';
  }

  /**
   * Verify application is fully loaded
   */
  async isApplicationLoaded(): Promise<boolean> {
    try {
      console.log('[HOMEPAGE] Checking if application is loaded...');
      
      // Wait for page to be stable
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {
        console.log('[HOMEPAGE] ⚠️ Timeout on domcontentloaded');
      });
      
      // Check if on app URL
      const currentUrl = this.page.url();
      const appPath = 'logix-alert-management';
      
      if (!currentUrl.includes(appPath)) {
        console.log(`[HOMEPAGE] ❌ Not on app page: ${currentUrl}`);
        return false;
      }
      
      console.log('[HOMEPAGE] ✓ On application URL');
      
      // Check if app title is visible (Logix Alert Management)
      const titleVisible = await this.isAppTitleVisible();
      console.log(`[HOMEPAGE] App title visible: ${titleVisible}`);
      
      // Check if sidebar/navigation is visible
      const menuVisible = await this.isNavigationMenuVisible();
      console.log(`[HOMEPAGE] Navigation menu visible: ${menuVisible}`);
      
      // Application is loaded if we're on correct URL and either title or menu is visible
      // (title might not always be visible, but menu should be)
      const isLoaded = menuVisible;
      console.log(`[HOMEPAGE] Application loaded: ${isLoaded}`);
      
      return isLoaded;
    } catch (error) {
      console.error('[HOMEPAGE] Error checking if application loaded:', error);
      return false;
    }
  }

  /**
   * Verify navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    try {
      const locators = this.navigationMenuLocators();
      for (const locator of locators) {
        try {
          await locator.first().waitFor({ state: 'visible', timeout: this.TIMEOUT });
          return true;
        } catch {
          // try next locator
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Verify all menu items are present
   */
  async areAllMenuItemsVisible(menuItems: string[]): Promise<boolean> {
    for (const item of menuItems) {
      try {
        const selector = `text=${item}`;
        await this.page.locator(selector).first().waitFor({ 
          state: 'visible', 
          timeout: this.TIMEOUT 
        });
      } catch {
        console.log(`✗ Menu item not visible: ${item}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Click on Dashboard menu
   */
  async clickDashboardMenu(): Promise<void> {
    await this.clickLocator(this.dashboardMenuLocators(), 'Dashboard Menu');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Well Details menu
   */
  async clickWellDetailsMenu(): Promise<void> {
    await this.clickLocator(this.wellDetailsMenuLocators(), 'Well Details Menu');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Well Settings menu
   */
  async clickWellSettingsMenu(): Promise<void> {
    await this.clickLocator(this.wellSettingsMenuLocators(), 'Well Settings Menu');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Admin menu
   */
  async clickAdminMenu(): Promise<void> {
    await this.clickLocator(this.adminMenuLocators(), 'Admin Menu');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickAddWellButton(): Promise<void> {
    try {
      await this.clickLocator(this.addWellButtonLocators(), 'Add Well Button');
      return;
    } catch {
      // If currently on another section (e.g., Well Details), switch to Dashboard and retry.
      await this.clickDashboardMenu();
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.clickLocator(this.addWellButtonLocators(), 'Add Well Button');
    }
  }

  async isWellboreListPopupVisible(): Promise<boolean> {
    try {
      for (const locator of this.wellborePopupLocators()) {
        try {
          await locator.first().waitFor({ state: 'visible', timeout: this.TIMEOUT });
          await this.page.locator(this.selectors.wellborePopupTitle).first().waitFor({ state: 'visible', timeout: this.TIMEOUT });
          return true;
        } catch {
          // try next locator
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async clickSearchWellInputInPopup(): Promise<void> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');
    const input = popup.locator(this.selectors.popupSearchWellInput).first();
    await input.waitFor({ state: 'visible', timeout: this.TIMEOUT });
    await input.click();
    await this.page.waitForTimeout(1000);
  }

  async searchWellInPopup(wellName: string): Promise<void> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');
    const input = popup.locator(this.selectors.popupSearchWellInput).first();
    await input.waitFor({ state: 'visible', timeout: this.TIMEOUT });
    await input.clear();
    await input.fill(wellName);
    // Let search filtering/debounce settle before next action.
    await this.page.waitForTimeout(1000);
  }

  async isSearchedWellVisibleInPopupResults(wellName: string): Promise<boolean> {
    try {
      const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');
      const exactMatch = popup.getByText(new RegExp(`^${this.escapeRegex(wellName)}$`, 'i')).first();
      await exactMatch.waitFor({ state: 'visible', timeout: this.TIMEOUT });
      await this.page.waitForTimeout(1000);
      return true;
    } catch {
      return false;
    }
  }

  async selectSearchedWellCheckboxInPopup(wellName: string): Promise<void> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');
    const row = popup.locator('tr').filter({ hasText: wellName }).first();
    await row.waitFor({ state: 'visible', timeout: this.TIMEOUT });

    const runValue = (await this.getRunValueForWellInPopup(wellName)).trim();
    const alreadyAdded = !!runValue && runValue.toUpperCase() !== 'NA';
    this.shouldAddSearchedWell = !alreadyAdded;

    if (alreadyAdded) {
      console.log(`✓ Well already added to dashboard (Run No: ${runValue}). Skipping checkbox selection.`);
      await this.page.waitForTimeout(1000);
      return;
    }

    const checkboxCandidates = [
      row.locator('input[type="checkbox"]').first(),
      row.getByRole('checkbox').first(),
      row.locator('[role="checkbox"]').first(),
    ];

    for (const checkbox of checkboxCandidates) {
      try {
        await checkbox.waitFor({ state: 'visible', timeout: this.TIMEOUT });

        // If already selected, do not click again (avoid toggling it off).
        const tagName = await checkbox.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
        if (tagName === 'input') {
          const isChecked = await checkbox.isChecked().catch(() => false);
          if (isChecked) {
            return;
          }
        } else {
          const ariaChecked = (await checkbox.getAttribute('aria-checked')) || '';
          if (ariaChecked.toLowerCase() === 'true') {
            return;
          }
        }

        await checkbox.click();
        await this.page.waitForTimeout(1000);
        return;
      } catch {
        // try next checkbox strategy
      }
    }

    throw new Error(`Unable to select checkbox for searched well: ${wellName}`);
  }

  async clickAddToDashboardButtonInPopup(): Promise<void> {
    const popup = await this.resolve(this.wellborePopupLocators(), 'Wellbore List Popup');

    if (!this.shouldAddSearchedWell) {
      console.log('✓ Well already added. Closing popup instead of clicking Add to Dashboard.');
      await this.page.waitForTimeout(1000);
      await this.closeWellborePopup();
      return;
    }

    // Ensure at least one row is selected before trying to click the action button.
    await popup.getByText(/\d+\s*run\(s\)\s*selected/i).first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    const buttonCandidates = [
      popup.getByRole('button', { name: /Add to Dashboard/i }).first(),
      popup.getByRole('button', { name: /\+\s*Add to Dashboard/i }).first(),
      popup.locator('button:has-text("Add to Dashboard")').first(),
      popup.locator('[role="button"]:has-text("Add to Dashboard")').first(),
      popup.locator('button[class*="add"][class*="dashboard"]').first(),
      this.addToDashboardButtonLocators()[0],
      this.addToDashboardButtonLocators()[1],
    ];

    for (const button of buttonCandidates) {
      try {
        await button.waitFor({ state: 'visible', timeout: this.TIMEOUT });
        await button.scrollIntoViewIfNeeded().catch(() => {});
        await button.click({ timeout: 5000 });
        await this.page.waitForTimeout(1000);
        return;
      } catch {
        try {
          // Fallback for cases where overlay/animation blocks normal click.
          await button.click({ force: true, timeout: 5000 });
          return;
        } catch {
          // try next button strategy
        }
      }
    }

    throw new Error('Unable to click Add to Dashboard button in popup');
  }

  async isSearchedWellAddedToDashboard(wellName: string): Promise<boolean> {
    try {
      // Verify popup closed before checking dashboard content.
      await this.page.locator(this.selectors.wellborePopupTitle).first()
        .waitFor({ state: 'hidden', timeout: 15000 });

      // Wait for dashboard to settle after adding the well.
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.getByText('Active Wells').first().waitFor({ state: 'visible', timeout: 10000 });

      // Verify the same searched well name is visible on dashboard.
      const exactWellText = this.page.getByText(new RegExp(`\\b${this.escapeRegex(wellName)}\\b`, 'i')).first();
      await exactWellText.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}