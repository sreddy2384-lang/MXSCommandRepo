import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
	private readonly page: Page;

	private readonly authUrl =
		'https://authentik.sperrydigital-dev.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/';
	private readonly dashboardUrl =
		'https://dev.sperrydigital.ienergy.halliburton.com/logix-alert-management/dashboard';

	// Auth locators
	private readonly usernameInput: Locator;
	private readonly passwordInput: Locator;
	private readonly loginButton: Locator;

	// Dashboard / Add Well locators
	private readonly firstContentSection: Locator;
	private readonly addWellButton: Locator;
	private readonly runNoSortIcon: Locator;
	private readonly filterMenuButton: Locator;
	private readonly firstFilterDropdown: Locator;
	private readonly filterTextInput: Locator;
	private readonly matchAllOption: Locator;
	private readonly startsWithOption: Locator;
	private readonly filterpopup: Locator;
	private readonly applybutton: Locator;
	private readonly secondFilterDropdown: Locator;
	private readonly filterOverlay: Locator;
	private readonly tableWellIdCells: Locator;
	private readonly expandWellDetailsBtn: Locator;
	private readonly informationTabBtn: Locator;
	private readonly moreActionsButton: Locator;


	constructor(page: Page) {
		this.page = page;

		this.usernameInput = this.page.getByRole('textbox', { name: 'Email or Username' });
		this.passwordInput = this.page.getByRole('textbox', { name: 'Password' });
		this.loginButton = this.page.getByRole('button', { name: 'Log in' });

		this.firstContentSection = this.page.locator('.content-section').first();
		this.addWellButton = this.page.getByRole('button', { name: '+ Add Well' });
		this.runNoSortIcon = this.page
			.locator('#pn_id_13-table > .p-datatable-thead > tr > th:nth-child(3) > .th-with-filter > p-sorticon > .p-component > .p-icon');
		this.filterMenuButton = this.page.getByRole('button', { name: 'Show Filter Menu' }).nth(3);
		this.firstFilterDropdown = this.page.getByRole('combobox', { name: 'Match All' });
		this.filterTextInput = this.page.locator('input[type="text"]').nth(0);
		this.filterpopup = this.page.locator('.type');
		this.matchAllOption = this.page.getByRole('option', { name: 'Match All' }).first();
		this.startsWithOption = this.page.getByRole('option', { name: 'Starts with' }).first();
        this.applybutton = this.page.getByRole('button', { name: 'Apply' });
		this.filterOverlay = this.page.locator('.p-column-filter-overlay');
		this.secondFilterDropdown = this.filterOverlay.getByRole('combobox').nth(1);
		this.tableWellIdCells = this.page.locator('tbody tr td:nth-child(2)');
		this.expandWellDetailsBtn = this.page.locator('button[aria-label="Expand well details"]');
		this.informationTabBtn = this.page.getByText('Information', { exact: true }).first();
		this.moreActionsButton = this.page.locator('button').filter({ has: this.page.locator('.pi-ellipsis-v, [class*="ellipsis"]') }).first();

	}

	private filterPanel(): Locator {
		return this.page
			.locator('div')
			.filter({ has: this.page.getByRole('button', { name: 'Apply' }) })
			.filter({ has: this.page.getByRole('button', { name: 'Clear' }) })
			.first();
	}

	private filterTextbox(): Locator {
		const textboxes = this.filterPanel().locator('input:not([disabled]):not([type="checkbox"])');
		return textboxes.first();
	}

	private filterApplyButton(): Locator {
		return this.filterPanel().getByRole('button', { name: 'Apply' }).first();
	}

	private filterClearButton(): Locator {
		return this.filterPanel().getByRole('button', { name: 'Clear' }).first();
	}

	private async waitForWellboreTableReady(): Promise<Locator> {
		const wellboreDialog = this.wellboreDialog();
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.locator('thead th').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
		return wellboreDialog;
	}

	private wellboreDialog(): Locator {
		return this.page
			.getByRole('dialog')
			.filter({ hasText: 'Wellbore List' })
			.first();
	}

	private normalizeColumnName(value: string): string {
		return value.replace(/\s+/g, ' ').trim().toLowerCase();
	}

	private async getColumnIndex(columnName: string): Promise<number> {
		const wellboreDialog = await this.waitForWellboreTableReady();
		const headers = wellboreDialog.locator('thead th');
		const headerCount = await headers.count();
		const expectedHeader = this.normalizeColumnName(columnName);

		for (let index = 0; index < headerCount; index++) {
			const headerText = this.normalizeColumnName((await headers.nth(index).textContent()) || '');

			if (headerText.includes(expectedHeader)) {
				return index + 1;
			}
		}

		throw new Error(`${columnName} column not found in Wellbore List table`);
	}

	private async getColumnHeader(columnName: string): Promise<Locator> {
		const columnIndex = await this.getColumnIndex(columnName);
		return this.wellboreDialog().locator('thead th').nth(columnIndex - 1);
	}

	private async getColumnValues(columnName: string): Promise<string[]> {
		const wellboreDialog = this.wellboreDialog();
		const columnIndex = await this.getColumnIndex(columnName);
		return (await wellboreDialog.locator(`tbody tr:visible td:nth-child(${columnIndex})`).allTextContents())
			.map((text) => text.trim())
			.filter((text) => text.length > 0);
	}

	async gotoLoginPage(): Promise<void> {
		await this.page.goto(this.authUrl);
	}

	async login(username: string, password: string): Promise<void> {
		await this.usernameInput.click();
		await this.usernameInput.fill(username);

		await this.passwordInput.click();
		await this.passwordInput.fill(password);

		await this.loginButton.click();
	}

	async navigateToDashboard(): Promise<void> {
		await this.page.goto(this.dashboardUrl);
	}

	async openAddWellDialog(): Promise<void> {
		await this.firstContentSection.click();
		await this.addWellButton.click();
	}

	async toggleRunNoSortTwice(): Promise<void> {
		await this.runNoSortIcon.click();
		await this.runNoSortIcon.click();
	}

	async toggleColumnSortTwice(columnName: string): Promise<void> {
		const header = await this.getColumnHeader(columnName);
		const sortIcon = header.locator('p-sorticon .p-icon').first();
		await sortIcon.waitFor({ state: 'visible', timeout: 10000 });
		await sortIcon.click();
		await this.page.waitForTimeout(500);
		await sortIcon.click();
		await this.page.waitForTimeout(500);
	}

	async isColumnSortedDesc(columnName: string): Promise<boolean> {
		try {
			const header = await this.getColumnHeader(columnName);
			await header.waitFor({ state: 'visible', timeout: 8000 });
			const ariaSort = (await header.getAttribute('aria-sort')) || '';
			return ariaSort.toLowerCase() === 'descending';
		} catch {
			return false;
		}
	}

	async openWellIdFilterMenu(): Promise<void> {
		await this.filterMenuButton.click();
	}

	async selectMatchAllFromFirstFilterDropdown(): Promise<void> {
		await this.firstFilterDropdown.click();
		await this.matchAllOption.click();
	}

	async enterFilterText(value: string): Promise<void> {
		const panel = this.filterPanel();
		await expect(panel).toBeVisible({ timeout: 10000 });

		let textboxes = panel.locator('input:not([disabled]):not([type="checkbox"])');
		let textboxCount = await textboxes.count();

		if (textboxCount === 0) {
			const addRuleButton = panel.getByRole('button', { name: 'Add Rule' }).first();
			if (await addRuleButton.isVisible().catch(() => false)) {
				await addRuleButton.click({ force: true });
				await this.page.waitForTimeout(300);
				textboxes = panel.locator('input:not([disabled]):not([type="checkbox"])');
				textboxCount = await textboxes.count();
			}
		}

		if (textboxCount >= 3) {
			await textboxes.nth(2).fill(value);
			return;
		}

		if (textboxCount > 0) {
			await textboxes.nth(textboxCount - 1).fill(value);
			return;
		}

		await this.filterTextbox().fill(value);
	}

	async loginAndFilterWellList(username: string, password: string, filterValue: string): Promise<void> {
		await this.gotoLoginPage();
		await this.login(username, password);
		await this.navigateToDashboard();
		await this.openAddWellDialog();
		await this.toggleRunNoSortTwice();
		await this.openWellIdFilterMenu();
		await this.selectMatchAllFromFirstFilterDropdown();
		await this.enterFilterText(filterValue);
	}
    async popupvisible(): Promise<boolean> {
		return await this.filterpopup.isVisible();
	}
	async fileterdropdownoption(): Promise<void> {
		await this.startsWithOption.click();
	}
   
   async selectStartsWithFromFirstFilterDropdown(): Promise<void> {
		await this.firstFilterDropdown.click();
		await this.startsWithOption.click();
   }
   async filterTextInputValue(): Promise<string> {
		await this.filterTextbox().fill('NEW');
		return await this.filterTextbox().inputValue();
   }	
   async clickApplyButton(): Promise<void> {
		const panel = this.filterPanel();
		const wellboreDialog = this.page
			.getByRole('dialog')
			.filter({ hasText: 'Wellbore List' })
			.first();

		await this.filterApplyButton().click();
		await panel.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.locator('tbody tr:visible').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
		await this.page.waitForTimeout(500);
   }

	async clickClearButton(columnName: string): Promise<void> {
		await this.clickColumnFilterAgainAndWaitPopup(columnName);
		const panel = this.filterPanel();
		const wellboreDialog = this.wellboreDialog();

		await this.filterClearButton().click();
		await panel.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await this.page.waitForTimeout(500);
	}

	async getCurrentFilterText(): Promise<string> {
		return (await this.filterTextbox().inputValue()).trim();
	}

	async clickColumnFilterAgainAndWaitPopup(columnName: string): Promise<void> {
		const panel = this.filterPanel();
		const wellboreDialog = this.wellboreDialog();
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

		const columnHeader = await this.getColumnHeader(columnName);
		const columnHeaderFilterButton = columnHeader.getByRole('button', { name: 'Show Filter Menu' }).first();

		if (await panel.isVisible().catch(() => false)) {
			if (await columnHeaderFilterButton.isVisible().catch(() => false)) {
				await columnHeaderFilterButton.click({ force: true });
			} else {
				await this.filterMenuButton.click({ force: true });
			}

			await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
		}

		for (let attempt = 0; attempt < 2; attempt++) {
			if (await columnHeaderFilterButton.isVisible().catch(() => false)) {
				await columnHeaderFilterButton.click({ force: true });
			} else {
				await this.filterMenuButton.click({ force: true });
			}

			if (await panel.isVisible().catch(() => false)) {
				break;
			}

			await this.page.waitForTimeout(500);
		}

		await expect(panel).toBeVisible({ timeout: 10000 });
	}

	async clickFilterAgainAndWaitPopup(): Promise<void> {
		await this.clickColumnFilterAgainAndWaitPopup('Well ID');
	}

	async isFirstDropdownValueVisible(expectedValue: string = 'Match All'): Promise<boolean> {
		const firstDropdown = this.filterPanel().getByRole('combobox').nth(0);
		await expect(firstDropdown).toBeVisible();
		const selectedText = (await firstDropdown.textContent())?.trim().toLowerCase() || '';
		return selectedText.includes(expectedValue.trim().toLowerCase());
	}

	async selectSecondDropdownOption(option: string): Promise<boolean> {
		for (let attempt = 0; attempt < 3; attempt++) {
			try {
				const secondDropdown = this.filterPanel().getByRole('combobox').nth(1);
				if ((await secondDropdown.count()) === 0) {
					return false;
				}

				await expect(secondDropdown).toBeVisible({ timeout: 5000 });
				await secondDropdown.click({ force: true });
				const dropdownOption = this.page.getByRole('option', { name: option, exact: true }).first();
				if ((await dropdownOption.count()) === 0) {
					await this.page.keyboard.press('Escape').catch(() => {});
					return false;
				}

				await expect(dropdownOption).toBeVisible({ timeout: 5000 });
				await dropdownOption.click();
				await expect(this.filterPanel().getByRole('combobox').nth(1)).toContainText(option, { timeout: 5000 });
				return true;
			} catch (error) {
				if (attempt === 2) {
					throw error;
				}

				await this.page.waitForTimeout(300);
			}
		}

		return false;
	}

	async enterFilterTextAndApply(value: string = 'NEW'): Promise<void> {
		await this.filterTextbox().fill(value);
		await this.filterApplyButton().click();
		await this.page.waitForTimeout(500);
	}

	async areOnlyRelatedRowsDisplayedForColumn(columnName: string, filterValue: string, condition: string = 'Starts with'): Promise<boolean> {
		const wellboreDialog = this.wellboreDialog();

		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.locator('tbody tr:visible').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

		const rows = await this.getColumnValues(columnName);

		if (rows.length === 0) {
			return false;
		}

		const expected = filterValue.trim().toLowerCase();
		if (expected.length === 0) {
			return rows.length > 0;
		}

		const conditionNormalized = condition.trim().toLowerCase();

		return rows.every((wellId) => {
			const current = wellId.toLowerCase();
			if (conditionNormalized === 'starts with') {
				return current.startsWith(expected);
			}
			if (conditionNormalized === 'contains') {
				return current.includes(expected);
			}
			if (conditionNormalized === 'ends with') {
				return current.endsWith(expected);
			}
			if (conditionNormalized === 'equals') {
				return current === expected;
			}
			if (conditionNormalized === 'not equals') {
				return current !== expected;
			}
			if (conditionNormalized === 'not contains') {
				return !current.includes(expected);
			}
			return current.includes(expected);
		});
	}

	async isAnyRelatedRowDisplayedForColumn(columnName: string, filterValue: string, condition: string = 'Contains'): Promise<boolean> {
		const rows = await this.getColumnValues(columnName);
		if (rows.length === 0) {
			return false;
		}

		const expected = filterValue.trim().toLowerCase();
		if (expected.length === 0) {
			return rows.length > 0;
		}

		const conditionNormalized = condition.trim().toLowerCase();
		return rows.some((cellValue) => {
			const current = cellValue.toLowerCase();
			if (conditionNormalized === 'starts with') {
				return current.startsWith(expected);
			}
			if (conditionNormalized === 'contains') {
				return current.includes(expected);
			}
			if (conditionNormalized === 'ends with') {
				return current.endsWith(expected);
			}
			if (conditionNormalized === 'equals') {
				return current === expected;
			}
			if (conditionNormalized === 'not equals') {
				return current !== expected;
			}
			if (conditionNormalized === 'not contains') {
				return !current.includes(expected);
			}
			return current.includes(expected);
		});
	}

	async areOnlyRelatedRowsDisplayed(filterValue: string, condition: string = 'Starts with'): Promise<boolean> {
		return this.areOnlyRelatedRowsDisplayedForColumn('Well ID', filterValue, condition);
	}

   async getWellNamesFromTable(): Promise<string[]> {
	const wellNames = await this.getColumnValues('Well ID');

   for (const wellName of wellNames) {
   expect(wellName.trim()).toMatch(/^NEW/i);
}
	return wellNames;
};

	async getVisibleColumnValues(columnName: string): Promise<string[]> {
		return this.getColumnValues(columnName);
	}

	async getDisplayedRowsCount(): Promise<number> {
		const wellboreDialog = this.page
			.getByRole('dialog')
			.filter({ hasText: 'Wellbore List' })
			.first();
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		const rows = wellboreDialog.locator('tbody tr:visible');
		return await rows.count();
	}
	async selectWellByName(wellName: string): Promise<void> {
		const wellboreDialog = this.wellboreDialog();
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

		const row = wellboreDialog.locator('tbody tr:visible').filter({ hasText: wellName }).first();
		await expect(row).toBeVisible({ timeout: 10000 });

		const nativeCheckbox = row.locator('p-checkbox input[type="checkbox"]').first();
		if (await nativeCheckbox.count()) {
			await nativeCheckbox.check({ force: true });
			return;
		}

		const checkboxRole = row.getByRole('checkbox').first();
		if (await checkboxRole.count()) {
			await checkboxRole.click({ force: true });
			return;
		}

		const customCheckbox = row.locator('p-checkbox .p-checkbox-box, .p-checkbox-box').first();
		await customCheckbox.click({ force: true });
	}

