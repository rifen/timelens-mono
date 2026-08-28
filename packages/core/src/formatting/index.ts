import { FormatOptions } from '../types';

const UNITS = [
  { unit: 'year', ms: 31557600000, short: 'y' },
  { unit: 'week', ms: 604800000, short: 'w' },
  { unit: 'day', ms: 86400000, short: 'd' },
  { unit: 'hour', ms: 3600000, short: 'h' },
  { unit: 'minute', ms: 60000, short: 'm' },
  { unit: 'second', ms: 1000, short: 's' },
  { unit: 'millisecond', ms: 1, short: 'ms' }
];

export function toMilliseconds(value: number, unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'): number {
  switch (unit) {
    case 'seconds': return value * 1000;
    case 'milliseconds': return value;
    case 'microseconds': return value / 1000;
    case 'nanoseconds': return value / 1_000_000;
  }
}

export function formatDuration(ms: number, options: FormatOptions): string {
  if (ms < 1) {
    return options.format === 'verbose' ? 'less than 1 millisecond' : '<1ms';
  }

  const breakdown = computeBreakdown(ms);

  const compact = formatCompact(breakdown);
  const verbose = formatVerbose(breakdown);

  if (options.format === 'compact') return compact;
  if (options.format === 'verbose') return verbose;
  return `${verbose} (${compact})`;
}

export function formatDurationFull(
  value: number,
  unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds',
  options: FormatOptions
): string {
  const ms = toMilliseconds(value, unit);
  return formatDuration(ms, options);
}

export function evaluateExpression(expr: string): number | null {
  // Remove spaces and validate characters
  const sanitized = expr.replace(/\s+/g, '');
  
  // Only allow digits, operators, parentheses, and decimal points
  if (!/^[\d+\-*/().]+$/.test(sanitized)) {
    return null;
  }
  
  // Prevent extremely long expressions
  if (sanitized.length > 100) {
    return null;
  }
  
  try {
    // Use Function constructor for safe arithmetic evaluation
    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + sanitized)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }
    
    return result;
  } catch {
    return null;
  }
}

function computeBreakdown(ms: number): Array<{ unit: string; short: string; value: number }> {
  let remaining = ms;
  const result: Array<{ unit: string; short: string; value: number }> = [];

  for (const { unit, ms: unitMs, short } of UNITS) {
    if (remaining >= unitMs) {
      const value = Math.floor(remaining / unitMs);
      result.push({ unit, short, value });
      remaining = remaining % unitMs;
    }
  }

  return result;
}

function formatCompact(breakdown: Array<{ unit: string; short: string; value: number }>): string {
  if (breakdown.length === 0) return '<1ms';
  const toShow = breakdown.slice(0, 2);
  return toShow.map(({ short, value }) => `${value}${short}`).join(' ');
}

function formatVerbose(breakdown: Array<{ unit: string; short: string; value: number }>): string {
  if (breakdown.length === 0) return 'less than 1 millisecond';

  return breakdown
    .map(({ unit, value }) => {
      const plural = value !== 1 ? 's' : '';
      return `${value} ${unit}${plural}`;
    })
    .join(', ');
}