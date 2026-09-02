import { FormatOptions } from '../types';
export declare function toMilliseconds(value: number, unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'): number;
export declare function formatDuration(ms: number, options: FormatOptions): string;
export declare function formatDurationFull(value: number, unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds', options: FormatOptions): string;
export declare function evaluateExpression(expr: string): number | null;
//# sourceMappingURL=index.d.ts.map