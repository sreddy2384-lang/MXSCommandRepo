import { BasePage } from './001_Max_CommandBasePage';
import { Page, Locator } from '@playwright/test';
import { getConfig } from '../config/Max_CommandEnv';

/**
 * MaxCommandLoginPage - Self-Healing Pattern
 * Handles login functionality with multiple selector fallbacks
 */
export class MaxCommandLoginPage extends BasePage {
  private readonly TIMEOUT = 3000;
  private readonly LOGIN_VERIFY_TIMEOUT = 10000;

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
    
    // Debug: Log page state if all locators fail
    console.error(`✗ [SELF-HEALING] Unable to locate ${name}`);
    console.log(`📍 Current URL: ${this.page.url()}`);
    
    // Get page title and any visible text to help debug
    const pageTitle = await this.page.title();
    console.log(`📄 Page Title: ${pageTitle}`);
    
    // Check if we're on a blank page or login page
    const bodyContent = await this.page.locator('body').textContent();
    const bodyLength = bodyContent?.length || 0;
    console.log(`📏 Body content length: ${bodyLength}`);
    
    if (bodyLength < 100) {
      console.log('⚠️ Page appears to be blank or loading');
      console.log(`Body text: ${bodyContent?.substring(0, 200)}`);
    }
    
    throw new Error(`✗ [SELF-HEALING] Unable to locate ${name} - All locators failed`);
  }

  private async clickLocator(locators: Locator[], name: string) {
    const el = await this.resolve(locators, name);
    await el.click();
    console.log(`✓ [CLICK] Clicked: ${name}`);
  }

  private async fillLocator(locators: Locator[], value: string, name: string) {
    const el = await this.resolve(locators, name);
    await el.clear();
    await el.fill(value);
    console.log(`✓ [FILL] Filled ${name} with value`);
  }

  // ======================
  // Locators - Multiple Fallbacks
  // ======================
  private usernameInputs(): Locator[] {
    return [
      this.page.locator('input[name="uidself_service_login"]'),
      this.page.locator('input[name="uidField"]'),
      this.page.locator('#username'),
      this.page.getByPlaceholder(/username|email|login/i),
      this.page.locator('input[type="text"]').first(),
    ];
  }

  private passwordInputs(): Locator[] {
    return [
      this.page.locator('input[name="pselfservice_login"]'),
      this.page.locator('input[type="password"]'),
      this.page.getByPlaceholder(/password/i),
    ];
  }

  private loginButtons(): Locator[] {
    return [
      this.page.getByRole('button', { name: /log in|sign in|submit/i }),
      this.page.locator('button[type="submit"]'),
      this.page.locator('button').first(),
    ];
  }

  private dashboardIndicators(): Locator[] {
    return [
      this.page.getByText('Logix Alert Management'),
      this.page.locator('h1, [class*="dashboard"], [data-testid="dashboard"]'),
      this.page.getByRole('button', { name: /add well/i }),
      this.page.getByText(/^Dashboard$/i),
      this.page.locator('nav, [class*="sidebar"], [class*="menu"]'),
    ];
  }

  private logoutButtons(): Locator[] {
    return [
      this.page.getByRole('button', { name: /logout|sign out/i }),
      this.page.locator('[class*="logout"]'),
      this.page.locator('a:has-text("Logout")'),
    ];
  }

  // ======================
  // Public Actions
  // ======================
  async navigateToLogin(): Promise<void> {
    const config = getConfig();
    const baseURL = config.baseURL;
    
    if (!baseURL) {
      throw new Error('❌ Base URL not configured in .env file');
    }
    
    console.log(`[LOGIN] 🌐 Navigating to: ${baseURL}`);
    
    try {
      await this.page.goto(baseURL, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log(`✓ [LOGIN] Successfully navigated to login page`);
    } catch (error) {
      console.error(`❌ [LOGIN] Navigation failed: ${error}`);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<void> {
    console.log('[LOGIN] Starting login process...');
    
    // FIRST: Navigate to login page (critical!)
    await this.navigateToLogin();
    console.log('[LOGIN] ✓ Navigated to login page');
    
    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    console.log('[LOGIN] ✓ Page DOM loaded');
    
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('[LOGIN] ⚠️ Network idle timeout, continuing anyway...');
    });
    console.log('[LOGIN] ✓ Page network settled');

    // Wait extra time for forms to render
    await this.page.waitForTimeout(3000);

    console.log('[LOGIN] Filling username...');
    await this.fillLocator(this.usernameInputs(), username, 'Username input');

    console.log('[LOGIN] Filling password...');
    await this.fillLocator(this.passwordInputs(), password, 'Password input');

    console.log('[LOGIN] Clicking login button...');
    await this.clickLocator(this.loginButtons(), 'Login button');

    // After clicking login, wait up to 2 minutes for redirect/page load
    console.log('[LOGIN] ⏳ Waiting up to 2 minutes for login redirect...');
    const startTime = Date.now();
    const maxWaitTime = 120000; // 2 minutes
    
    try {
      // Wait for navigation/redirect to complete
      await this.page.waitForLoadState('domcontentloaded', { timeout: maxWaitTime });
      console.log('[LOGIN] ✓ Page redirected and DOM loaded');
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.log(`[LOGIN] ⚠️ Timeout after ${elapsedTime}ms waiting for redirect, but continuing...`);
    }

    // Wait for network to settle (up to 2 more minutes if needed)
    console.log('[LOGIN] ⏳ Waiting for page to fully stabilize...');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: maxWaitTime }).catch(() => {
        console.log('[LOGIN] ⚠️ Network idle timeout');
      });
    } catch {
      // Ignore timeout
    }

    // Final stabilization wait
    await this.page.waitForTimeout(3000);

    const currentUrl = this.page.url();
    console.log(`[LOGIN] ✓ Login completed. Current URL: ${currentUrl}`);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // If still on the login flow URL, wait up to 30s for it to redirect away
      if (this.page.url().includes('/if/flow/')) {
        console.log('[LOGIN VERIFY] Still on auth flow URL, waiting for redirect...');
        await this.page.waitForURL(
          url => !url.toString().includes('/if/flow/'),
          { timeout: 30000 }
        ).catch(() => {
          console.log('[LOGIN VERIFY] No redirect detected within 30s');
        });
      }

      await this.page.waitForLoadState('domcontentloaded', { timeout: this.LOGIN_VERIFY_TIMEOUT }).catch(() => {});
      await this.page.waitForLoadState('networkidle', { timeout: this.LOGIN_VERIFY_TIMEOUT }).catch(() => {});

      const config = getConfig();
      const currentUrl = this.page.url().toLowerCase();
      const appUrl = config.appURL.toLowerCase();
      const appHost = new URL(appUrl).hostname.toLowerCase();
      const isOnAppDomain = currentUrl.includes(appHost);
      const isOnAppPath = currentUrl.includes('logix-alert-management');
      const isAuthFlow = currentUrl.includes('/if/flow/') || currentUrl.includes('authentik');

      // Fast path: already on protected app URL.
      if (isOnAppDomain && isOnAppPath && !isAuthFlow) {
        return true;
      }

      // Authentik user library page (/if/user/) means authentication succeeded —
      // the login form is gone and the user is redirected to "My applications".
      if (currentUrl.includes('/if/user/')) {
        console.log('✓ User is logged in (authentik user library detected)');
        return true;
      }

      const indicators = this.dashboardIndicators();
      for (const indicator of indicators) {
        try {
          await indicator.first().waitFor({ state: 'visible', timeout: this.LOGIN_VERIFY_TIMEOUT });
          console.log('✓ User is logged in');
          return true;
        } catch {
          // try next indicator
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.clickLocator(this.logoutButtons(), 'Logout button');
      await this.page.waitForLoadState('networkidle');
      console.log('✓ Logout successful');
    } catch (error) {
      console.log('⚠️ Logout button not found, may not be logged in');
    }
  }

  async loginAndNavigateToApp(username: string, password: string): Promise<void> {
    console.log('[LOGIN FLOW] ========== STARTING LOGIN AND NAVIGATION ==========');
    
    // STEP 1: Login first
    console.log('[LOGIN FLOW] STEP 1: Logging in...');
    await this.login(username, password);
    console.log('[LOGIN FLOW] STEP 1 ✓ Login completed successfully');
    
    // STEP 2: Verify login succeeded
    console.log('[LOGIN FLOW] STEP 2: Verifying login...');
    const isLogged = await this.isLoggedIn();
    console.log(`[LOGIN FLOW] STEP 2 ✓ Login verified: ${isLogged}`);
    
    // STEP 3: Navigate to actual application
    console.log('[LOGIN FLOW] STEP 3: Navigating to actual application...');
    const config = getConfig();
    const appURL = config.appURL;
    
    console.log(`[LOGIN FLOW] 🔄 Navigating to: ${appURL}`);
    
    try {
      // Navigate directly to the app
      await this.page.goto(appURL, { 
        waitUntil: 'domcontentloaded',
        timeout: 120000 // 2 minutes
      });
      console.log('[LOGIN FLOW] ✓ Successfully navigated to application');
    } catch (error: any) {
      const errorMsg = error?.message || '';
      console.log(`[LOGIN FLOW] ⚠️ Navigation error: ${errorMsg}`);
      
      // If ERR_ABORTED, the page might still load via redirect
      if (errorMsg.includes('ERR_ABORTED')) {
        console.log('[LOGIN FLOW] ERR_ABORTED detected - page may redirect, continuing...');
        await this.page.waitForTimeout(3000);
      } else {
        throw error;
      }
    }
    
    // STEP 4: Wait for app page to fully stabilize
    console.log('[LOGIN FLOW] STEP 4: Waiting for application to fully load (up to 2 min)...');
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 120000 });
      console.log('[LOGIN FLOW] ✓ App page DOM ready');
    } catch {
      console.log('[LOGIN FLOW] ⚠️ Timeout on DOM ready, continuing...');
    }
    
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 120000 });
      console.log('[LOGIN FLOW] ✓ App page fully loaded (network idle)');
    } catch {
      console.log('[LOGIN FLOW] ⚠️ Timeout on network idle, continuing...');
    }
    
    // Final stabilization
    await this.page.waitForTimeout(3000);
    
    const finalUrl = this.page.url();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅✅✅ LOGIN DONE ✅✅✅`);
    console.log(`📍 Final URL: ${finalUrl}`);
    console.log(`${'='.repeat(70)}\n`);
  }
}