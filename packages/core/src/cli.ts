#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { scanCode, detectDuration } from './detection';
import { formatDurationFull } from './formatting';
import { toGCF } from './gcf';
import { ScanResult, TimeLensSettings, DEFAULT_SETTINGS } from './types';

const SUPPORTED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.kt', '.swift', '.c', '.cpp', '.h',
  '.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.env',
  '.lua', '.sh', '.bash', '.zsh', '.rb', '.php'
]);

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'target', '.next', '.cache', 'vendor'
]);

function printHelp(): void {
  console.log(`
TimeLens CLI - AI-native code duration detection & GCF compression

Usage:
  timelens scan <file-or-dir> [options]
  timelens parse <expression-or-token> [options]

Commands:
  scan <path>          Scan file(s) for duration tokens (timeouts, intervals, TTLs, etc.)
  parse <expr>         Parse and evaluate a single duration expression or token

Options:
  --format=<format>    Output format: 'gcf' (default), 'json', or 'text'
  --profile=<profile>  GCF profile: 'generic' (default) or 'graph'
  --unit=<unit>        Default unit: 'seconds', 'milliseconds', 'auto'
  --min=<number>       Minimum value filter
  --max=<number>       Maximum value filter
  --no-context         Disable contextual keyword inferences
  -h, --help           Show this help message

Examples:
  timelens scan src/ --format=gcf
  timelens scan config.yaml --format=text
  timelens parse "60 * 60 * 24"
  timelens parse "30000" --unit=milliseconds
`);
}

function parseArgs(args: string[]): {
  command: string;
  target?: string;
  format: 'gcf' | 'json' | 'text';
  profile: 'generic' | 'graph';
  settings: Partial<TimeLensSettings>;
} {
  let command = 'help';
  let target: string | undefined;
  let format: 'gcf' | 'json' | 'text' = 'gcf';
  let profile: 'generic' | 'graph' = 'generic';
  const settings: Partial<TimeLensSettings> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help' || arg === 'help') {
      return { command: 'help', format, profile, settings };
    }

    if (arg === 'scan' || arg === 'parse') {
      command = arg;
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        target = args[++i];
      }
      continue;
    }

    if (arg.startsWith('--format=')) {
      const f = arg.split('=')[1] as 'gcf' | 'json' | 'text';
      if (['gcf', 'json', 'text'].includes(f)) format = f;
      continue;
    }
    if (arg === '--gcf') { format = 'gcf'; continue; }
    if (arg === '--json') { format = 'json'; continue; }
    if (arg === '--text') { format = 'text'; continue; }

    if (arg.startsWith('--profile=')) {
      const p = arg.split('=')[1] as 'generic' | 'graph';
      if (['generic', 'graph'].includes(p)) profile = p;
      continue;
    }

    if (arg.startsWith('--unit=')) {
      const u = arg.split('=')[1] as TimeLensSettings['defaultUnit'];
      settings.defaultUnit = u;
      continue;
    }

    if (arg.startsWith('--min=')) {
      settings.minValue = Number(arg.split('=')[1]);
      continue;
    }

    if (arg.startsWith('--max=')) {
      settings.maxValue = Number(arg.split('=')[1]);
      continue;
    }

    if (arg === '--no-context') {
      settings.contextClues = false;
      continue;
    }

    // Positional target fallback
    if (!target && !arg.startsWith('-')) {
      target = arg;
    }
  }

  return { command, target, format, profile, settings };
}

function collectFiles(dirOrFile: string): string[] {
  const stat = fs.statSync(dirOrFile);
  if (!stat.isDirectory()) {
    return [dirOrFile];
  }

  const results: string[] = [];
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dirOrFile);
  return results;
}

export function runCLI(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printHelp();
    return;
  }

  const { command, target, format, profile, settings } = parseArgs(args);

  if (command === 'help' || !target) {
    printHelp();
    return;
  }

  if (command === 'parse') {
    const detected = detectDuration(target, target, settings);
    if (!detected) {
      console.error(`Could not detect a valid duration in: "${target}"`);
      process.exit(1);
    }

    const formatted = formatDurationFull(detected.value, detected.unit, {
      format: 'verbose',
      showBreakdown: true,
      showUnitLabel: true
    });
    const compact = formatDurationFull(detected.value, detected.unit, {
      format: 'compact',
      showBreakdown: true,
      showUnitLabel: true
    });

    if (format === 'json') {
      console.log(JSON.stringify({ ...detected, formatted, compact }, null, 2));
    } else if (format === 'gcf') {
      console.log(toGCF([{
        token: target,
        line: 1,
        column: 1,
        value: detected.value,
        unit: detected.unit,
        confidence: detected.confidence,
        source: detected.source,
        contextHint: detected.contextHint,
        formatted: compact,
        lineContext: target
      }]));
    } else {
      console.log(`Value:      ${detected.value} ${detected.unit}`);
      console.log(`Formatted:  ${formatted} (${compact})`);
      console.log(`Confidence: ${(detected.confidence * 100).toFixed(0)}% (${detected.source})`);
      if (detected.contextHint) console.log(`Hint:       ${detected.contextHint}`);
    }
    return;
  }

  if (command === 'scan') {
    if (!fs.existsSync(target)) {
      console.error(`Error: Path does not exist: ${target}`);
      process.exit(1);
    }

    const files = collectFiles(target);
    const allResults: ScanResult[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const scan = scanCode(content, file, settings);
        if (scan.items.length > 0) {
          allResults.push(scan);
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    if (format === 'gcf') {
      console.log(toGCF(allResults, { profile, toolName: 'timelens_scan' }));
    } else if (format === 'json') {
      console.log(JSON.stringify(allResults, null, 2));
    } else {
      let totalDetections = 0;
      for (const res of allResults) {
        console.log(`\n📄 ${res.filePath} (${res.items.length} durations):`);
        for (const item of res.items) {
          const id = item.identifier ? `[${item.identifier}] ` : '';
          console.log(`  Line ${item.line}:${item.column} -> ${id}"${item.token}" = ${item.formatted} (${item.unit}, ${(item.confidence * 100).toFixed(0)}% conf)`);
        }
        totalDetections += res.items.length;
      }
      console.log(`\nScan completed: ${totalDetections} durations found across ${allResults.length} files.`);
    }
  }
}

if (require.main === module) {
  runCLI();
}
