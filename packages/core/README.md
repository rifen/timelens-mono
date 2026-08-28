# TimeLens Core (`@rifen/timelens-core`)

Shared detection, formatting, file scanning, and AI-native **GCF (Graph Compact Format)** serialization for TimeLens (VS Code, Neovim, CLI, Agent Skills).

## Installation

```bash
npm install @rifen/timelens-core
```

## Features

- **Duration Detection**: Infers units from context suffixes (`_MS`, `_NS`, `_S`), semantic keywords (`timeout`, `retry`, `ttl`, `delay`), or heuristics.
- **Arithmetic Evaluation**: Evaluates expressions like `60 * 60 * 24` or `1000 * 30`.
- **Codebase Scanning**: Scans source files and configurations for duration constants.
- **GCF Serialization**: Native support for **[GCF](https://gcformat.com)** (Graph Compact Format), reducing agent context tokens by 50–90% compared to JSON.
- **CLI & Agent Skill**: Includes a standalone CLI and skill scripts for Pi / Antigravity / Claude Code agent loops.

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

### 2. Code Scanning & GCF Serialization

```typescript
import { scanCode, toGCF } from '@rifen/timelens-core';

const code = `
const TIMEOUT_SECONDS = 900;
const RETRY_DELAY_MS = 5000;
`;

const scan = scanCode(code, 'server.ts');

// Serialize to compact GCF for AI agent loops
const gcfText = toGCF(scan);
console.log(gcfText);
```

### 3. CLI Usage

```bash
# Scan files with GCF output (default)
npx @rifen/timelens-core scan src/ --format=gcf

# Scan with human-readable text
npx @rifen/timelens-core scan src/ --format=text

# Parse single expressions
npx @rifen/timelens-core parse "60 * 60 * 24"
```

