import { scanCode, toGCF, toGenericGCF, toGraphGCF } from '../index';

describe('GCF Integration', () => {
  const sampleCode = `
const TIMEOUT_SECONDS = 900;
const RETRY_DELAY_MS = 5000;
const SESSION_TTL = 3600;
const CACHE_EXPIRY = 60 * 60 * 24;
`;

  it('serializes scan results to GCF generic format', () => {
    const scan = scanCode(sampleCode, 'server.ts');
    const gcfOutput = toGCF(scan);

    expect(gcfOutput).toContain('GCF profile=generic');
    expect(gcfOutput).toContain('## durations');
    expect(gcfOutput).toContain('TIMEOUT_SECONDS');
    expect(gcfOutput).toContain('15m');
    expect(gcfOutput).toContain('RETRY_DELAY_MS');
    expect(gcfOutput).toContain('5s');
    expect(gcfOutput).toContain('SESSION_TTL');
    expect(gcfOutput).toContain('1h');
    expect(gcfOutput).toContain('CACHE_EXPIRY');
    expect(gcfOutput).toContain('1d');
  });

  it('serializes scan results to GCF graph format', () => {
    const scan = scanCode(sampleCode, 'server.ts');
    const graphOutput = toGraphGCF(scan, { toolName: 'timelens_test' });

    expect(graphOutput).toContain('tool=timelens_test');
    expect(graphOutput).toContain('server.ts');
    expect(graphOutput).toContain('server.ts#TIMEOUT_SECONDS');
    expect(graphOutput).toContain('defines_duration');
  });

  it('is significantly more compact than standard JSON representation', () => {
    const scan = scanCode(sampleCode, 'server.ts');
    const jsonOutput = JSON.stringify(scan, null, 2);
    const gcfOutput = toGCF(scan);

    // GCF should be at least 40% shorter in raw characters than verbose JSON
    expect(gcfOutput.length).toBeLessThan(jsonOutput.length * 0.6);
  });
});
