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
             
	}

	private filterPanel(): Locator {
		return this.page
			.locator('div')
			.filter({ has: this.page.getByRole('button', { name: 'Apply' }) })
			.filter({ has: this.page.getByRole('button', { name: 'Clear' }) })
			.first();
	}

	private filterTextbox(): Locator {
		return this.filterPanel().locator('input[type="text"]:not([disabled])').first();
	}

	private filterApplyButton(): Locator {
		return this.filterPanel().getByRole('button', { name: 'Apply' }).first();
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

	async openWellIdFilterMenu(): Promise<void> {
		await this.filterMenuButton.click();
	}

	async selectMatchAllFromFirstFilterDropdown(): Promise<void> {
		await this.firstFilterDropdown.click();
		await this.matchAllOption.click();
	}

	async enterFilterText(value: string): Promise<void> {
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
		await this.filterApplyButton().click();
   }

	async getCurrentFilterText(): Promise<string> {
		return (await this.filterTextbox().inputValue()).trim();
	}

	async clickFilterAgainAndWaitPopup(): Promise<void> {
		const panel = this.filterPanel();
		if (await panel.isVisible().catch(() => false)) {
			return;
		}

		const wellboreDialog = this.page.getByRole('dialog').filter({ hasText: 'Wellbore List' }).first();
		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

		const wellIdHeaderFilterButton = wellboreDialog
			.getByRole('button', { name: 'Show Filter Menu' })
			.first();

		for (let attempt = 0; attempt < 2; attempt++) {
			if (await wellIdHeaderFilterButton.isVisible().catch(() => false)) {
				await wellIdHeaderFilterButton.click({ force: true });
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

	async isFirstDropdownValueVisible(expectedValue: string = 'Match All'): Promise<boolean> {
		const firstDropdown = this.filterPanel().getByRole('combobox').nth(0);
		await expect(firstDropdown).toBeVisible();
		const selectedText = (await firstDropdown.textContent())?.trim().toLowerCase() || '';
		return selectedText.includes(expectedValue.trim().toLowerCase());
	}

	async selectSecondDropdownOption(option: string): Promise<void> {
		const secondDropdown = this.filterPanel().getByRole('combobox').nth(1);
		await secondDropdown.click();
		await this.page.getByRole('option', { name: option }).first().click();
	}

	async enterFilterTextAndApply(value: string = 'NEW'): Promise<void> {
		await this.filterTextbox().fill(value);
		await this.filterApplyButton().click();
		await this.page.waitForTimeout(500);
	}

	async areOnlyRelatedRowsDisplayed(filterValue: string, condition: string = 'Starts with'): Promise<boolean> {
		const wellboreDialog = this.page
			.getByRole('dialog')
			.filter({ hasText: 'Wellbore List' })
			.first();

		await wellboreDialog.waitFor({ state: 'visible', timeout: 10000 });
		await wellboreDialog.locator('.skeleton-table-row').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
		await wellboreDialog.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

		const wellboreRows = wellboreDialog.locator('tbody tr td:nth-child(3)');

		const rows = (await wellboreRows.allTextContents())
			.map((text) => text.trim())
			.filter((text) => text.length > 0);

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

   async getWellNamesFromTable(): Promise<string[]> {
	const wellNames = await this.page.locator('tbody tr td:nth-child(3)').allTextContents();

   for (const wellName of wellNames) {
   expect(wellName.trim()).toMatch(/^NEW/i);
}
	return wellNames;
};	
}
