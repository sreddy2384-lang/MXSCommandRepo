/**
 * Global Setup Configuration
 * Runs once before all tests
 */

import { getConfig } from './Max_CommandEnv';

export async function globalSetup(): Promise<void> {
  const config = getConfig();

  console.log('═'.repeat(60));
  console.log('🚀 MAX Command Test Suite - Global Setup');
  console.log('═'.repeat(60));
  console.log(`
Environment Configuration:
  • Browser: ${config.browser}
  • Headless: ${config.headless}
  • Base URL: ${config.baseURL}
  • Slow Mo: ${config.slowMo}ms
  ${config.slowMo > 0 ? '⚠️  Slow motion enabled - tests will run slower' : ''}
  `);
  console.log('═'.repeat(60));

  // Additional global setup can be added here
  // - Database connections
  // - API setup
  // - Mock server setup
  // - Seed data creation
}

export default globalSetup;
