import { scanCode } from '../index';

describe('scanCode', () => {
  it('scans multi-line code with duration constants', () => {
    const code = `
const TIMEOUT_SECONDS = 900;
const RETRY_DELAY_MS = 5000;
const CACHE_TTL = 60 * 60 * 24;
const NOT_A_DURATION = "hello world";
`;

    const result = scanCode(code, 'test.ts');
    expect(result.filePath).toBe('test.ts');
    expect(result.totalCount).toBe(3);

    const [timeout, retry, cache] = result.items;

    expect(timeout.token).toBe('900');
    expect(timeout.value).toBe(900);
    expect(timeout.unit).toBe('seconds');
    expect(timeout.formatted).toBe('15m');
    expect(timeout.identifier).toBe('TIMEOUT_SECONDS');

    expect(retry.token).toBe('5000');
    expect(retry.value).toBe(5000);
    expect(retry.unit).toBe('milliseconds');
    expect(retry.formatted).toBe('5s');
    expect(retry.identifier).toBe('RETRY_DELAY_MS');

    expect(cache.token).toBe('60 * 60 * 24');
    expect(cache.value).toBe(86400);
    expect(cache.unit).toBe('seconds');
    expect(cache.formatted).toBe('1d');
    expect(cache.identifier).toBe('CACHE_TTL');
  });

  it('scans yaml/config structures', () => {
    const yaml = `
server:
  port: 8080
  timeout: 30
  keepAliveTimeout: 60
  session_ttl: 3600
`;

    const result = scanCode(yaml, 'server.yaml');
    expect(result.totalCount).toBeGreaterThanOrEqual(3);
    const session = result.items.find(i => i.identifier === 'session_ttl');
    expect(session).toBeDefined();
    expect(session?.value).toBe(3600);
    expect(session?.formatted).toBe('1h');
  });
});
