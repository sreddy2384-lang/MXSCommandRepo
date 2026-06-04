import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { globalPage } from '../../../src/hooks/testHooks';
import { MaxCommandLoginPage } from '../../../src/pages/0001_Max_CommandLogin';
import { LogixAddWellPage } from '../../../src/pages/scenarios/LogixAddWellPage';

let homepagePage: LogixAddWellPage;
let loginPage: MaxCommandLoginPage;
let wellFilterValue = '';

/**
 * Background Steps - Login User
 */
Given('User is logged in to MAX Command', async function () {
  // The @Before hook automatically runs before this step
  // Verify we have a valid page
  if (!globalPage || globalPage.isClosed()) {
    throw new Error('Page is not available - hook may have failed');
  }
  
  loginPage = new MaxCommandLoginPage(globalPage);
  
  // Verify user is logged in
  const isLoggedIn = await loginPage.isLoggedIn();
  expect(isLoggedIn).toBe(true);
  console.log('✓ User is logged in');
});

/**
 * Application Navigation Steps
 */
When('User navigates to homepage', async function () {
  homepagePage = new LogixAddWellPage(globalPage);
  await homepagePage.navigateToHomepage();
  console.log('✓ Navigated to application homepage');
});

When('User is on application homepage', async function () {
  homepagePage = new LogixAddWellPage(globalPage);
  const isLoaded = await homepagePage.isApplicationLoaded();
  expect(isLoaded).toBe(true);
  console.log('✓ User is on application homepage');
});

/**
 * Application Verification Steps
 */
Then('Application should be fully loaded', async function () {
  homepagePage = new LogixAddWellPage(globalPage);
  const isLoaded = await homepagePage.isApplicationLoaded();
  expect(isLoaded).toBe(true);
  console.log('✓ Application is fully loaded');
});

Then('Logix Alert Management title should be visible', async function () {
  const isVisible = await homepagePage.isAppTitleVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Logix Alert Management title is visible');
});

Then('Navigation sidebar should be visible', async function () {
  const isVisible = await homepagePage.isNavigationMenuVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Navigation sidebar is visible');
});

When('User clicks on Add Well button', async function () {
  await homepagePage.clickAddWellButton();
  console.log('✓ Clicked on Add Well button');
});

Then('Wellbore List popup should be displayed', async function () {
  const isVisible = await homepagePage.isWellboreListPopupVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Wellbore List popup is displayed');
});

Then('Wellbore table headers should be visible', async function () {
  const headers = ['Well ID', 'Run No.', 'Last Edited By', 'Rig Name', 'Latitude', 'Longitude', 'Country', 'Region'];
  const areVisible = await homepagePage.areWellboreHeadersVisible(headers);
  expect(areVisible).toBe(true);
  console.log('✓ Wellbore table headers are visible');
});

Then('Wellbore table should have data rows', async function () {
  const hasRows = await homepagePage.isWellboreTablePopulated();
  expect(hasRows).toBe(true);
  console.log('✓ Wellbore table has data rows');
});

Then('Wellbore popup search input should be visible', async function () {
  const isVisible = await homepagePage.isWellboreSearchInputVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Wellbore popup search input is visible');
});

Then('Wellbore popup action button should be disabled when no well is selected', async function () {
  const isDisabled = await homepagePage.isWellboreActionButtonDisabledWithNoSelection();
  expect(isDisabled).toBe(true);
  console.log('✓ Wellbore popup action button is disabled when no well is selected');
});

When('User selects first well checkbox in popup', async function () {
  await homepagePage.selectFirstWellCheckboxInPopup();
  console.log('✓ Selected first well checkbox in popup');
});

Then('Wellbore popup action button should be visible and enabled', async function () {
  const isReady = await homepagePage.isWellboreActionButtonVisibleAndEnabled();
  expect(isReady).toBe(true);
  console.log('✓ Wellbore popup action button is visible and enabled');
});

Then('Wellbore popup close button should be visible', async function () {
  const isVisible = await homepagePage.isWellboreCloseButtonVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Wellbore popup close button is visible');
});

When('User closes Wellbore popup', async function () {
  await homepagePage.closeWellboreListPopupForValidation();
  console.log('✓ Wellbore popup is closed by user action');
});

Then('Wellbore List popup should be closed', async function () {
  const isClosed = await homepagePage.isWellboreListPopupClosed();
  expect(isClosed).toBe(true);
  console.log('✓ Wellbore List popup is closed');
});

When('User clicks on Search Well input in popup', async function () {
  await homepagePage.clickSearchWellInputInPopup();
  console.log('✓ Clicked on Search Well input in popup');
});

