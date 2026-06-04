import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../001_Max_CommandBasePage';

export class LogixAddWellPage extends BasePage {

  // =====================================================================
  // URLs
  // =====================================================================
  private readonly dashboardUrl =
    'https://dev.sperrydigital.ienergy.halliburton.com/logix-alert-management/dashboard';

  // =====================================================================
  // Locators
  // =====================================================================
  private readonly locators = {

    // --- App shell ---
    appTitle:         'text=Logix Alert Management',
    navigationMenu:   'nav, [class*="sidebar"], [class*="menu"]',

    // --- Dashboard ---
    addWellButton:    { role: 'button' as const, name: '+ Add Well' },
    clearFiltersBtn:  { role: 'button' as const, name: ' Clear Filters' },

    // --- Wellbore popup ---
    wellboreDialog:   '[role="dialog"]',
    wellboreTitle:    'text=Wellbore List',
    popupSearchInput: 'input[placeholder*="Search"]',
    popupCloseBtn:    'button:has(.pi-times)',
    addToDashboardBtn:{ role: 'button' as const, name: /Add to Dashboard|Update Dashboard/i },

    // --- Wellbore table ---
    tableRows:        '[role="dialog"] tbody tr',
    tableHeaders:     '[role="dialog"] thead th',
    runNoHeader:      '[role="dialog"] thead th:nth-child(3)',
    runNoSortIcon:    '[role="dialog"] thead th:nth-child(3) p-sorticon .p-icon',

    // --- Well ID column filter ---
    filterMenuButton: { role: 'button' as const, name: 'Show Filter Menu', index: 3 },
    filterOverlay:    '.p-column-filter-overlay',
    filterApplyBtn:   { role: 'button' as const, name: 'Apply' },
    filterClearBtn:   { role: 'button' as const, name: 'Clear' },
    filterTextbox:    '#pn_id_14',
    matchModeDropdown:(label: string) => ({ role: 'combobox' as const, name: label }),
    filterConditionDropdown: (label: string) => ({ role: 'combobox' as const, name: label }),
  };

  constructor(page: Page) {
    super(page);
  }

  // =====================================================================
  // Private helpers
  // =====================================================================
  private dialog(): Locator {
    return this.page.locator(this.locators.wellboreDialog).filter({ hasText: 'Wellbore List' }).first();
  }

  private async optionFirst(name: string): Promise<void> {
    await this.page.getByRole('option', { name }).first().click();
  }

