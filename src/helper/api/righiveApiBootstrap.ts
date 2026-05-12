import { APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { getConfig } from '../../config/Max_CommandEnv';

type BootstrapConfig = {
  enabled: boolean;
  baseUrl: string;
  token: string;
  tokenCacheTtlHours: number;
  authTokenEndpoint: string;
  authGrantType: string;
  authClientId: string;
  authClientSecret: string;
  authScope: string;
  authUsername: string;
  authPassword: string;
  wellId: string;
  wellboreId: string;
  wellName: string;
  registerEndpoint: string;
  registerPayload: string;
  publishEndpoint: string;
  publishPayload: string;
};

const TOKEN_FILE_PATH = path.resolve(process.cwd(), 'runtime-info', 'api-token.json');

type TokenCacheFile = {
  token: string;
  createdAt: string;
  expiresAt?: string;
};

function normalizeToken(rawToken: string): string {
  const trimmed = rawToken.trim();
  if (!trimmed) {
    return '';
  }

  const unquoted = trimmed.replace(/^"|"$/g, '');
  return unquoted.replace(/^Bearer\s+/i, '').trim();
}

function parseJsonPayload(value: string, fallback: Record<string, unknown>): Record<string, unknown> {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function resolveConfig(): BootstrapConfig {
  const config = getConfig();
  const fallbackApiBaseUrl = 'https://api.dev.sperrydigital.ienergy.halliburton.com';
  const baseUrl = (process.env.RIGHIVE_API_BASE_URL || process.env.BASE_URL_API || config.apiBaseURL || fallbackApiBaseUrl).trim();
  const token = normalizeToken(process.env.RIGHIVE_API_TOKEN || process.env.API_BEARER_TOKEN || '');
  const tokenCacheTtlHours = Number.parseInt(process.env.RIGHIVE_TOKEN_CACHE_TTL_HOURS || '24', 10);

  const authTokenEndpoint = (
    process.env.RIGHIVE_AUTH_TOKEN_ENDPOINT ||
    'https://authentik.sperrydigital-dev.ienergy.halliburton.com/application/o/token/'
  ).trim();
  const authGrantType = (process.env.RIGHIVE_AUTH_GRANT_TYPE || 'client_credentials').trim();
  const authClientId = (process.env.RIGHIVE_AUTH_CLIENT_ID || '').trim();
  const authClientSecret = (process.env.RIGHIVE_AUTH_CLIENT_SECRET || '').trim();
  const authScope = (process.env.RIGHIVE_AUTH_SCOPE || '').trim();
  const authUsername = (process.env.RIGHIVE_AUTH_USERNAME || process.env.TEST_USERNAME || '').trim();
  const authPassword = (process.env.RIGHIVE_AUTH_PASSWORD || process.env.TEST_PASSWORD || '').trim();

  const rawWellId = (process.env.RIGHIVE_WELL_ID || '').trim();
  const rawWellboreId = (process.env.RIGHIVE_WELLBORE_ID || '').trim();
  const rawWellName = (process.env.RIGHIVE_WELL_NAME || '').trim();

  // Keep identifiers aligned by default to avoid backend upsert/mapping surprises.
  const alignedDefault = rawWellId || rawWellboreId || rawWellName || 'NEWWell5';
  const wellId = rawWellId || alignedDefault;
  const wellboreId = rawWellboreId || alignedDefault;
  const wellName = rawWellName || alignedDefault;

  const defaultRegisterPayload = JSON.stringify({
    wellId: '{{wellId}}',
    wellboreId: '{{wellboreId}}',
    wellName: '{{wellName}}',
    customerName: 'Contoso Energy',
    rigName: 'Rig-7',
    country: 'India NWA',
    region: 'North',
    wellTimeZone: 'UTC',
    runs: [
      {
        wellboreId: '{{wellboreId}}',
        runNumber: '0100',
        startDepth: 0,
        endDepth: 3000,
        startTime: '2026-04-20T08:00:00Z',
        endTime: '2026-04-20T12:00:00Z',
      },
    ],
  });

  return {
    enabled: (process.env.RIGHIVE_OPTION2_ENABLED || 'true').toLowerCase() === 'true',
    baseUrl,
    token,
    tokenCacheTtlHours: Number.isNaN(tokenCacheTtlHours) ? 24 : tokenCacheTtlHours,
    authTokenEndpoint,
    authGrantType,
    authClientId,
    authClientSecret,
    authScope,
    authUsername,
    authPassword,
    wellId,
    wellboreId,
    wellName,
    registerEndpoint: (process.env.RIGHIVE_REGISTER_ENDPOINT || '/logix-alert-management/api/v1/wellbores').trim(),
    registerPayload: process.env.RIGHIVE_REGISTER_PAYLOAD || defaultRegisterPayload,
    publishEndpoint: (process.env.RIGHIVE_PUBLISH_ENDPOINT || '/logix-alert-management/api/v1/alerts/publish').trim(),
    publishPayload:
      process.env.RIGHIVE_PUBLISH_PAYLOAD ||
      '{"wellId":"{{wellId}}","wellboreId":"{{wellboreId}}","wellName":"{{wellName}}","runNumber":"0100","owner":"DrillingApp","alertGroupName":"ABGGammaDetectorsVariationKpi_ID","severity":0,"domain":"BHA","EventDepth":100.0,"PSL":1,"subDomain":"BHA Performance","shortUserMessage":"Pump pressure is above threshold"}',
  };
}

function replaceWellToken(value: string, cfg: Pick<BootstrapConfig, 'wellId' | 'wellboreId' | 'wellName'>): string {
  return value
    .replace(/\{\{\s*wellName\s*\}\}/g, cfg.wellName)
    .replace(/\{\{\s*wellId\s*\}\}/g, cfg.wellId)
    .replace(/\{\{\s*wellboreId\s*\}\}/g, cfg.wellboreId);
}

function withWellData(payload: string, cfg: Pick<BootstrapConfig, 'wellId' | 'wellboreId' | 'wellName'>): Record<string, unknown> {
  return parseJsonPayload(replaceWellToken(payload, cfg), {
    wellId: cfg.wellId,
    wellboreId: cfg.wellboreId,
    wellName: cfg.wellName,
  });
}

function tokenHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function ensureTokenFile(token: string, expiresAt?: string): void {
  const tokenDir = path.dirname(TOKEN_FILE_PATH);
  fs.mkdirSync(tokenDir, { recursive: true });
  const payload: TokenCacheFile = {
    token,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function readTokenCache(): TokenCacheFile | null {
  if (!fs.existsSync(TOKEN_FILE_PATH)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as TokenCacheFile;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const token = normalizeToken(String(parsed.token || ''));
    if (!token) {
      return null;
    }

    return {
      token,
      createdAt: String(parsed.createdAt || ''),
      expiresAt: parsed.expiresAt ? String(parsed.expiresAt) : undefined,
    };
  } catch {
    return null;
  }
}

function isCachedTokenReusable(cache: TokenCacheFile): boolean {
  if (!cache.expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(cache.expiresAt);
  if (Number.isNaN(expiresAtMs)) {
    return false;
  }

  const nowMs = Date.now();
  return nowMs < expiresAtMs;
}

async function callApi(
  request: APIRequestContext,
  url: string,
  token: string,
  payload: Record<string, unknown>,
) {
  return request.post(url, {
    headers: tokenHeaders(token),
    data: payload,
  });
}

function logStepStart(step: string, url: string): void {
  console.log(`\n▶️ ${step} - START`);
  console.log(`   URL: ${url}`);
}

function logStepEnd(step: string, status: number): void {
  console.log(`✅ ${step} - END (status ${status})`);
}

async function generateAccessToken(request: APIRequestContext, cfg: BootstrapConfig): Promise<{ token: string; expiresAt?: string; source: 'cache' | 'auth' | 'static' }> {
  const cached = readTokenCache();
  if (cached && isCachedTokenReusable(cached)) {
    console.log('✅ Reusing cached token from runtime-info/api-token.json (not expired)');
    if (cached.expiresAt) {
      console.log(`   Cached Expires At: ${cached.expiresAt}`);
    }
    return { token: cached.token, expiresAt: cached.expiresAt, source: 'cache' };
  }

  if (cached) {
    console.log('ℹ️ Cached token exists but expired/near-expiry. Generating a fresh token...');
  } else {
    console.log('ℹ️ No cached token found. Generating a fresh token...');
  }

  if (!cfg.authTokenEndpoint) {
    return { token: cfg.token, source: 'static' };
  }

  const requestedGrant = (cfg.authGrantType || 'client_credentials').trim().toLowerCase();
  const grantOrder = requestedGrant === 'client_credentials'
    ? ['client_credentials', 'password']
    : ['password', 'client_credentials'];

  console.log('\n▶️ AUTH TOKEN GENERATION - START');
  console.log(`   URL: ${cfg.authTokenEndpoint}`);
  console.log(`   Preferred Grant Type: ${requestedGrant}`);
  console.log(`   Client ID Present: ${Boolean(cfg.authClientId)}`);
  console.log(`   Client Secret Present: ${Boolean(cfg.authClientSecret)}`);
  console.log(`   Username Present: ${Boolean(cfg.authUsername)}`);

  for (const grantType of grantOrder) {
    if (grantType === 'client_credentials' && (!cfg.authClientId || !cfg.authClientSecret)) {
      console.log('⚠️ AUTH TOKEN ATTEMPT SKIPPED (client_credentials requires client_id and client_secret)');
      continue;
    }

    const authForm: Record<string, string> = { grant_type: grantType };

    if (cfg.authClientId) {
      authForm.client_id = cfg.authClientId;
    }

    if (cfg.authClientSecret) {
      authForm.client_secret = cfg.authClientSecret;
    }

    if (cfg.authScope) {
      authForm.scope = cfg.authScope;
    }

    if (grantType === 'password') {
      if (!cfg.authUsername || !cfg.authPassword) {
        console.log('⚠️ AUTH TOKEN ATTEMPT SKIPPED (password grant missing username/password)');
        continue;
      }
      authForm.username = cfg.authUsername;
      authForm.password = cfg.authPassword;
    }

    console.log(`   ↳ Attempting grant_type=${grantType}`);

    const authResponse = await request.post(cfg.authTokenEndpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: authForm,
    });

    if (authResponse.status() < 200 || authResponse.status() >= 300) {
      const body = await authResponse.text().catch(() => '');
      console.log(`⚠️ AUTH TOKEN ATTEMPT FAILED (grant=${grantType}, status=${authResponse.status()})`);
      console.log(`   ↳ Response: ${body || 'empty-body'}`);
      continue;
    }

    const authBody = await authResponse.json().catch(() => null);
    const accessToken = normalizeToken(String((authBody as Record<string, unknown> | null)?.access_token || ''));

    if (!accessToken) {
      console.log(`⚠️ AUTH TOKEN ATTEMPT FAILED (grant=${grantType}, access_token missing)`);
      continue;
    }

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + cfg.tokenCacheTtlHours * 60 * 60 * 1000).toISOString();

    console.log(`✅ AUTH TOKEN GENERATION - END (grant=${grantType}, status=${authResponse.status()})`);
    console.log('✅ Access token generated from auth endpoint');
    console.log(`   Generated At: ${generatedAt.toISOString()}`);
    console.log(`   Expires At (+${cfg.tokenCacheTtlHours}h): ${expiresAt}`);
    return { token: accessToken, expiresAt, source: 'auth' };
  }

  console.log('⚠️ AUTH TOKEN GENERATION - ALL ATTEMPTS FAILED');
  console.log('   ↳ Falling back to static token (if configured).');
  return { token: cfg.token, source: 'static' };
}

async function getResponseSnippet(response: { text: () => Promise<string> }): Promise<string> {
  const body = await response.text().catch(() => '');
  if (!body) {
    return 'empty-body';
  }

  const compact = body.replace(/\s+/g, ' ').trim();
  if (compact.length <= 220) {
    return compact;
  }

  return `${compact.slice(0, 220)}...`;
}

export async function runRighiveOption2Bootstrap(request: APIRequestContext): Promise<void> {
  const cfg = resolveConfig();
  const appEnv = process.env.APP_ENV || 'local';
  const staticTokenPresent = cfg.token.length > 0;
  const staticTokenPreview = staticTokenPresent ? `${cfg.token.slice(0, 8)}...` : 'NOT_SET';

  console.log(`\n${'='.repeat(70)}`);
  console.log('🚀 API BOOTSTRAP: START');
  console.log(`${'='.repeat(70)}`);
  console.log(`APP_ENV: ${appEnv}`);
  console.log(`API Base URL: ${cfg.baseUrl || 'NOT_SET'}`);
  console.log(`Auth Token Endpoint: ${cfg.authTokenEndpoint || 'NOT_SET'}`);
  console.log(`Auth Client ID Present: ${Boolean(cfg.authClientId)}`);
  console.log(`Static Token Present: ${staticTokenPresent}`);
  console.log(`Static Token Preview: ${staticTokenPreview}`);
  console.log(`Well ID: ${cfg.wellId}`);
  console.log(`Wellbore ID: ${cfg.wellboreId}`);
  console.log(`Well Name: ${cfg.wellName}`);
  if (cfg.wellId !== cfg.wellboreId) {
    console.log('⚠️ Well ID and Wellbore ID differ. Backend may register/update by Well ID key.');
  }

  if (!cfg.enabled) {
    console.log('ℹ️ Righive Option2 bootstrap disabled (RIGHIVE_OPTION2_ENABLED=false)');
    console.log('⏭️ API BOOTSTRAP: SKIPPED');
    console.log(`${'='.repeat(70)}\n`);
    return;
  }

  if (!cfg.baseUrl) {
    console.log('⚠️ Righive Option2 skipped: missing RIGHIVE_API_BASE_URL/BASE_URL_API');
    console.log('⏭️ API BOOTSTRAP: SKIPPED');
    console.log(`${'='.repeat(70)}\n`);
    return;
  }

  const tokenResult = await generateAccessToken(request, cfg);
  const effectiveToken = tokenResult.token;

  if (!effectiveToken) {
    console.log('⚠️ Righive Option2 skipped: token unavailable (auth endpoint config missing and static token missing)');
    console.log('⏭️ API BOOTSTRAP: SKIPPED');
    console.log(`${'='.repeat(70)}\n`);
    return;
  }

  ensureTokenFile(effectiveToken, tokenResult.expiresAt);
  if (tokenResult.source === 'cache') {
    console.log('✅ TOKEN STATUS: USING EXISTING TOKEN (cached)');
    console.log('✅ Using cached token from runtime-info/api-token.json');
  } else if (tokenResult.source === 'auth') {
    console.log('✅ TOKEN STATUS: GENERATED NEW TOKEN');
    console.log('✅ Fresh token generated and cached to runtime-info/api-token.json');
  } else {
    console.log('✅ TOKEN STATUS: USING STATIC TOKEN FROM ENV');
    console.log('✅ Static token loaded and cached to runtime-info/api-token.json');
  }

  const required = {
    RIGHIVE_REGISTER_ENDPOINT: cfg.registerEndpoint,
    RIGHIVE_PUBLISH_ENDPOINT: cfg.publishEndpoint,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.log(`⚠️ Righive Option2 skipped: missing endpoint envs (${missing.join(', ')})`);
    console.log('⏭️ API BOOTSTRAP: SKIPPED');
    console.log(`${'='.repeat(70)}\n`);
    return;
  }

  const registerUrl = `${cfg.baseUrl}${cfg.registerEndpoint}`;
  const publishUrl = `${cfg.baseUrl}${cfg.publishEndpoint}`;

  const registerPayload = withWellData(cfg.registerPayload, cfg);
  const publishPayload = withWellData(cfg.publishPayload, cfg);

  logStepStart('STEP 1/2 Register Well', registerUrl);
  console.log(`   Payload: ${JSON.stringify(registerPayload)}`);
  const registerResponse = await callApi(request, registerUrl, effectiveToken, registerPayload);
  if (registerResponse.status() < 200 || registerResponse.status() >= 300) {
    const body = await registerResponse.text().catch(() => '');
    throw new Error(`Righive register failed: status=${registerResponse.status()}, body=${body}`);
  }
  const registerSnippet = await getResponseSnippet(registerResponse);
  logStepEnd('STEP 1/2 Register Well', registerResponse.status());
  console.log(`   ↳ Response: ${registerSnippet}`);

  logStepStart('STEP 2/2 Publish Alert', publishUrl);
  console.log(`   Payload: ${JSON.stringify(publishPayload)}`);
  const publishResponse = await callApi(request, publishUrl, effectiveToken, publishPayload);

  if (publishResponse.status() < 200 || publishResponse.status() >= 300) {
    const body = await publishResponse.text().catch(() => '');
    throw new Error(`Righive publish failed: status=${publishResponse.status()}, body=${body}`);
  }

  const publishSnippet = await getResponseSnippet(publishResponse);
  logStepEnd('STEP 2/2 Publish Alert', publishResponse.status());
  console.log(`   ↳ Response: ${publishSnippet}`);
  console.log('✅ API BOOTSTRAP: COMPLETE');
  console.log(`${'='.repeat(70)}\n`);
}
