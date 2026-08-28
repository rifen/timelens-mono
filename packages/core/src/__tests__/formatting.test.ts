import { toMilliseconds, formatDurationFull, evaluateExpression } from '../formatting';

describe('toMilliseconds', () => {
  it('converts seconds to milliseconds', () => {
    expect(toMilliseconds(30, 'seconds')).toBe(30000);
    expect(toMilliseconds(1, 'seconds')).toBe(1000);
  });

  it('converts milliseconds to milliseconds', () => {
    expect(toMilliseconds(500, 'milliseconds')).toBe(500);
    expect(toMilliseconds(1000, 'milliseconds')).toBe(1000);
  });

  it('converts microseconds to milliseconds', () => {
    expect(toMilliseconds(1000, 'microseconds')).toBe(1);
    expect(toMilliseconds(500000, 'microseconds')).toBe(500);
  });

  it('converts nanoseconds to milliseconds', () => {
    expect(toMilliseconds(1000000, 'nanoseconds')).toBe(1);
    expect(toMilliseconds(500000000, 'nanoseconds')).toBe(500);
  });
});

describe('formatDurationFull', () => {
  it('formats compact output', () => {
    expect(formatDurationFull(30000, 'milliseconds', { format: 'compact', showBreakdown: true, showUnitLabel: true })).toBe('30s');
  });

  it('formats verbose output', () => {
    expect(formatDurationFull(30000, 'milliseconds', { format: 'verbose', showBreakdown: true, showUnitLabel: true })).toBe('30 seconds');
  });

  it('formats both compact and verbose', () => {
    expect(formatDurationFull(30000, 'milliseconds', { format: 'both', showBreakdown: true, showUnitLabel: true })).toBe('30 seconds (30s)');
  });

  it('shows unit labels when enabled', () => {
    expect(formatDurationFull(5000, 'milliseconds', { format: 'compact', showBreakdown: true, showUnitLabel: true })).toBe('5s');
  });
});

describe('evaluateExpression', () => {
  it('returns number for plain numbers', () => {
    expect(evaluateExpression('30000')).toBe(30000);
    expect(evaluateExpression('60')).toBe(60);
  });

  it('evaluates simple arithmetic', () => {
    expect(evaluateExpression('60 * 40 * 24')).toBe(57600);
    expect(evaluateExpression('1000 * 60 * 60')).toBe(3600000);
  });

  it('respects operator precedence', () => {
    expect(evaluateExpression('10 + 20 * 30')).toBe(610);
    expect(evaluateExpression('(10 + 20) * 30')).toBe(900);
  });

  it('rejects invalid expressions', () => {
    expect(evaluateExpression('1; rm -rf /')).toBeNull();
    expect(evaluateExpression('import os')).toBeNull();
    expect(evaluateExpression('hello')).toBeNull();
  });
});