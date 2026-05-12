import { Page, BrowserContext, Browser, chromium, firefox, webkit, request } from '@playwright/test';
import { BeforeAll, Before, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { getConfig, getTestCredentials } from '../config/Max_CommandEnv';
import { MaxCommandLoginPage } from '../pages/0001_Max_CommandLogin';
import { runRighiveOption2Bootstrap } from '../helper/api/righiveApiBootstrap';

/**
 * Set default timeout for all hooks and steps to 3 minutes
 * (Launching browser, login and app load can take time)
 */
setDefaultTimeout(180000);

/**
 * Global state for browser and context
 *
 * Isolation pattern (mirrors reference fixture):
 *   - One browser launched once (BeforeAll)
 *   - One context shared (preserves login cookies across scenarios)
 *   - loginTab  : dedicated tab used only for authentication, never reused for scenarios
 *   - scenarioPage : fresh tab per scenario; closed + recreated after a failure
 *   - globalPage   : always points to the current scenarioPage (used by all step definitions)
 */
let globalBrowser: Browser;
let globalContext: BrowserContext;
let loginTab: Page;          // dedicated login tab – kept alive, never used for scenarios
let scenarioPage: Page | null = null;   // active scenario tab
let lastScenarioPassed = true;          // tracks whether the previous scenario passed

// globalPage exported for step definitions – always points to the current scenarioPage
let globalPage: Page;

/**
 * BeforeAll Hook - Runs ONCE before all tests
 *
 * 1. API bootstrap
 * 2. Launch browser
 * 3. Create shared context (all tabs share cookies → one login)
 * 4. Open dedicated loginTab, authenticate once
 * 5. loginTab stays alive but is never used for scenarios
 */
BeforeAll(async function () {
  const config = getConfig();
  const credentials = getTestCredentials();

  console.log('\n🔁 BeforeAll: Starting API bootstrap before browser launch...');
  const apiContext = await request.newContext();
  try {
    await runRighiveOption2Bootstrap(apiContext);
    console.log('✅ BeforeAll: API bootstrap finished. Continuing with browser setup...\n');
  } finally {
    await apiContext.dispose();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔧 Setting up test environment - Browser: ${config.browser}, Headless: ${config.headless}`);
  console.log(`${'='.repeat(60)}\n`);

  let browser;
  let launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: config.headless,
    slowMo: config.slowMo,
  };

  switch (config.browser) {
    case 'firefox':
      browser = firefox;
      break;
    case 'webkit':
      browser = webkit;
      break;
    case 'edge':
      browser = chromium;
      launchOptions = { ...launchOptions, channel: 'msedge' };
      break;
    case 'chrome':
      browser = chromium;
      launchOptions = { ...launchOptions, channel: 'chrome' };
      break;
    case 'chromium':
    default:
      browser = chromium;
      break;
  }

  globalBrowser = await browser.launch(launchOptions);
  console.log('✅ Browser launched');

  // One shared context – all tabs inside share cookies / session storage
  globalContext = await globalBrowser.newContext({
    permissions: ['geolocation'],
  });
  console.log('✅ Shared browser context created');

  // Dedicated login tab – used only for authentication, never touched by scenarios
  loginTab = await globalContext.newPage();
  console.log('✅ Login tab created');

  console.log('\n🔐 Authenticating...');
  try {
    const loginPage = new MaxCommandLoginPage(loginTab);
    await loginPage.loginAndNavigateToApp(credentials.username, credentials.password);
    console.log('\n✅✅✅ LOGIN DONE ✅✅✅');
    console.log(`📍 Login tab URL: ${loginTab.url()}\n`);
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
});

/**
 * Before Hook - Runs BEFORE EACH SCENARIO
 *
 * Isolation pattern (mirrors reference fixture):
 *   - If previous scenario FAILED  → close that tab, open a fresh one
 *   - If previous scenario PASSED  → reuse the tab (already on a clean URL)
 *   - Always navigate to dashboard URL so every scenario starts clean
 *   - globalPage is updated to point to the current scenarioPage
 */
Before(async function (scenario: any) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 SCENARIO: ${scenario.pickle.name}`);
  console.log(`${'='.repeat(70)}`);

  const config = getConfig();
  const dashboardUrl = `${config.appURL}/dashboard`;

  try {
    // If the previous scenario failed, close its tab and open a fresh one
    if (!lastScenarioPassed || !scenarioPage || scenarioPage.isClosed()) {
      if (scenarioPage && !scenarioPage.isClosed()) {
        await scenarioPage.close();
        console.log('🗑️  Closed previous scenario tab (scenario had failed)');
      }
      scenarioPage = await globalContext.newPage();
      console.log('🆕 Fresh scenario tab created');
    }

    // Always navigate to a clean dashboard URL to dismiss any leftover popups/state
    console.log(`🔄 Navigating to clean state: ${dashboardUrl}`);
    await scenarioPage.goto(dashboardUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    }).catch((error: any) => {
      if (error?.message?.includes('ERR_ABORTED')) {
        console.log('⚠️ ERR_ABORTED on navigation, continuing...');
      } else {
        throw error;
      }
    });

    await scenarioPage.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('⚠️ Network idle timeout – continuing anyway');
    });

    // Point globalPage to the active scenario tab so all step definitions work unchanged
    globalPage = scenarioPage;

    console.log(`✅ Scenario tab ready: ${scenarioPage.url()}`);
    console.log('');
    return globalPage;
  } catch (error) {
    console.error('❌ Before hook failed:', error);
    throw error;
  }
});

