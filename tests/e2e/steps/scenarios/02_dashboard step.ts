import { When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { globalPage } from '../../../../src/hooks/testHooks';
import { LogixAddWellPage } from '../../../../src/pages/scenarios/LogixAddWellPage';
import { DashboardPage } from '../../../../src/pages/02_Dashboard';

let homepagePage: LogixAddWellPage;
let dashboardPage: DashboardPage;
let dashboardFilterText = '';
let dashboardFilterCondition = 'Starts with';

When('openAddWellDialogue should be visible', async function () {
  homepagePage = new LogixAddWellPage(globalPage);
  const isVisible = await homepagePage.isAddWellButtonVisible();
  expect(isVisible).toBe(true);
  await homepagePage.clickAddWellButton();
  const isPopupVisible = await homepagePage.isWellboreListPopupVisible();
  expect(isPopupVisible).toBe(true);
  console.log('✓ + Add Well button is visible');
});

When('toggleRunNoSortTwice should sort the list ascending then descending', async function () {
  homepagePage = new LogixAddWellPage(globalPage);
  await homepagePage.toggleRunNoSortTwice();
  const isSortedDesc = await homepagePage.isRunNoSortedDesc();
  expect(isSortedDesc).toBe(true);
  console.log('✓ List is sorted descending after second click');
});

When('user opens Well ID filter again and waits for popup', async function () {
  dashboardPage = new DashboardPage(globalPage);
  await dashboardPage.clickFilterAgainAndWaitPopup();
  console.log('✓ Reopened Well ID filter and popup is visible');
});

When('user verifies first filter dropdown shows Match All', async function () {
  dashboardPage = new DashboardPage(globalPage);
  const isMatchAllVisible = await dashboardPage.isFirstDropdownValueVisible('Match All');
  expect(isMatchAllVisible).toBe(true);
  console.log('✓ First filter dropdown shows Match All');
});

When('user selects {string} in second filter dropdown', async function (option: string) {
  dashboardPage = new DashboardPage(globalPage);
  dashboardFilterCondition = option;
  await dashboardPage.selectSecondDropdownOption(option);
  console.log(`✓ Selected ${option} in second filter dropdown`);
});

When('user clicks Apply without changing first dropdown and textbox', async function () {
  dashboardPage = new DashboardPage(globalPage);
  dashboardFilterText = await dashboardPage.getCurrentFilterText();
  await dashboardPage.clickApplyButton();
  console.log(`✓ Clicked Apply with existing textbox value: ${dashboardFilterText}`);
});

When('only related wells should be displayed for selected filter', async function () {
  dashboardPage = new DashboardPage(globalPage);
  const isFiltered = await dashboardPage.areOnlyRelatedRowsDisplayed(dashboardFilterText, dashboardFilterCondition);
  expect(isFiltered).toBe(true);
  console.log(`✓ Only related wells are displayed for ${dashboardFilterCondition} ${dashboardFilterText}`);
});


