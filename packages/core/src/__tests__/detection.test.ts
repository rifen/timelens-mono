import { detectDuration, DEFAULT_SETTINGS } from '../index';

describe('detectDuration', () => {
  const defaults = DEFAULT_SETTINGS;

  it('detects milliseconds from explicit _MS suffix', () => {
    const result = detectDuration('5000', 'TIMEOUT_MS = 5000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(5000);
    expect(result?.unit).toBe('milliseconds');
  });

  it('detects microseconds from _US suffix', () => {
    const result = detectDuration('1000', 'DURATION_US = 1000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(1000);
    expect(result?.unit).toBe('microseconds');
  });

  it('detects nanoseconds from _NS suffix', () => {
    const result = detectDuration('5000000000', 'NANOS = 5000000000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(5000000000);
    expect(result?.unit).toBe('nanoseconds');
  });

  it('ignores long plain numbers that look like Unix timestamps', () => {
    const result = detectDuration('1700000000', 'timestamp = 1700000000', { ...defaults });
    expect(result).toBeNull();
  });

  it('returns context hint when detected via keyword', () => {
    const result = detectDuration('30000', 'RETRY_DELAY = 30000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.contextHint).toBe('keyword: "RETRY_DELAY"');
  });

  it('detects expressions', () => {
    const result = detectDuration('60 * 40 * 24', 'INTERVAL = 60 * 40 * 24', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(57600);
    expect(result?.unit).toBe('seconds');
  });
});