When('User searches well using RIGHIVE_WELL_NAME from env', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  await homepagePage.searchWellInPopup(wellName);
  console.log(`✓ Searched well using RIGHIVE_WELL_NAME: ${wellName}`);
});

Then('Searched well should be visible in popup results', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  const isVisible = await homepagePage.isSearchedWellVisibleInPopupResults(wellName);
  expect(isVisible).toBe(true);
  console.log(`✓ Searched well is visible in popup results: ${wellName}`);
});

When('User selects searched well checkbox in popup', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  await homepagePage.selectSearchedWellCheckboxInPopup(wellName);
  console.log(`✓ Selected searched well checkbox in popup: ${wellName}`);
});

When('User clicks Add to Dashboard button in popup', async function () {
  await homepagePage.clickAddToDashboardButtonInPopup();
  console.log('✓ Clicked Add to Dashboard button in popup');
});

Then('same searched well should be displayed on dashboard', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  const isAdded = await homepagePage.isSearchedWellAddedToDashboard(wellName);
  expect(isAdded).toBe(true);
  console.log(`✓ Popup closed and searched well is displayed on dashboard: ${wellName}`);
});

Then('Popup should close and same searched well should be displayed on dashboard', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  const isAdded = await homepagePage.isSearchedWellAddedToDashboard(wellName);
  expect(isAdded).toBe(true);
  console.log(`✓ Popup closed and searched well is displayed on dashboard: ${wellName}`);
});

When('User clicks Well ID filter icon in popup', async function () {
  await homepagePage.clickWellIdFilterIconInPopup();
  console.log('✓ Clicked Well ID filter icon in popup');
});

Then('Well ID filter popup should be displayed', async function () {
  const isVisible = await homepagePage.isWellIdFilterPopupVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Well ID filter popup is displayed');
});

Then('Well ID filter dropdowns should be visible', async function () {
  const areVisible = await homepagePage.areWellIdFilterDropdownsVisible();
  expect(areVisible).toBe(true);
  console.log('✓ Well ID filter dropdowns are visible');
});

Then('Match All should be selected in first filter dropdown', async function () {
  const isSelected = await homepagePage.isFirstWellIdFilterDropdownSelected('Match All');
  expect(isSelected).toBe(true);
  console.log('✓ Match All is selected in first filter dropdown');
});

Then('Starts with should be selected in second filter dropdown', async function () {
  const isSelected = await homepagePage.isSecondWellIdFilterDropdownSelected('Starts with');
  expect(isSelected).toBe(true);
  console.log('✓ Starts with is selected in second filter dropdown');
});

When('User selects Match All in first filter dropdown', async function () {
  await homepagePage.selectWellIdFilterDropdownOption(0, 'Match All');
  console.log('✓ Selected Match All in first filter dropdown');
});

When('User selects Starts with in second filter dropdown', async function () {
  await homepagePage.selectWellIdFilterDropdownOption(1, 'Starts with');
  console.log('✓ Selected Starts with in second filter dropdown');
});

When('User enters well filter value from env in filter textbox', async function () {
  const wellName = process.env.RIGHIVE_WELL_NAME || '';
  expect(wellName, 'RIGHIVE_WELL_NAME must be set in .env').not.toEqual('');

  wellFilterValue = wellName.trim().slice(0, 3) || wellName.trim();
  await homepagePage.enterWellIdFilterText(wellFilterValue);
  console.log(`✓ Entered Well ID filter text: ${wellFilterValue}`);
});

When('User clicks Apply in Well ID filter popup', async function () {
  await homepagePage.clickApplyInWellIdFilterPopup();
  console.log('✓ Clicked Apply in Well ID filter popup');
});

Then('Filtered well rows should be displayed', async function () {
  const hasFilteredRows = await homepagePage.areFilteredWellRowsVisible(wellFilterValue);
  expect(hasFilteredRows).toBe(true);
  console.log('✓ Filtered well rows are displayed');
});

Then('Well ID filter should be applied', async function () {
  const isApplied = await homepagePage.isWellIdFilterApplied(wellFilterValue);
  expect(isApplied).toBe(true);
  console.log('✓ Well ID filter is applied');
});

When('User selects Contains in second filter dropdown', async function () {
  await homepagePage.selectWellIdFilterDropdownOption(1, 'Contains');
  await homepagePage.enterWellIdFilterText(wellFilterValue);
  console.log('✓ Changed second filter dropdown to Contains with same text');
});

When('User enters 12 in filter textbox and submits filter', async function () {
  wellFilterValue = '12';
  await homepagePage.enterWellIdFilterTextAndSubmit(wellFilterValue);
  console.log('✓ Entered 12 in filter textbox and submitted filter');
});
