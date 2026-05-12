import { test } from '@playwright/test';
import { setupBeforeAll, setupBeforeEachTest, teardownAfterAll } from '../hooks/testHooks';

/**
 * Standard Playwright Fixtures
 * Provides hooks and utilities for standard Playwright tests
 */

test.beforeAll(setupBeforeAll);
test.beforeEach(setupBeforeEachTest);
test.afterAll(teardownAfterAll);

export default test;
