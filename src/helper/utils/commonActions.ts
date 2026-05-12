/**
 * Common Actions Utilities
 */

import { Page } from '@playwright/test';
import { logger } from './logger';

export class CommonActions {
  /**
   * Click element with visibility wait
   */
  static async click(page: Page, selector: string, timeout = 10000): Promise<void> {
    try {
      await page.locator(selector).waitFor({ state: 'visible', timeout });
      await page.locator(selector).click();
      logger.info(`Clicked: ${selector}`);
    } catch (error) {
      logger.error(`Failed to click: ${selector}`);
      throw error;
    }
  }

  /**
   * Fill input field
   */
  static async fill(page: Page, selector: string, value: string, timeout = 10000): Promise<void> {
    try {
      await page.locator(selector).waitFor({ state: 'visible', timeout });
      await page.locator(selector).clear();
      await page.locator(selector).fill(value);
      logger.info(`Filled: ${selector} with value`);
    } catch (error) {
      logger.error(`Failed to fill: ${selector}`);
      throw error;
    }
  }

  /**
   * Type text slowly
   */
  static async type(page: Page, selector: string, value: string, timeout = 10000): Promise<void> {
    try {
      await page.locator(selector).waitFor({ state: 'visible', timeout });
      await page.locator(selector).type(value, { delay: 50 });
      logger.info(`Typed: ${selector}`);
    } catch (error) {
      logger.error(`Failed to type: ${selector}`);
      throw error;
    }
  }

  /**
   * Get text from element
   */
  static async getText(page: Page, selector: string): Promise<string> {
    try {
      const text = await page.locator(selector).textContent();
      logger.info(`Got text from: ${selector}`);
      return text || '';
    } catch (error) {
      logger.error(`Failed to get text from: ${selector}`);
      throw error;
    }
  }

  /**
   * Wait for page to load
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      logger.info('Page load complete');
    } catch (error) {
      logger.error('Failed to wait for page load');
      throw error;
    }
  }

  /**
   * Navigate to URL
   */
  static async navigate(page: Page, url: string): Promise<void> {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      logger.info(`Navigated to: ${url}`);
    } catch (error) {
      logger.error(`Failed to navigate to: ${url}`);
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  static async isVisible(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }
}

export default CommonActions;