  // =====================================================================
  // Navigation
  // =====================================================================
  async navigateToHomepage(): Promise<void> {
    await this.page.goto(this.dashboardUrl, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    console.log('✓ Navigated to dashboard homepage');
  }

  // =====================================================================
  // App-level checks
  // =====================================================================
  async isApplicationLoaded(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.appTitle).waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isAppTitleVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.appTitle).waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isNavigationMenuVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.navigationMenu).first().waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  // =====================================================================
  // Add Well button
  // =====================================================================
  async clickAddWellButton(): Promise<void> {
    await this.page
      .getByRole(this.locators.addWellButton.role, { name: this.locators.addWellButton.name })
      .click();
    console.log('✓ Clicked Add Well button');
  }

  async isAddWellButtonVisible(): Promise<boolean> {
    try {
      await this.page
        .getByRole(this.locators.addWellButton.role, { name: this.locators.addWellButton.name })
        .waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async toggleRunNoSortTwice(): Promise<void> {
    const sortIcon = this.page.locator(this.locators.runNoSortIcon).first();
    await sortIcon.waitFor({ state: 'visible', timeout: 10000 });
    await sortIcon.click();
    await this.page.waitForTimeout(500);
    await sortIcon.click();
    await this.page.waitForTimeout(500);
    console.log('✓ Toggled Run No sort twice');
  }

  async isRunNoSortedAsc(): Promise<boolean> {
    try {
      const header = this.page.locator(this.locators.runNoHeader).first();
      await header.waitFor({ state: 'visible', timeout: 8000 });
      const ariaSort = (await header.getAttribute('aria-sort')) || '';
      return ariaSort.toLowerCase() === 'ascending';
    } catch {
      return false;
    }
  }

  async isRunNoSortedDesc(): Promise<boolean> {
    try {
      const header = this.page.locator(this.locators.runNoHeader).first();
      await header.waitFor({ state: 'visible', timeout: 8000 });
      const ariaSort = (await header.getAttribute('aria-sort')) || '';
      return ariaSort.toLowerCase() === 'descending';
    } catch {
      return false;
    }
  }

  // =====================================================================
  // Wellbore popup
  // =====================================================================
  async isWellboreListPopupVisible(): Promise<boolean> {
    try {
      await this.dialog().waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isWellboreListPopupClosed(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.wellboreTitle).waitFor({ state: 'hidden', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isWellboreSearchInputVisible(): Promise<boolean> {
    try {
      await this.dialog().locator(this.locators.popupSearchInput).waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async isWellboreCloseButtonVisible(): Promise<boolean> {
    try {
      await this.dialog().locator(this.locators.popupCloseBtn).first().waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async closeWellboreListPopupForValidation(): Promise<void> {
    try {
      await this.dialog().locator(this.locators.popupCloseBtn).first().click();
    } catch {
      await this.page.keyboard.press('Escape');
    }
    await this.page.locator(this.locators.wellboreTitle).waitFor({ state: 'hidden', timeout: 10000 });
    console.log('✓ Closed Wellbore popup');
  }

  // =====================================================================
  // Wellbore table
  // =====================================================================
  async areWellboreHeadersVisible(headers: string[]): Promise<boolean> {
    try {
      for (const header of headers) {
        await this.dialog().locator(this.locators.tableHeaders).filter({ hasText: header }).first()
          .waitFor({ state: 'visible', timeout: 8000 });
      }
      return true;
    } catch {
      return false;
    }
  }

  async isWellboreTablePopulated(): Promise<boolean> {
    try {
      await this.dialog().locator(this.locators.tableRows).first().waitFor({ state: 'visible', timeout: 10000 });
      const count = await this.dialog().locator(this.locators.tableRows).count();
      return count > 0;
    } catch {
      return false;
    }
  }

  // =====================================================================
  // Action button (Add to Dashboard / Update Dashboard)
  // =====================================================================
  async isWellboreActionButtonDisabledWithNoSelection(): Promise<boolean> {
    try {
      const btn = this.dialog().getByRole(this.locators.addToDashboardBtn.role, { name: this.locators.addToDashboardBtn.name }).first();
      await btn.waitFor({ state: 'visible', timeout: 8000 });
      const disabled =
        (await btn.isDisabled()) ||
        (await btn.getAttribute('aria-disabled')) === 'true' ||
        ((await btn.getAttribute('class')) || '').includes('p-disabled');
      return disabled;
    } catch {
      return true; // Button not found – treat as disabled
    }
  }

  async isWellboreActionButtonVisibleAndEnabled(): Promise<boolean> {
    try {
      const btn = this.dialog().getByRole(this.locators.addToDashboardBtn.role, { name: this.locators.addToDashboardBtn.name }).first();
      await btn.waitFor({ state: 'visible', timeout: 8000 });
      return await btn.isEnabled();
    } catch {
      return false;
    }
  }

  async clickAddToDashboardButtonInPopup(): Promise<void> {
    await this.dialog()
      .getByRole(this.locators.addToDashboardBtn.role, { name: this.locators.addToDashboardBtn.name })
      .first()
      .click();
    console.log('✓ Clicked Add to Dashboard button');
  }

  // =====================================================================
  // Checkbox selection
  // =====================================================================
  async selectFirstWellCheckboxInPopup(): Promise<void> {
    await this.dialog().locator('tbody tr').first()
      .locator('input[type="checkbox"], p-checkbox, .p-checkbox').first().click();
    console.log('✓ Selected first well checkbox');
  }

  async selectSearchedWellCheckboxInPopup(wellName: string): Promise<void> {
    const row = this.dialog().locator('tbody tr').filter({ hasText: wellName }).first();
    await row.locator('input[type="checkbox"], p-checkbox, .p-checkbox').first().click();
    console.log(`✓ Selected checkbox for well: ${wellName}`);
  }

  // =====================================================================
  // Search
  // =====================================================================
  async clickSearchWellInputInPopup(): Promise<void> {
    await this.dialog().locator(this.locators.popupSearchInput).click();
    console.log('✓ Clicked search input in popup');
  }

  async searchWellInPopup(wellName: string): Promise<void> {
    const input = this.dialog().locator(this.locators.popupSearchInput);
    await input.clear();
    await input.fill(wellName);
    await this.page.waitForTimeout(1500); // allow results to filter
    console.log(`✓ Searched for well: ${wellName}`);
  }

  async isSearchedWellVisibleInPopupResults(wellName: string): Promise<boolean> {
    try {
      await this.dialog().locator('tbody tr').filter({ hasText: wellName }).first()
        .waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  // =====================================================================
  // Dashboard verification
  // =====================================================================
  async isSearchedWellAddedToDashboard(wellName: string): Promise<boolean> {
    try {
      await this.dialog().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await this.page.getByText(wellName).first().waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  // =====================================================================
  // Well ID column filter
  // =====================================================================
  async clickWellIdFilterIconInPopup(): Promise<void> {
    await this.page
      .getByRole(this.locators.filterMenuButton.role, { name: this.locators.filterMenuButton.name })
      .nth(this.locators.filterMenuButton.index)
      .click();
    console.log('✓ Opened Well ID filter menu');
  }

  async isWellIdFilterPopupVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.filterOverlay).waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async areWellIdFilterDropdownsVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.locators.filterOverlay).locator('p-select, p-dropdown, [role="combobox"]').first()
        .waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async isFirstWellIdFilterDropdownSelected(value: string): Promise<boolean> {
    try {
      const text = await this.page.getByRole('combobox', { name: value }).first().textContent();
      return (text || '').includes(value);
    } catch {
      return false;
    }
  }

  async isSecondWellIdFilterDropdownSelected(value: string): Promise<boolean> {
    try {
      const text = await this.page.getByRole('combobox', { name: value }).first().textContent();
      return (text || '').includes(value);
    } catch {
      return false;
    }
  }

  async selectWellIdFilterDropdownOption(dropdownIndex: number, option: string): Promise<void> {
    const dropdowns = this.page.locator(this.locators.filterOverlay).getByRole('combobox');
    await dropdowns.nth(dropdownIndex).click();
    await this.page.getByRole('option', { name: option }).first().click();
    console.log(`✓ Selected "${option}" in filter dropdown [${dropdownIndex}]`);
  }

  async enterWellIdFilterText(value: string): Promise<void> {
    await this.page.locator(this.locators.filterTextbox).getByRole('textbox').fill(value);
    console.log(`✓ Entered filter text: ${value}`);
  }

  async clickApplyInWellIdFilterPopup(): Promise<void> {
    await this.page
      .getByRole(this.locators.filterApplyBtn.role, { name: this.locators.filterApplyBtn.name })
      .click();
    console.log('✓ Clicked Apply in filter popup');
  }

  async enterWellIdFilterTextAndSubmit(value: string): Promise<void> {
    await this.enterWellIdFilterText(value);
    await this.clickApplyInWellIdFilterPopup();
    console.log(`✓ Entered and submitted filter: ${value}`);
  }

  async areFilteredWellRowsVisible(value: string): Promise<boolean> {
    try {
      await this.dialog().locator('tbody tr').filter({ hasText: value }).first()
        .waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isWellIdFilterApplied(value: string): Promise<boolean> {
    return this.areFilteredWellRowsVisible(value);
  }
}
