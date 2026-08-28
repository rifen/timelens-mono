---
name: timelens
description: Analyzes source code, ASTs, and configuration files to detect, parse, and audit time duration constants (timeouts, intervals, TTLs, retry delays, cache expiries, sleep intervals) with token-efficient GCF (Graph Compact Format) output.
---

# TimeLens Agent Skill

TimeLens automatically detects, normalizes, and audits raw time numbers (e.g., `900`, `60 * 60 * 24`, `30000`, `5000ms`) across source code and configuration files.

When operating in agentic loops (Pi, Antigravity, Claude Code, etc.), TimeLens emits output in **GCF (Graph Compact Format)**, reducing context token usage by 50–90% compared to standard JSON.

---

## When to Use This Skill

Activate this skill when:
- Auditing timeouts, intervals, rate limits, retry backoffs, or cache TTL configurations across a codebase.
- Investigating timeout mismatch issues (e.g., frontend timeout < backend timeout, connection pool TTLs).
- Refactoring hardcoded duration magic numbers into named constants or config parameters.
- Evaluating duration arithmetic expressions (e.g., `60 * 60 * 24` -> `1d / 86,400s`).

---

## Commands & Tools

### 1. Scan a File or Directory for Durations (GCF Output)

Use the built-in scanner script to find all duration constants in a file or project:

```bash
# Scan repository or directory (default GCF tabular output)
node packages/core/dist/cli.js scan <path> --format=gcf

# Scan as a GCF code graph with symbol definitions and edges
node packages/core/dist/cli.js scan <path> --format=gcf --profile=graph

# Scan with human-readable text output
node packages/core/dist/cli.js scan <path> --format=text
```

### 2. Parse & Convert a Single Duration Expression

Evaluate arithmetic or ambiguous duration numbers:

```bash
node packages/core/dist/cli.js parse "60 * 60 * 24"
node packages/core/dist/cli.js parse "30000" --unit=milliseconds
```

### 3. Programmatic Usage in Scripts / Subagents

```typescript
import { scanCode, toGCF, detectDuration, formatDurationFull } from '@rifen/timelens-core';

// Scan source code
const scan = scanCode(sourceCode, 'server.ts');

// Serialize to GCF (50-90% fewer tokens than JSON)
const gcfOutput = toGCF(scan);
console.log(gcfOutput);
```

---

## GCF Output Format Reference

TimeLens emits standard GCF tabular format for agent context:

```
GCF profile=generic
## durations [4]{file,line,col,name,token,value,unit,formatted,confidence,hint}
server.ts|2|25|TIMEOUT_SECONDS|"900"|900|seconds|15m|0.95|"unit suffix: \"TIMEOUT_SECONDS\""
server.ts|3|24|RETRY_DELAY_MS|"5000"|5000|milliseconds|5s|0.95|"unit suffix: \"RETRY_DELAY_MS\""
server.ts|4|21|SESSION_TTL|"3600"|3600|seconds|1h|0.85|"keyword: \"SESSION_TTL\""
server.ts|5|22|CACHE_EXPIRY|60 * 60 * 24|86400|seconds|1d|0.75|"keyword: \"CACHE_EXPIRY\""
```

LLMs comprehend GCF columns without requiring custom prompt instructions or schemas.