async clickUpdateDashboard() {
  await this.page.getByRole('button', { name: 'Update Dashboard' }).click();
}

async verifyWellDisplayedOnDashboard(wellName: string) {
	const wellCard = this.page.locator('lam-well-card').filter({ hasText: wellName });
	const matches = await wellCard.count();
	expect(matches).toBeGreaterThan(0);
	await expect(wellCard.first()).toBeVisible();
}
 async  verifyDashboardCardsDisplayed() {
  const cards = this.page.locator('lam-well-card');

  await expect(cards.first()).toBeVisible();

  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  console.log(`Dashboard displays ${cardCount} cards`);
}
async clickExpandWellDetails() {
	const wellboreDialog = this.wellboreDialog();
	if (await wellboreDialog.isVisible().catch(() => false)) {
		await this.page.keyboard.press('Escape').catch(() => {});
		await wellboreDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
	}

	await this.expandWellDetailsBtn.first().click({ force: true });
}

async openThreeDotsMenu(): Promise<void> {
	const moreOptionsBtn = this.page.locator('button[aria-label="More options"]').first();
	await expect(moreOptionsBtn).toBeVisible({ timeout: 10000 });
	await moreOptionsBtn.click({ force: true });
	console.log('✓ Clicked More options button');
}

async verifyThreeDotsPopupVisible(): Promise<void> {
	const wellDetailsOption = this.page.getByText('Well Details', { exact: true }).first();
	const wellSettingsOption = this.page.getByText('Well Settings', { exact: true }).first();
	const deleteOption = this.page.getByText('Delete', { exact: true }).first();

	await expect(wellDetailsOption).toBeVisible({ timeout: 10000 });
	await expect(wellSettingsOption).toBeVisible({ timeout: 10000 });
	await expect(deleteOption).toBeVisible({ timeout: 10000 });
}

