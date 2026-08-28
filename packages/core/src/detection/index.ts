import {
  TimeLensSettings,
  DetectedDuration,
  DEFAULT_SETTINGS
} from '../types';
import { evaluateExpression } from '../formatting';

const UNIT_THRESHOLDS = {
  nanoseconds: 1e15,
  microseconds: 1e12,
  milliseconds: 1e9,
  seconds: 0
};

export function detectDuration(
  token: string,
  lineContext: string,
  settings: Partial<TimeLensSettings> = {}
): DetectedDuration | null {
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  // Allow expressions with spaces - validate after removing whitespace
  const sanitized = token.trim().replace(/\s+/g, '');
  if (!/^[\d+\-*/().]+$/.test(sanitized)) return null;

  const value = evaluateExpression(sanitized);
  if (value === null) return null;

  // Always try context clues first — they can override min/max, defaults, and ignore patterns
  if (mergedSettings.contextClues) {
    const contextResult = inferFromContext(token, lineContext, mergedSettings);
    if (contextResult) {
      return {
        ...contextResult,
        value
      };
    }
  }

  // Check value range
  if (value < mergedSettings.minValue || value > mergedSettings.maxValue) return null;

  // Ignore patterns
  for (const pattern of mergedSettings.ignorePatterns) {
    if (new RegExp(pattern).test(token)) return null;
  }

  // Heuristic by digit count
  let unit: DetectedDuration['unit'];
  let confidence = 0.5;

  if (mergedSettings.defaultUnit === 'auto') {
    if (value >= UNIT_THRESHOLDS.nanoseconds) {
      unit = 'nanoseconds';
      confidence = 0.9;
    } else if (value >= UNIT_THRESHOLDS.microseconds) {
      unit = 'microseconds';
      confidence = 0.9;
    } else if (value >= UNIT_THRESHOLDS.milliseconds) {
      unit = 'milliseconds';
      confidence = 0.9;
    } else {
      unit = 'seconds';
      confidence = 0.7;
    }
  } else {
    unit = mergedSettings.defaultUnit;
    confidence = 0.6;
  }

  return { value, unit, confidence, source: 'heuristic' };
}

function inferFromContext(
  token: string,
  line: string,
  settings: TimeLensSettings
): DetectedDuration | null {
  // Tokenize the line, preserving the expression structure
  const tokens = line.split(/[\s=*+/\-()]+/).filter(Boolean);

  // For expressions like "60 * 40 * 24", find any token from the expression
  const expressionParts = token.split(/[\s*+/\-()]+/).filter(Boolean);
  const tokenIndex = tokens.findIndex(t => expressionParts.includes(t));

  if (tokenIndex === -1) return null;

  const contextStart = Math.max(0, tokenIndex - 2);
  const contextEnd = Math.min(tokens.length, tokenIndex + 3);
  const contextTokens = tokens.slice(contextStart, contextEnd);

  for (const t of contextTokens) {
    const lower = t.toLowerCase();

    // Direct unit suffixes: _NS, _US, _MS, _SEC, _S, or full words
    if (/\bns\b/i.test(lower) || /(?:^|_)ns$/i.test(lower) || /nano(?:s|seconds)?$/i.test(lower)) {
      return { value: 0, unit: 'nanoseconds', confidence: 0.95, source: 'context', contextHint: `unit suffix: "${t}"` };
    }
    if (/\bus\b/i.test(lower) || /(?:^|_)us$/i.test(lower) || /micro(?:s|seconds)?$/i.test(lower)) {
      return { value: 0, unit: 'microseconds', confidence: 0.95, source: 'context', contextHint: `unit suffix: "${t}"` };
    }
    if (/\bms\b/i.test(lower) || /(?:^|_)ms$/i.test(lower) || /milli(?:s|seconds)?$/i.test(lower)) {
      return { value: 0, unit: 'milliseconds', confidence: 0.95, source: 'context', contextHint: `unit suffix: "${t}"` };
    }
    if (/\bsec(?:s)?\b/i.test(lower) || /(?:^|_)sec(?:s)?$/i.test(lower) || /second(?:s)?$/i.test(lower)) {
      return { value: 0, unit: 'seconds', confidence: 0.95, source: 'context', contextHint: `unit suffix: "${t}"` };
    }
    if (/\bs\b/i.test(lower) || /(?:^|_)s$/i.test(lower) || /second(?:s)?$/i.test(lower)) {
      return { value: 0, unit: 'seconds', confidence: 0.95, source: 'context', contextHint: `unit suffix: "${t}"` };
    }
  }

  // Semantic keywords (only if no explicit unit suffix matched)
  let bestUnit: DetectedDuration['unit'] | null = null;
  let bestConfidence = 0;
  let bestHint = '';

  for (const t of contextTokens) {
    const lower = t.toLowerCase();
    const unitFromKeyword = inferUnitFromKeyword(lower);
    if (unitFromKeyword) {
      let confidence = keywordConfidence(lower);
      // Boost confidence for explicit unit words
      if (/(milli|micro|nano|second)s?/.test(lower)) {
        confidence = 0.95;
      }
      if (confidence > bestConfidence) {
        bestUnit = unitFromKeyword;
        bestConfidence = confidence;
        bestHint = confidence >= 0.85 ? `keyword: "${t}"` : `keyword: "${t}" (weak)`;
      }
    }
  }

  if (bestUnit) {
    return {
      value: 0,
      unit: bestUnit,
      confidence: bestConfidence,
      source: 'context',
      contextHint: bestHint
    };
  }

  return null;
}

function inferUnitFromKeyword(word: string): DetectedDuration['unit'] | null {
  if (/\bms\b/.test(word) || /millisecond/.test(word) || /milliseconds/.test(word)) return 'milliseconds';
  if (/\bus\b/i.test(word) || /microsecond/.test(word) || /microseconds/.test(word)) return 'microseconds';
  if (/\bns\b/i.test(word) || /nanosecond/.test(word) || /nanoseconds/.test(word)) return 'nanoseconds';

  if (
    word.includes('retry') ||
    word.includes('backoff') ||
    word.includes('delay') ||
    word.includes('wait') ||
    word.includes('sleep') ||
    word.includes('pause') ||
    word.includes('hold') ||
    word.includes('throttle') ||
    word.includes('rate')
  ) {
    return 'milliseconds';
  }

  if (
    word.includes('timeout') ||
    word.includes('ttl') ||
    word.includes('interval') ||
    word.includes('duration') ||
    word.includes('expiry') ||
    word.includes('expire') ||
    word.includes('retention') ||
    word.includes('age') ||
    word.includes('period') ||
    word.includes('cache') ||
    word.includes('session')
  ) {
    return 'seconds';
  }

  return null;
}

function keywordConfidence(word: string): number {
  const highConfidence = ['retry', 'backoff', 'timeout', 'ttl', 'interval', 'delay', 'sleep'];
  const mediumConfidence = ['duration', 'expiry', 'expire', 'retention', 'throttle', 'wait', 'pause', 'hold', 'cache', 'session', 'age', 'period', 'rate'];

  for (const kw of highConfidence) {
    if (word.includes(kw)) return 0.85;
  }
  for (const kw of mediumConfidence) {
    if (word.includes(kw)) return 0.75;
  }
  return 0.65;
}
