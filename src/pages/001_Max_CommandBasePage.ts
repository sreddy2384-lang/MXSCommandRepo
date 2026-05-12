import { Page, expect } from '@playwright/test';

/**
 * BasePage - Parent class for all page objects
 * 
 * Provides common functionality:
 * - Navigation
 * - Element interactions
 * - Waits and assertions
 * - Logging
 */
export class BasePage {
  protected page: Page;
  protected readonly timeout = 10000;
  protected readonly networkTimeout = 30000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log(`✓ Navigated to: ${url}`);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: this.networkTimeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout: this.networkTimeout });
    await this.page.waitForTimeout(2000); // Extra buffer
  }

  /**
   * Click an element with visibility check
   */
  async click(selector: string, description: string = ''): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: this.timeout });
    await locator.click();
    console.log(`✓ Clicked: ${description || selector}`);
  }

  /**
   * Fill text input with clear
   */
  async fill(selector: string, value: string, description: string = ''): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: this.timeout });
    await locator.clear();
    await locator.fill(value);
    console.log(`✓ Filled ${description || selector}: ${value}`);
  }

  /**
   * Type text slowly (char by char)
   */
  async type(selector: string, value: string, description: string = ''): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: this.timeout });
    await locator.type(value, { delay: 50 });
    console.log(`✓ Typed ${description || selector}: ${value}`);
  }

  /**
   * Get text from element
   */
  async getText(selector: string): Promise<string> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: this.timeout });
    return await locator.textContent({ timeout: this.timeout }) || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element with text
   */
  async waitForText(selector: string, text: string): Promise<void> {
    await this.page.locator(`${selector}:has-text("${text}")`).waitFor({ state: 'visible', timeout: this.timeout });
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
    console.log('✓ Navigated back');
  }

  /**
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    console.log('✓ Page refreshed');
  }

  /**
   * Wait for specific time (in ms)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Assert element is visible
   */
  async assertVisible(selector: string, description: string = ''): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible({ timeout: this.timeout });
    console.log(`✓ Assertion passed - ${description || selector} is visible`);
  }

  /**
   * Assert element contains text
   */
  async assertContainsText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text, { timeout: this.timeout });
    console.log(`✓ Assertion passed - ${selector} contains "${text}"`);
  }

  /**
   * Assert page contains text
   */
  async assertPageContainsText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible({ timeout: this.timeout });
    console.log(`✓ Assertion passed - Page contains "${text}"`);
  }
}
