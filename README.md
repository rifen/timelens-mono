# TimeScope

**Hover any integer duration → see human-readable time instantly.**

TimeScope is a cross-editor tool that eliminates mental math by hovering over numeric durations and revealing their human-readable meaning.

<p align="center">
  <img src="timescope-icon.jpg" alt="TimeScope icon" width="120" />
</p>

<p align="center">
  <img src="timescope.jpeg" alt="TimeScope demo" />
</p>

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| **[VS Code Extension](./packages/vscode/)** | Hover provider for VS Code | ✅ v0.1.1 (`rifen.timescope`) |
| **[Neovim Plugin](./packages/nvim/)** | Bridge-based hover for Neovim | ✅ v0.1.0 |
| **[Core Library](./packages/core/)** | Shared detection/formatting logic | ✅ v0.1.1 |

## Quick Start

```bash
# Clone and install
git clone https://github.com/rifen/timescope.git
cd timescope
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Features

- **Smart detection** — Infers units from context (variable names, comments, file type)
- **Expression parsing** — `60 * 60 * 24` → `1 day`
- **Multiple formats** — Compact (`15m`), verbose (`15 minutes`), or both
- **Context hints** — Shows inference source (e.g., `keyword: "timeout"`)
- **Cross-editor** — VS Code and Neovim support

## Usage Examples

```python
# Python
TIMEOUT_SECONDS = 900      # → "15m"
RETRY_DELAY_MS = 5000      # → "5s"
CACHE_TTL = 60 * 60 * 24   # → "1d"
```

```yaml
# YAML
timeout: 300          # → "5m"
interval: 3600000     # → "1h"
ttl: 86400            # → "1d"
```

```go
# Go
http.Client{Timeout: 15 * time.Second}  # → "15s"
```

## Configuration

### VS Code

```json
{
  "timescope.enabled": true,
  "timescope.format": "compact",
  "timescope.defaultUnit": "seconds",
  "timescope.contextClues": true
}
```

### Neovim (lazy.nvim)

```lua
return {
  'rifen/timelens-nvim',
  version = '^0.1.0',
  event = 'VeryLazy',
  opts = {
    format = 'compact',
    context_clues = true,
  },
}
```

## Development

```bash
# Build all packages
pnpm build

# Run tests (73 total)
pnpm test

# Package VS Code extension
pnpm --filter timelens-vscode run package
```

## Publishing

### VS Code Marketplace

```bash
# Create PAT with Publish scope
export VSCE_PAT=<your-token>

# Login
vsce login rifen

# Publish
cd packages/vscode
vsce publish -p $VSCE_PAT
```

### npm (Core)

```bash
cd packages/core
npm publish --access public
```

## Links

- **GitHub**: https://github.com/rifen/timescope
- **VS Code Marketplace**: (coming soon)
- **npm**: [@rifen/timelens-core](https://www.npmjs.com/package/@rifen/timelens-core)

## License

MIT