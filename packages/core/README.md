# TimeLens Core

Shared detection and formatting logic for TimeLens (VS Code, Neovim, CLI, future integrations).

## Installation

```bash
npm install @timelens/core
```

## Usage

```typescript
import { detectDuration, formatDurationFull } from '@timelens/core';

const result = detectDuration('900', 'TIMEOUT_SECONDS = 900');
if (result) {
  console.log(formatDurationFull(result.value, result.unit, {
    format: 'compact',
    showBreakdown: true,
    showUnitLabel: true
  }));
  // Output: "15 minutes"
}
```

## Integration roadmap

- **VS Code**: currently self-contained; core integration via npm or monorepo is planned
- **Neovim**: Node.js bridge (`bin/bridge.js`) imports this package
- **CLI**: future standalone tool consuming this package
- **Web**: future playground/playground integration