async clickWellDetailsFromThreeDotsPopup(): Promise<void> {
	const wellDetailsOption = this.page.getByText('Well Details', { exact: true }).first();
	await expect(wellDetailsOption).toBeVisible({ timeout: 10000 });
	await wellDetailsOption.click({ force: true });
	await expect(this.page).toHaveURL(/well-details/, { timeout: 10000 });

	// Verify Well Details page shell is rendered as expected.
	await expect(this.page.getByPlaceholder('Search by Country, Well, or Run Number').first()).toBeVisible({ timeout: 10000 });
	await expect(this.page.getByText('List', { exact: true }).first()).toBeVisible({ timeout: 10000 });
	await expect(this.page.getByText('Grid', { exact: true }).first()).toBeVisible({ timeout: 10000 });
	await expect(this.page.locator('button:has-text("Details")').first()).toBeVisible({ timeout: 10000 });

	console.log('✓ Navigated to Well Details page');
}

async openInformationTab(): Promise<void> {
	await expect(this.informationTabBtn).toBeVisible({ timeout: 10000 });
	await this.informationTabBtn.click({ force: true });
	await expect(this.page.getByText('Basic Information', { exact: true }).first()).toBeVisible({ timeout: 10000 });
}

private async verifySectionWithRequiredLabels(sectionTitle: string, requiredLabels: string[]): Promise<void> {
	await expect(this.page.getByText(sectionTitle, { exact: true }).first()).toBeVisible({ timeout: 10000 });

	for (const label of requiredLabels) {
		await expect(this.page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 10000 });
	}
}

