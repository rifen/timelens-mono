# TimeScope

**Hover any integer duration → see human-readable time instantly.**

TimeScope is a cross-editor tool that eliminates mental math by hovering over numeric durations and revealing their human-readable meaning.

<p align="center">
  <img src="timescope.jpeg" alt="TimeScope demo" width="600" />
</p>

## Install

### VS Code

Install [`rifen.timescope`](https://marketplace.visualstudio.com/items?itemName=rifen.timescope) from the VS Code Marketplace, or install the `.vsix` from [Releases](https://github.com/rifen/timescope/releases).

### Neovim (lazy.nvim)

```lua
return {
  'rifen/timescope.nvim',
  version = '*',
  opts = {
    format = 'compact',
  },
}
```

## Quick Start

```lua
-- Neovim (init.lua)
require('timescope').setup({})
```

```json
// VS Code (settings.json)
{
  "timescope.enabled": true,
  "timescope.format": "compact"
}
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

### Neovim

```lua
require('timescope').setup({
  format = 'compact',
  context_clues = true,
})
```

## Links

- **GitHub**: <https://github.com/rifen/timescope>
- **VS Code Marketplace**: <https://marketplace.visualstudio.com/items?itemName=rifen.timescope>

## License

MIT
