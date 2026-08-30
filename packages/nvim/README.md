# TimeScope — Neovim Plugin

**Hover any integer duration → see human-readable time instantly.**

TimeScope eliminates the mental math of converting raw numbers (seconds, milliseconds, nanoseconds) into readable durations. Perfect for HTTP timeouts, retry intervals, TTLs, cache configs, cron schedules, and any numeric time value in your code.

## Requirements

- **Node.js 18+** (for `@rifen/timescope-core` bridge)
- **Neovim 0.7+**

## Installation

### lazy.nvim

```lua
-- ~/.config/nvim/lua/plugins/timelens.lua
return {
  'rifen/timelens-nvim',
  version = '^0.1.0',
  event = 'VeryLazy',
  keys = {
    { '<leader>tl', desc = 'TimeScope: toggle' },
    { '<leader>tr', desc = 'TimeScope: refresh' },
  },
  opts = {
    format = 'compact',
    context_clues = true,
  },
  config = function(_, opts)
    require('timelens').setup(opts)
  end,
}
```

### packer.nvim

```lua
use {
  'rifen/timelens-nvim',
  config = function()
    require('timelens').setup({
      format = 'compact',
      context_clues = true,
    })
  end,
}
```

## How it works

1. On `CursorMoved`, the plugin extracts the token under the cursor
2. Spawns a Node.js bridge process (`bin/bridge.js`)
3. Bridge imports `@rifen/timescope-core`, runs detection + formatting
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

## Lazy.nvim Integration

The plugin is designed to work seamlessly with lazy.nvim:

- **Event loading**: Plugin loads on `VeryLazy` event
- **Options handling**: Pass config via `opts` key
- **Key bindings**: Define keys in plugin spec
- **Lazy loading**: Bridge process only starts when needed

### Complete lazy.nvim Example

```lua
-- ~/.config/nvim/lua/plugins/timelens.lua
return {
  'rifen/timelens-nvim',
  version = '^0.1.0',
  event = 'VeryLazy',
  keys = {
    { '<leader>tl', desc = 'TimeScope: toggle' },
    { '<leader>tr', desc = 'TimeScope: refresh' },
  },
  opts = {
    format = 'compact',
    context_clues = true,
    keywords = { 'timeout', 'interval', 'delay', 'ttl' },
  },
  config = function(_, opts)
    require('timelens').setup(opts)
  end,
}
```

## Related

- **[TimeScope VS Code](https://github.com/rifen/timelens-mono#readme)** — Hover provider for VS Code
- **[TimeScope Core](https://github.com/rifen/timescope-core)** — Shared detection/formatting library
- **[Monorepo](https://github.com/rifen/timelens-mono)** — All packages in one repo
