export interface TimeScopeSettings {
    defaultUnit:
        | "seconds"
        | "milliseconds"
        | "microseconds"
        | "nanoseconds"
        | "auto";
    format: "compact" | "verbose" | "both";
    minValue: number;
    maxValue: number;
    showBreakdown: boolean;
    showUnitLabel: boolean;
    contextClues: boolean;
    ignorePatterns: string[];
    keywords: string[];
}
export declare const DEFAULT_SETTINGS: TimeScopeSettings;
export interface DetectedDuration {
    value: number;
    unit: "seconds" | "milliseconds" | "microseconds" | "nanoseconds";
    confidence: number;
    source: "heuristic" | "context";
    contextHint?: string;
}
export interface FormatOptions {
    format: "compact" | "verbose" | "both";
    showBreakdown: boolean;
    showUnitLabel: boolean;
}
export interface DetectedItem extends DetectedDuration {
    token: string;
    line: number;
    column: number;
    formatted: string;
    lineContext: string;
    identifier?: string;
}
export interface ScanResult {
    filePath?: string;
    items: DetectedItem[];
    totalCount: number;
}
export interface FileScanResult extends ScanResult {
    filePath: string;
}
//# sourceMappingURL=index.d.ts.map
