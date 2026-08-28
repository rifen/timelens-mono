# TimeLens — Neovim Plugin

**Hover any integer duration → see human-readable time instantly.**

TimeLens eliminates the mental math of converting raw numbers (seconds, milliseconds, nanoseconds) into readable durations. Perfect for HTTP timeouts, retry intervals, TTLs, cache configs, cron schedules, and any numeric time value in your code.

## Requirements

- **Node.js 18+** (for `@timelens/core` bridge)
- **Neovim 0.5+**

## Installation

### lazy.nvim

```lua
{
  'rifen/timelens-nvim',
  event = 'VeryLazy',
  config = function()
    require('timelens').setup({
      format = 'compact',  -- 'compact' | 'verbose' | 'both'
      context_clues = true,
      keywords = { 'timeout', 'interval', 'delay', 'duration', 'ttl' }
    })
  end
}
```

### packer.nvim

```lua
use 'rifen/timelens-nvim'
```

## How it works

1. On `CursorMoved`, the plugin extracts the token under the cursor
2. Spawns a Node.js bridge process (`bin/bridge.js`)
3. Bridge imports `@timelens/core`, runs detection + formatting
4. Returns formatted duration as JSON
5. Plugin renders virtual text with the result

## Configuration

```lua
require('timelens').setup({
  format = 'compact',           -- 'compact' | 'verbose' | 'both'
  default_unit = 'seconds',     -- 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds' | 'auto'
  min_value = 1,
  max_value = 31557600000,
  context_clues = true,
  ignore_patterns = {
    '^0x[0-9a-f]+$',
    '^%d+%.%d+%.%d+%.%d+$',  -- IPv4
    '^%d%d%d%d%-%d%d%-%d%d$',  -- ISO dates
    '^%d%d+$'  -- Unix timestamps
  },
  keywords = {
    'timeout', 'interval', 'delay', 'duration', 'ttl',
    'expiry', 'expire', 'retention', 'age', 'period',
    'rate', 'throttle', 'backoff', 'retry', 'wait',
    'sleep', 'pause', 'hold', 'cache', 'session'
  }
})
```

## Usage

1. Open any file containing numeric timestamps
2. Move cursor over a number — virtual text appears with converted time

**Works in:** source code, config files (YAML/TOML/JSON), Dockerfiles, k8s manifests, `.env`, docs.
