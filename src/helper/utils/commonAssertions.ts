/**
 * Common Assertions Utilities
 */

import { Page, expect } from '@playwright/test';
import { logger } from './logger';

export class CommonAssertions {
  /**
   * Assert element is visible
   */
  static async assertElementVisible(page: Page, selector: string, timeout = 10000): Promise<void> {
    try {
      await expect(page.locator(selector)).toBeVisible({ timeout });
      logger.info(`Element visible: ${selector}`);
    } catch (error) {
      logger.error(`Element not visible: ${selector}`);
      throw error;
    }
  }

  /**
   * Assert element contains text
   */
  static async assertElementContainsText(page: Page, selector: string, text: string, timeout = 10000): Promise<void> {
    try {
      await expect(page.locator(selector)).toContainText(text, { timeout });
      logger.info(`Element contains text "${text}": ${selector}`);
    } catch (error) {
      logger.error(`Element does not contain text "${text}": ${selector}`);
      throw error;
    }
  }

  /**
   * Assert page contains text
   */
  static async assertPageContainsText(page: Page, text: string): Promise<void> {
    try {
      await expect(page.getByText(text)).toBeVisible();
      logger.info(`Page contains text: "${text}"`);
    } catch (error) {
      logger.error(`Page does not contain text: "${text}"`);
      throw error;
    }
  }

  /**
   * Assert element is hidden
   */
  static async assertElementHidden(page: Page, selector: string): Promise<void> {
    try {
      await expect(page.locator(selector)).toBeHidden();
      logger.info(`Element is hidden: ${selector}`);
    } catch (error) {
      logger.error(`Element is not hidden: ${selector}`);
      throw error;
    }
  }

  /**
   * Assert element is enabled
   */
  static async assertElementEnabled(page: Page, selector: string): Promise<void> {
    try {
      await expect(page.locator(selector)).toBeEnabled();
      logger.info(`Element is enabled: ${selector}`);
    } catch (error) {
      logger.error(`Element is not enabled: ${selector}`);
      throw error;
    }
  }

  /**
   * Assert URL contains
   */
  static async assertUrlContains(page: Page, urlPart: string): Promise<void> {
    try {
      await expect(page).toHaveURL(new RegExp(urlPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      logger.info(`URL contains: ${urlPart}`);
    } catch (error) {
      logger.error(`URL does not contain: ${urlPart}`);
      throw error;
    }
  }

  /**
   * Assert title contains
   */
  static async assertTitleContains(page: Page, title: string): Promise<void> {
    try {
      await expect(page).toHaveTitle(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      logger.info(`Page title contains: ${title}`);
    } catch (error) {
      logger.error(`Page title does not contain: ${title}`);
      throw error;
    }
  }
}

export default CommonAssertions;
