import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { globalPage } from '../../../src/hooks/testHooks';
import { MaxCommandLoginPage } from '../../../src/pages/0001_Max_CommandLogin';
import { MaxCommandHomepage } from '../../../src/pages/01_Max_Homepage';

let homepagePage: MaxCommandHomepage;
let loginPage: MaxCommandLoginPage;

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
  homepagePage = new MaxCommandHomepage(globalPage);
  await homepagePage.navigateToHomepage();
  console.log('✓ Navigated to application homepage');
});

When('User is on application homepage', async function () {
  homepagePage = new MaxCommandHomepage(globalPage);
  const isLoaded = await homepagePage.isApplicationLoaded();
  expect(isLoaded).toBe(true);
  console.log('✓ User is on application homepage');
});

/**
 * Application Verification Steps
 */
Then('Application should be fully loaded', async function () {
  homepagePage = new MaxCommandHomepage(globalPage);
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
