import { ScanResult, DetectedItem, GCFOptions } from "../types";
/**
 * Serializes arbitrary structured data to GCF (generic tabular profile).
 */
export declare function toGenericGCF(data: unknown): string;
/**
 * Formats scan results into a GCF graph payload (code graph profile) with symbols and edges.
 */
export declare function toGraphGCF(
   results: ScanResult | ScanResult[],
   options?: {
      toolName?: string;
      tokenBudget?: number;
   },
): string;
/**
 * Converts TimeScope scan results or items into GCF format.
 */
export declare function toGCF(
   data: ScanResult | ScanResult[] | DetectedItem[],
   options?: GCFOptions,
): string;
//# sourceMappingURL=index.d.ts.map
