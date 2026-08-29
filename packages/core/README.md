# TimeScope Core (`@rifen/timelens-core`)

**Shared detection, formatting, and AI-native GCF serialization for TimeScope.**

The core library powers both the VS Code extension and Neovim plugin. It provides:
- Duration detection from context (variable names, comments, file type)
- Expression evaluation (`60 * 60 * 24` → `86400`)
- Human-readable formatting (compact, verbose, or both)
- Codebase scanning with GCF (Graph Compact Format) serialization

## Installation

```bash
npm install @rifen/timelens-core
```

## Monorepo

This package is part of the [TimeScope Monorepo](https://github.com/rifen/timelens-mono):

```bash
git clone https://github.com/rifen/timelens-mono.git
cd timescope/packages/core
pnpm install
pnpm build
```

## Usage

### 1. Basic Detection & Formatting

```typescript
import { detectDuration, formatDurationFull } from '@rifen/timelens-core';

const result = detectDuration('900', 'TIMEOUT_SECONDS = 900');
if (result) {
  console.log(formatDurationFull(result.value, result.unit, {
    format: 'compact',
    showBreakdown: true,
    showUnitLabel: true
  }));
  // Output: "15m"
}
```

### 2. Expression Evaluation

```typescript
import { evaluateExpression } from '@rifen/timelens-core';

const value = evaluateExpression('60 * 60 * 24');
console.log(value); // 86400
```

### 3. Code Scanning & GCF Serialization

```typescript
import { scanCode, toGCF } from '@rifen/timelens-core';

const code = `
const TIMEOUT_SECONDS = 900;
const RETRY_DELAY_MS = 5000;
`;

const scan = scanCode(code, 'server.ts');
const gcfText = toGCF(scan);
```

### 4. CLI Usage

```bash
# Scan files with GCF output (default)
npx @rifen/timelens-core scan src/ --format=gcf

# Scan with human-readable text
npx @rifen/timelens-core scan src/ --format=text

# Parse single expressions
npx @rifen/timelens-core parse "60 * 60 * 24"
```

## Integration

- **[VS Code Extension](https://github.com/rifen/timelens-mono#readme)** — Hover provider
- **[Neovim Plugin](https://github.com/rifen/timelens-nvim)** — Bridge-based hover
- **[Agent Skills](https://github.com/rifen/timelens-mono/skills)** — Pi/Antigravity/Claude Code

## API Reference

| Export | Description |
|--------|-------------|
| `detectDuration(token, line)` | Detect duration from token + context line |
| `formatDurationFull(value, unit, opts)` | Format to string with options |
| `evaluateExpression(expr)` | Safe arithmetic evaluator |
| `scanCode(code, filename)` | Scan source for durations |
| `toGCF(scanResult)` | Serialize to GCF format |

