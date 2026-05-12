import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables from .env file (quiet mode - no console logs)
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

export type AppEnv = 'dev' | 'qa' | 'stage' | 'prod' | 'local';
export type BrowserType = 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge';

type Config = {
  baseURL: string;
  apiBaseURL: string;
  appURL: string;
  browser: BrowserType;
  headless: boolean;
  slowMo: number;
};

const configs: Record<AppEnv, Config> = {
  // Local development environment
  local: {
    baseURL: 'https://authentik.sperrydigital-dev.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/',
    apiBaseURL: 'https://api.dev.sperrydigital.ienergy.halliburton.com',
    appURL: 'https://sperrydigital-dev.ienergy.halliburton.com/logix-alert-management',
    browser: 'edge',
    headless: false,
    slowMo: 0,
  },
  // Development environment
  dev: {
    baseURL: 'https://authentik.sperrydigital-dev.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/',
    apiBaseURL: 'https://api.dev.sperrydigital.ienergy.halliburton.com',
    appURL: 'https://sperrydigital-dev.ienergy.halliburton.com/logix-alert-management',
    browser: 'edge',
    headless: false,
    slowMo: 0,
  },
  // QA environment
  qa: {
    baseURL: 'https://authentik.sperrydigital-qa.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/',
    appURL: 'https://sperrydigital-qa.ienergy.halliburton.com/logix-alert-management',
    apiBaseURL: '', // Add API URL if needed
    browser: 'edge',
    headless: false,
    slowMo: 0,
  },
  // Staging environment
  stage: {
    baseURL: 'https://authentik.sperrydigital-stage.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/',
    appURL: 'https://sperrydigital-stage.ienergy.halliburton.com/logix-alert-management',
    apiBaseURL: '', // Add API URL if needed
    browser: 'edge',
    headless: false,
    slowMo: 0,
  },
  // Production environment
  prod: {
    baseURL: 'https://authentik.sperrydigital.ienergy.halliburton.com/if/flow/hal-local-authentication-flow/',
    appURL: 'https://sperrydigital.ienergy.halliburton.com/logix-alert-management',
    apiBaseURL: '', // Add API URL if needed
    browser: 'edge',
    headless: true, // Run headless in production
    slowMo: 0,
  },
};

export function getConfig(env: AppEnv = (process.env.APP_ENV as AppEnv) ?? 'local'): Config {
  const base = configs[env];
  return {
    baseURL: process.env.BASE_URL ?? base.baseURL,
    appURL: process.env.APP_URL ?? base.appURL,
    apiBaseURL: process.env.BASE_URL_API ?? base.apiBaseURL,
    browser: (process.env.BROWSER as BrowserType) ?? base.browser,
    headless: process.env.HEADLESS === 'true' ? true : base.headless,
    slowMo: process.env.SLOW_MO ? Number.parseInt(process.env.SLOW_MO, 10) : base.slowMo,
  };
}

/**
 * Get the MCP Server port with dynamic fallback
 * Priority: .mcp-port file > MCP_SERVER_PORT env variable > default 4000
 */
export function getMcpServerPort(): number {
  const portFilePath = path.resolve(process.cwd(), '.mcp-port');

  // 1. Try reading from .mcp-port file (written by mcp-server.js)
  if (fs.existsSync(portFilePath)) {
    try {
      const fileContent = fs.readFileSync(portFilePath, 'utf-8').trim();
      const filePort = Number.parseInt(fileContent, 10);
      if (!Number.isNaN(filePort) && filePort > 0) {
        return filePort;
      }
    } catch {
      // Fall through to next option
    }
  }

  // 2. Try environment variable
  if (process.env.MCP_SERVER_PORT) {
    const envPort = Number.parseInt(process.env.MCP_SERVER_PORT, 10);
    if (!Number.isNaN(envPort) && envPort > 0) {
      return envPort;
    }
  }

  // 3. Default to 4000
  return 4000;
}

/**
 * Get the full MCP Server URL
 */
export function getMcpServerUrl(): string {
  const baseUrl = process.env.MCP_SERVER_URL || 'http://localhost';
  const port = getMcpServerPort();
  return `${baseUrl}:${port}`;
}

/**
 * Get test credentials from environment
 */
export function getTestCredentials() {
  return {
    username: process.env.TEST_USERNAME || '',
    password: process.env.TEST_PASSWORD || '',
  };
}