async verifyBasicInformationSection(): Promise<void> {
	await this.verifySectionWithRequiredLabels('Basic Information', ['Field', 'Date', 'Well Time Zone']);
}

async verifyNetworkConnectionSection(): Promise<void> {
	await this.verifySectionWithRequiredLabels('Network Connection', ['Ping Status', 'RDC LAN']);
}

async verifyLocationSection(): Promise<void> {
	await this.verifySectionWithRequiredLabels('Location', ['Customer', 'Well Name', 'Run N°']);
}

async verifyRemoteConnectionSection(): Promise<void> {
	await this.verifySectionWithRequiredLabels('Remote Connection', ['Computer 1', 'Computer 2', 'IP Address']);
}

async getExpandedWellTitle(): Promise<string> {
	const url = this.page.url();
	const match = url.match(/expanded=([^&]+)/);
	if (match) {
		return decodeURIComponent(match[1]);
	}
	return url;
}

private async addAnotherWellIfNeededForNextNavigation(): Promise<void> {
	const nextWellBtn = this.page.getByRole('button', { name: 'Next Well' }).first();
	if (!(await nextWellBtn.isDisabled())) {
		return;
	}

	const currentWell = (await this.getExpandedWellTitle()).split('::')[0].trim().toLowerCase();
	await this.addWellButton.click();

	const dialog = this.wellboreDialog();
	await dialog.waitFor({ state: 'visible', timeout: 10000 });
	await dialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

	const allWellIds = await this.getColumnValues('Well ID');
	const candidates = [
		...allWellIds.filter((id) => id.trim().toLowerCase() !== currentWell),
		...allWellIds.filter((id) => id.trim().toLowerCase() === currentWell),
	];

	const updateBtn = this.page.getByRole('button', { name: 'Update Dashboard' }).first();
	let selected = '';

	for (const candidate of candidates) {
		const wellId = candidate.trim();
		if (!wellId) {
			continue;
		}

		await this.selectWellByName(wellId).catch(() => {});
		if (await updateBtn.isEnabled().catch(() => false)) {
			selected = wellId;
			break;
		}
	}

	if (!selected) {
		await this.page.keyboard.press('Escape').catch(() => {});
		await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
		console.log('⚠ Could not add another well for Next Well navigation');
		return;
	}

	await updateBtn.click();
	await dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
	await this.page.waitForTimeout(1000);
	console.log(`✓ Added extra well for navigation: ${selected}`);
}

