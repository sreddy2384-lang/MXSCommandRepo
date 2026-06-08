import { Then, When } from '@cucumber/cucumber';
import { globalPage } from '../../../../src/hooks/testHooks';
import { WellDetailsPage } from '../../../../src/pages/03_Well_Details';

let wellDetailsPage: WellDetailsPage;

When('user Click on well Details tab', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.openWellDetailsTabFromSidebar();
  console.log('✓ Clicked Well Details tab');
});

Then('is navigates to the Well deatials tab', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.verifyWellDetailsPageLoaded();
  console.log('✓ Navigated to Well Details tab');
});

Then('User search the search box Results should displayed', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.searchWellDetailsAndVerifyResults();
  console.log('✓ Search results are displayed in Well Details');
});

Then('Clear the search go to cards click on Details button', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.clearSearchAndOpenFirstWellDetailsCard();
  console.log('✓ Cleared search and clicked Details button');
});

When('the page navigates to Wells', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.verifyWellsDataDisplayedAfterDetailsClick();
  console.log('✓ Page navigated to Wells view');
});

Then('the data should be display', async function () {
  wellDetailsPage = new WellDetailsPage(globalPage);
  await wellDetailsPage.verifyWellsDataDisplayedAfterDetailsClick();
  console.log('✓ Wells data is displayed');
});
