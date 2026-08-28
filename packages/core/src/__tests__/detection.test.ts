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

  it('detects seconds from _S suffix', () => {
    const result = detectDuration('2', 'RETRY_DELAY_S = 2', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(2);
    expect(result?.unit).toBe('seconds');
    expect(result?.confidence).toBe(0.95);
  });

  it('detects milliseconds from MILLISECONDS full-word suffix', () => {
    const result = detectDuration('500', 'MIN_TIMEOUT_MILLISECONDS = 500', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(500);
    expect(result?.unit).toBe('milliseconds');
    expect(result?.confidence).toBe(0.95);
  });

  it('detects microseconds from MICROSECONDS full-word suffix', () => {
    const result = detectDuration('1500000', 'LONG_WAIT_MICROSECONDS = 1500000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(1500000);
    expect(result?.unit).toBe('microseconds');
    expect(result?.confidence).toBe(0.95);
  });

  it('detects nanoseconds from NANOSECONDS full-word suffix', () => {
    const result = detectDuration('750', 'VERY_SHORT_NANOSECONDS = 750', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.value).toBe(750);
    expect(result?.unit).toBe('nanoseconds');
    expect(result?.confidence).toBe(0.95);
  });

  it('detects bare nanoseconds value as nanoseconds unit', () => {
    const result = detectDuration('900000000000', 'BARE_NANOS = 900000000000', { ...defaults });
    expect(result).not.toBeNull();
    expect(result?.unit).toBe('nanoseconds');
  });

  it('ignores DATE patterns', () => {
    const result = detectDuration('2024-01-15', 'DATE = 2024-01-15', { ...defaults });
    expect(result).toBeNull();
  });

  it('returns null for NEGATIVE values (rejected by sanitize)', () => {
    const result = detectDuration('-5000', 'NEGATIVE = -5000', { ...defaults });
    expect(result).toBeNull();
  });
});