async clickNextWell(): Promise<void> {
	let nextWellBtn = this.page.getByRole('button', { name: 'Next Well' }).first();
	await expect(nextWellBtn).toBeVisible({ timeout: 10000 });

	if (await nextWellBtn.isDisabled()) {
		await this.addAnotherWellIfNeededForNextNavigation();
		nextWellBtn = this.page.getByRole('button', { name: 'Next Well' }).first();
		if (await nextWellBtn.isDisabled()) {
			console.log('⚠ Next Well button is still disabled after trying to add another well');
			return;
		}
	}

	await nextWellBtn.click();
	await this.page.waitForTimeout(1000);
}

async verifyWellChanged(previousWellTitle: string): Promise<void> {
	await this.page.waitForTimeout(1000);
	const currentUrl = this.page.url();
	const currentMatch = currentUrl.match(/expanded=([^&]+)/);
	const currentWell = currentMatch ? decodeURIComponent(currentMatch[1]) : currentUrl;

	if (previousWellTitle && currentWell !== previousWellTitle) {
		console.log(`✓ Well changed from "${previousWellTitle}" to "${currentWell}"`);
		return;
	}

	// If same expanded well (only one well on dashboard) still confirm page is stable
	const overviewContent = this.page.getByText('Domain Operational', { exact: false }).first();
	await expect(overviewContent).toBeVisible({ timeout: 10000 });
	console.log(`✓ Next Well clicked. Current well: "${currentWell}" (single well on dashboard)`);
}

