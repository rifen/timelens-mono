# TimeLens — VSCode Extension

**Hover any integer duration → see human-readable time instantly.**

TimeLens eliminates the mental math of converting raw numbers (seconds, milliseconds, nanoseconds) into readable durations. 
Perfect for HTTP timeouts, retry intervals, TTLs, cache configs, cron schedules, and any numeric time value in your code.

Just hover—no clicks, no commands, no context switching.

---

## ✨ Features

| Input (unit) | Example | Hover Reveals |
|--------------|---------|---------------|
| **Seconds** | `900` | `15 minutes` |
| **Seconds** | `3600` | `1 hour` |
| **Seconds** | `86400` | `1 day` |
| **Seconds** | `604800` | `1 week` |
| **Seconds** | `31536000` | `1 year` |
| **Milliseconds** | `5000` | `5 seconds` |
| **Milliseconds** | `900000` | `15 minutes` |
| **Milliseconds** | `3600000` | `1 hour` |
| **Microseconds** | `5000000` | `5 seconds` |
| **Nanoseconds** | `5000000000` | `5 seconds` |

- **Smart unit detection** — Heuristics + context clues (variable names, comments, file type) infer seconds/ms/µs/ns
- **Best-fit output** — Automatically picks the largest whole unit (e.g., `90000` → `25 hours`, not `54000 minutes`)
- **Precise breakdown** — Also shows `1h 30m 45s` style for non-round numbers
- **Copy on click** — Click the hover to copy the formatted duration
- **Multi-cursor friendly** — Works with multiple selections
- **Works everywhere** — Source code, config files (JSON/YAML/TOML), Dockerfiles, k8s manifests, `.env`, docs

---

## 🎯 Real-World Examples

```yaml
# docker-compose.yml
timeout: 300          # → "5 minutes"
healthcheck_interval: 30000   # → "30 seconds"

# nginx.conf
proxy_read_timeout 600;       # → "10 minutes"
keepalive_timeout 75;         # → "1 minute 15 seconds"

# Kubernetes
terminationGracePeriodSeconds: 30   # → "30 seconds"
ttlSecondsAfterFinished: 86400      # → "1 day"

# Application code (Go, JS, Python, Java, Rust, etc.)
http.Client{Timeout: 15 * time.Second}    # → "15 seconds"
setTimeout(fn, 300000)                     # → "5 minutes"
retry_after = 3600                         # → "1 hour"
CACHE_TTL = 86400                          # → "1 day"

# Cron / schedulers
"schedule": "*/300 * * * *"   # 300 → "5 minutes"
interval: 3600000             # → "1 hour"
```

---

## 🚀 Install

```bash
# From VSIX (install from /tmp or download)
code --install-extension timelens-vscode-0.1.1.vsix

# Or from VS Code Marketplace (after publication)
# Extension ID: timelens.timelens
```

---

## ⚙️ Configuration

```json
// settings.json
{
  "timelens.enabled": true,
  "timelens.defaultUnit": "seconds",     // "seconds" | "milliseconds" | "microseconds" | "nanoseconds" | "auto"
  "timelens.format": "compact",          // "compact" | "verbose" | "both"
  "timelens.minValue": 1,                // Ignore values below this
  "timelens.maxValue": 31557600000,      // Ignore values above this (~1000 years in ms)
  "timelens.showBreakdown": true,        // Show "1h 30m 45s" for non-round numbers
  "timelens.showUnitLabel": true,        // Show "seconds", "ms" in hover
  "timelens.contextClues": true,         // Use var names, comments, file type to infer unit
  "timelens.ignorePatterns": [           // Regex patterns to skip
    "^0x[0-9a-f]+$",                     // Hex colors, addresses
    "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$",  // IPv4
    "^\\d{4}-\\d{2}-\\d{2}$",            // ISO dates
    "^\\d{10,}$"                         // Unix timestamps (epoch) - different tool
  ],
  "timelens.fileTypes": ["*"],           // Glob patterns to activate on
  "timelens.keywords": [                 // Variable name hints for unit inference
    "timeout", "interval", "delay", "duration", "ttl",
    "expiry", "expire", "retention", "age", "period",
    "rate", "throttle", "backoff", "retry", "wait",
    "sleep", "pause", "hold", "cache", "session"
  ]
}
```

**Format styles:**
- **compact** — `15m`, `1h`, `2d 3h`, `5s`
- **verbose** — `15 minutes`, `1 hour`, `2 days 3 hours`, `5 seconds`
- **both** — `15 minutes (15m)`

---

## 🛠️ Development

```bash
# Prereqs: Node.js 18+, pnpm
pnpm install
pnpm compile        # Compile TypeScript
pnpm watch          # Watch + compile
pnpm test           # Run tests
pnpm package        # Create .vsix
```

**Project structure:**
```
src/
├── extension.ts          # Entry point, registers hover provider
├── provider/
│   └── durationHover.ts  # HoverProvider implementation
├── detection/
│   └── detect.ts         # Duration detection + unit inference
├── formatting/
│   └── format.ts         # Human-readable duration formatting
├── config/
│   └── settings.ts       # Configuration schema + defaults
└── test/
    └── *.test.ts         # Unit + integration tests
```

---

## 📦 Publishing

```bash
pnpm package
vsce publish
# or: vsce publish patch/minor/major
```

---

## 🤝 Related

- **[TimeLens Core](https://github.com/rifen/timelens-core)** — Shared detection/formatting logic (`@rifen/timelens-core`)
- **[TimeLens Neovim](https://github.com/rifen/timelens-nvim)** — Same functionality for Neovim
- **[Monorepo](https://github.com/rifen/timelens-mono)** — All packages in one repo

---

## 📄 License

MIT — Free for personal and commercial use.

---

## 💡 Why "TimeLens"?

Like a lens reveals what's invisible to the naked eye, TimeLens reveals the *meaning* hidden inside raw numbers. 
No more mental math: `900` → `15 minutes`, `300000` → `5 minutes`, `86400` → `1 day`. 
Instant clarity for timeouts, intervals, TTLs, and every other duration hiding in your code.
