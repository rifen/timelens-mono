# TimeLens — TODO

Ideas and planned improvements for TimeLens.

---

## 🔢 Expression Evaluation (High Priority)

### Problem

Right now, TimeLens only converts **bare integer literals** on hover.

```python
# ✅ Works today
TIMEOUT_SECONDS = 900          # hover → "15 minutes"

# ❌ Doesn't work
MAX_COMMIT_SECONDS = 60 * 40 * 24   # hover → nothing
CACHE_TTL = 60 * 60 * 24             # hover → nothing
```

This is a **real pain point** in practice. Developers frequently write time values as
arithmetic expressions for readability:

```go
http.Client{
    Timeout: 30 * time.Second,           // evaluates to 30s
}
requestTimeout: 5 * 60 * 1000,           // evaluates to 5 minutes (ms)
maxAge: 24 * 60 * 60,                    // evaluates to 1 day
```

### Why it matters

- **Common pattern**: `60 * 60 * 24` for days, `60 * 60` for hours, `60 * 1000` for ms
- **Intent clarity**: Even when the *value* is ambiguous, the *expression* often reveals intent
- **Existing codebase compatibility**: Many repos already use arithmetic for durations

### Implementation approach

#### 1. Expression parsing

When hovering, look at the token under the cursor and expand outward to capture
a full arithmetic expression:

```
60 * 40 * 24
^^^^^^^^^^^
```

Supported tokens:
- Integer literals (`60`, `40`, `24`)
- Operators (`*`, `/`, `+`, `-`)
- Parentheses for grouping

#### 2. Safe evaluation

Parse and evaluate without `eval()`. Use a simple recursive descent parser
or Shunting-yard algorithm to handle precedence.

Example AST:
```
    *
   / \
  60   *
     / \
    40  24
```

Evaluate bottom-up → result: `57,600`

#### 3. Unit inference

**This is the hard part.** `57,600` alone is ambiguous.

Use a **confidence scoring system** combining:

| Signal | Source | Confidence |
|--------|--------|------------|
| Variable name contains `_SECONDS`, `_MS`, `_US`, `_NS` | Context | High |
| Expression uses "time multipliers" (`60`, `3600`, `86400`) | Heuristic | Medium |
| Result magnitude matches typical time ranges | Heuristic | Low |
| File type/config context (YAML, nginx, Docker) | Context | Medium |
| User's `defaultUnit` setting | Config | Low (fallback) |

#### 4. Display

If confidence is high enough, show:

```
`60 * 40 * 24` → 16 hours (57600 seconds)
Confidence: 0.87 (inferred from variable name `MAX_COMMIT_SECONDS`)
```

If confidence is low, still show the raw result but with a warning:

```
`60 * 40 * 24` = 57,600
⚠ Unit ambiguous — set `timelens.defaultUnit` to interpret
```

### Edge cases to handle

- **Nested expressions**: `(60 * 60) * (24 * 7)` → evaluate left-to-right
- **Division**: `86400 / 2` → `12 hours`
- **Mixed units**: `60 * 1000` → need to guess (likely ms from `1000`)
- **Non-time expressions**: `columns * rows * depth` → should NOT evaluate
- **Floating point**: `2.5 * 3600` → currently out of scope (integers only)
- **Negative numbers**: `-3600` → edge case, probably skip

### Open questions

1. Should we support **function calls** like `time.Second * 60`? Probably not initially.
2. How to handle **overflow**? `999999999 * 999999999` exceeds safe integer range.
3. Should we cache expression results to avoid re-parsing on every hover?
4. Should this be opt-in via a config flag (`timelens.evaluateExpressions`)?

### Related TODOs

- [ ] Neovim plugin (same feature set as VS Code)
- [ ] Shared core library (`@timelens/core`) for detection/formatting logic
- [ ] Configuration UI in VS Code settings page
- [ ] Telemetry: track which features are used most (privacy-preserving)
- [ ] Language-specific parsers (Go, Rust, Python have different syntax for durations)

---

## 🚀 Other Ideas

- [ ] Support for **date math** (e.g., `now() - 86400` → "1 day ago")
- [ ] **Bracket highlighting** — underline durations in the editor gutter
- [ ] **Status bar integration** — show duration of hovered value
- [ ] **Code actions** — `Convert to human-readable` quick fix
- [ ] **Linter rule** — warn on suspicious time values (e.g., `timeout: 999999999`)
- [ ] **Workspace trust** — respect VS Code's trust settings for untrusted repos