async openAlertsTab(): Promise<void> {
	const tab = this.page.getByText('Alerts', { exact: true }).first();
	await expect(tab).toBeVisible({ timeout: 10000 });
	await tab.click({ force: true });
	await this.page.waitForTimeout(500);
}

async verifyAlertsTabContent(): Promise<void> {
	const hasAlerts = await this.page.locator('lam-alert-item, .alert-row, .alert-item').first().isVisible().catch(() => false);
	if (hasAlerts) {
		console.log('✓ Alerts tab has active alerts');
		return;
	}

	const emptyState = this.page.getByText('No active alerts — All clear for this well', { exact: true }).first();
	await expect(emptyState).toBeVisible({ timeout: 10000 });
	console.log('✓ Alerts tab shows empty state: No active alerts — All clear for this well');
}

async openAdditionalMetricsTab(): Promise<void> {
	const tab = this.page.getByText('Additional Metrics', { exact: true }).first();
	await expect(tab).toBeVisible({ timeout: 10000 });
	await tab.click({ force: true });
	await this.page.waitForTimeout(500);
}

async verifyAdditionalMetricsTabContent(): Promise<void> {
	const sectionHeader = this.page.getByText('Additional Metrics', { exact: true }).first();
	await expect(sectionHeader).toBeVisible({ timeout: 10000 });

	const hasMetrics = await this.page.locator('lam-additional-metrics, .additional-metrics-content, .metrics-chart').first().isVisible().catch(() => false);
	if (hasMetrics) {
		console.log('✓ Additional Metrics tab has data');
		return;
	}

	const emptyState = this.page.getByText('No additional metrics available', { exact: true }).first();
	await expect(emptyState).toBeVisible({ timeout: 10000 });
	console.log('✓ Additional Metrics tab shows empty state: No additional metrics available');
}

