export interface FormatOptions {
  format: 'compact' | 'verbose' | 'both';
  showBreakdown: boolean;
  showUnitLabel: boolean;
}

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
  
  // Show max 2 units for compact
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

export function formatDurationFull(
  value: number,
  unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds',
  options: FormatOptions
): string {
  const ms = toMilliseconds(value, unit);
  return formatDuration(ms, options);
}