import { test } from '@playwright/test';
import { setupBeforeAll, setupBeforeEachTest, teardownAfterAll } from '../hooks/testHooks';

/**
 * BDD Fixtures for Cucumber tests
 * Provides hooks and utilities for BDD-style tests
 */

test.beforeAll(setupBeforeAll);
test.beforeEach(setupBeforeEachTest);
test.afterAll(teardownAfterAll);

export default test;
