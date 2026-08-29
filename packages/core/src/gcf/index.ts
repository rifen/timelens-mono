import { encode, encodeGeneric, Payload, Symbol, Edge } from '@blackwell-systems/gcf';
import { ScanResult, DetectedItem, GCFOptions } from '../types';

/**
 * Serializes arbitrary structured data to GCF (generic tabular profile).
 */
export function toGenericGCF(data: unknown): string {
  return encodeGeneric(data);
}

/**
 * Formats scan results into a GCF graph payload (code graph profile) with symbols and edges.
 */
export function toGraphGCF(
  results: ScanResult | ScanResult[],
  options: { toolName?: string; tokenBudget?: number } = {}
): string {
  const scanArray = Array.isArray(results) ? results : [results];
  const tool = options.toolName || 'timelens_scan';
  const tokenBudget = options.tokenBudget || 4000;

  const symbols: Symbol[] = [];
  const edges: Edge[] = [];

  for (const scan of scanArray) {
    const fileQualifiedName = scan.filePath || 'anonymous_source';
    
    // File / Module Symbol
    symbols.push({
      qualifiedName: fileQualifiedName,
      kind: 'module',
      score: 1.0,
      provenance: 'timelens_scan',
      distance: 0,
      signature: `${scan.items.length} duration(s) detected`
    });

    for (let i = 0; i < scan.items.length; i++) {
      const item = scan.items[i];
      const itemName = item.identifier
        ? `${fileQualifiedName}#${item.identifier}`
        : `${fileQualifiedName}:L${item.line}:${item.token}`;

      // Constant / Duration Symbol
      symbols.push({
        qualifiedName: itemName,
        kind: 'constant',
        score: item.confidence,
        provenance: item.source === 'context' ? 'context_clues' : 'heuristic',
        distance: 1,
        signature: `${item.token} -> ${item.formatted} (${item.unit})`
      });

      // Edge from file to duration symbol
      edges.push({
        source: fileQualifiedName,
        target: itemName,
        edgeType: 'defines_duration'
      });
    }
  }

  const payload: Payload = {
    tool,
    tokenBudget,
    tokensUsed: 0,
    symbols,
    edges
  };

  return encode(payload);
}

/**
 * Converts TimeScope scan results or items into GCF format.
 */
export function toGCF(
  data: ScanResult | ScanResult[] | DetectedItem[],
  options: GCFOptions = {}
): string {
  if (options.profile === 'graph') {
    if (Array.isArray(data) && data.length > 0 && 'items' in data[0]) {
      return toGraphGCF(data as ScanResult[], options);
    }
    if (!Array.isArray(data) && 'items' in data) {
      return toGraphGCF(data as ScanResult, options);
    }
  }

  // Generic profile
  if (Array.isArray(data)) {
    if (data.length > 0 && 'items' in data[0]) {
      // Array of ScanResult
      const flattened = (data as ScanResult[]).flatMap(scan =>
        scan.items.map(item => ({
          file: scan.filePath || 'anonymous',
          line: item.line,
          col: item.column,
          name: item.identifier || '',
          token: item.token,
          value: item.value,
          unit: item.unit,
          formatted: item.formatted,
          confidence: item.confidence,
          hint: item.contextHint || ''
        }))
      );
      return encodeGeneric({ durations: flattened });
    } else {
      // Array of DetectedItem
      const items = (data as DetectedItem[]).map(item => ({
        line: item.line,
        col: item.column,
        name: item.identifier || '',
        token: item.token,
        value: item.value,
        unit: item.unit,
        formatted: item.formatted,
        confidence: item.confidence,
        hint: item.contextHint || ''
      }));
      return encodeGeneric({ durations: items });
    }
  }

  if ('items' in data) {
    const scan = data as ScanResult;
    const items = scan.items.map(item => ({
      file: scan.filePath || 'anonymous',
      line: item.line,
      col: item.column,
      name: item.identifier || '',
      token: item.token,
      value: item.value,
      unit: item.unit,
      formatted: item.formatted,
      confidence: item.confidence,
      hint: item.contextHint || ''
    }));
    return encodeGeneric({ durations: items });
  }

  return encodeGeneric(data);
}