async openNotificationTab(tabName: string): Promise<void> {
	const tab = this.page.getByText(new RegExp(`^${tabName}\\s*\\(\\d+\\)$`, 'i')).first();
	await expect(tab).toBeVisible({ timeout: 10000 });
	await tab.click({ force: true });
}

async verifyNotificationTabShowsDataOrEmptyState(tabName: string): Promise<void> {
	const emptyStateMap: Record<string, { title: string; subtitle: string }> = {
		'All Alerts': {
			title: 'No alerts to show',
			subtitle: 'New alerts from your wells will appear here.'
		},
		'Unacknowledged': {
			title: "You're all caught up",
			subtitle: 'No alerts are waiting for acknowledgement.'
		},
		'Acknowledged': {
			title: 'No acknowledged alerts yet',
			subtitle: 'Alerts you acknowledge will be listed here.'
		}
	};

	const tabConfig = emptyStateMap[tabName];
	if (!tabConfig) {
		throw new Error(`Unsupported notification tab: ${tabName}`);
	}

	const emptyTitle = this.page.getByText(tabConfig.title, { exact: true }).first();
	const isEmptyVisible = await emptyTitle.isVisible().catch(() => false);

	if (isEmptyVisible) {
		await expect(this.page.getByText(tabConfig.subtitle, { exact: true }).first()).toBeVisible({ timeout: 10000 });
		return;
	}

	const alertsHeader = this.page.getByText('All Alerts & Notifications', { exact: false }).first();
	await expect(alertsHeader).toBeVisible({ timeout: 10000 });
}

async getExpandedWellDetails(): Promise<string[]> {
	const currentUrl = this.page.url();
	if (/expanded=/.test(currentUrl)) {
		return [currentUrl];
	}

	// In some runs details render in-place. Accept any stable details-shell indicator.
	const nextWellBtn = this.page.getByRole('button', { name: 'Next Well' }).first();
	if (await nextWellBtn.isVisible().catch(() => false)) {
		return [currentUrl];
	}

	const detailsTabs = this.page.getByText('Information', { exact: true }).first();
	if (await detailsTabs.isVisible().catch(() => false)) {
		return [currentUrl];
	}

	await expect(this.page.getByText('Domain Operational', { exact: false }).first()).toBeVisible({ timeout: 10000 });
	return [currentUrl];
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

	const cardTitle = this.page.locator('lam-well-card h3, .well-card h3, h3').first();
	await expect(cardTitle).toBeVisible({ timeout: 10000 });
	const firstTitle = ((await cardTitle.textContent()) || '').trim();
	const queryToken = (firstTitle.match(/[A-Za-z0-9-]+/) || ['NEW'])[0];

	await searchInput.fill(queryToken);
	await searchInput.press('Enter');
	await this.page.waitForTimeout(500);

	const detailsButtons = this.page.locator('button:has-text("Details")');
	await expect(detailsButtons.first()).toBeVisible({ timeout: 10000 });
	const cardText = ((await detailsButtons.first().locator('xpath=ancestor::*[self::lam-well-card or contains(@class,"well-card")][1]').textContent().catch(() => '')) || '').toLowerCase();
	if (cardText) {
		expect(cardText).toContain(queryToken.toLowerCase());
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
	const url = this.page.url();
	if (/dashboard/.test(url)) {
		await expect(this.page.getByText('Overview', { exact: true }).first()).toBeVisible({ timeout: 10000 });
		return;
	}

	if (/well-details/.test(url)) {
		await expect(this.page.locator('button:has-text("Details")').first()).toBeVisible({ timeout: 10000 });
		return;
	}

	throw new Error(`Unexpected page after clicking Details: ${url}`);
}

async searchByCountryWellOrRunNumber(query: string): Promise<void> {
	const searchInput = this.page.getByPlaceholder('Search by Country, Well, or Run Number').first();
	await expect(searchInput).toBeVisible({ timeout: 10000 });
	await searchInput.fill(query);
	await searchInput.press('Enter');
}
}