/**
 * After Hook - Runs AFTER EACH SCENARIO
 *
 * - Tracks whether the scenario passed or failed
 * - If FAILED: marks flag so Before will close + recreate tab next time
 * - If PASSED: reuses tab (Before will just navigate it clean)
 */
After(async function (scenario: any) {
  lastScenarioPassed = scenario.result?.status !== 'FAILED';

  if (!lastScenarioPassed) {
    console.log(`❌ Scenario FAILED: "${scenario.pickle.name}" – tab will be replaced before next scenario`);
  } else {
    console.log(`✅ Scenario PASSED: "${scenario.pickle.name}"`);
  }

  console.log('⏳ Waiting 2 seconds before next scenario...');
  if (scenarioPage && !scenarioPage.isClosed()) {
    await scenarioPage.waitForTimeout(2000);
  }
});

/**
 * AfterAll Hook - Cleanup after all tests
 */
AfterAll(async function () {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🏁 CLOSING TEST SESSION`);
  console.log(`${'='.repeat(70)}`);

  if (scenarioPage && !scenarioPage.isClosed()) {
    await scenarioPage.close();
    console.log('✅ Scenario tab closed');
  }

  if (loginTab && !loginTab.isClosed()) {
    await loginTab.close();
    console.log('✅ Login tab closed');
  }

  if (globalContext) {
    await globalContext.close();
    console.log('✅ Context closed');
  }

  if (globalBrowser) {
    await globalBrowser.close();
    console.log('✅ Browser closed');
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ TEST SESSION COMPLETE`);
  console.log(`${'='.repeat(70)}\n`);
});

/**
 * Export globalPage for use in step definitions.
 * It always points to the current scenarioPage set in the Before hook.
 */
export async function setupBeforeEachTest(): Promise<Page> {
  return globalPage;
}

/**
 * setupBeforeAll - for use with Playwright test.beforeAll
 * Mirrors the Cucumber BeforeAll logic so playwright-fixtures.ts can reuse it.
 */
export async function setupBeforeAll(): Promise<void> {
  const config = getConfig();
  const credentials = getTestCredentials();

  const apiContext = await request.newContext();
  try {
    await runRighiveOption2Bootstrap(apiContext);
  } finally {
    await apiContext.dispose();
  }

  let browser;
  let launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: config.headless,
    slowMo: config.slowMo,
  };

  switch (config.browser) {
    case 'firefox':
      browser = firefox;
      launchOptions = { ...launchOptions };
      break;
    case 'webkit':
      browser = webkit;
      break;
    case 'edge':
      browser = chromium;
      launchOptions = { ...launchOptions, channel: 'msedge' };
      break;
    case 'chrome':
      browser = chromium;
      launchOptions = { ...launchOptions, channel: 'chrome' };
      break;
    case 'chromium':
    default:
      browser = chromium;
      break;
  }

  globalBrowser = await browser.launch(launchOptions);
  globalContext = await globalBrowser.newContext({ permissions: ['geolocation'] });
  loginTab = await globalContext.newPage();

  const loginPage = new MaxCommandLoginPage(loginTab);
  await loginPage.loginAndNavigateToApp(credentials.username, credentials.password);
}

/**
 * teardownAfterAll - for use with Playwright test.afterAll
 * Mirrors the Cucumber AfterAll cleanup logic.
 */
export async function teardownAfterAll(): Promise<void> {
  if (loginTab && !loginTab.isClosed()) await loginTab.close();
  if (globalContext) await globalContext.close();
  if (globalBrowser) await globalBrowser.close();
}

export { globalPage, globalContext, globalBrowser };
