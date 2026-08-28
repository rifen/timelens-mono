# TimeLens test file - updated after fixes

# Variable names with context clues
TIMEOUT_SECONDS = 900        # → 15 minutes (context: "seconds")
MAX_COMMIT_SECONDS = 60 * 40 * 24  # → expression, not supported yet
CACHE_TTL = 3600             # → 1 hour (context: "ttl")
RETRY_DELAY = 30000          # → 30s (context: "retry" + "delay" = ms)
NANOS = 5000000000           # → 5s (context: "nanos" = nanoseconds)
MICROS = 5000000             # → 5s (context: "micros" = microseconds)

# Direct unit abbreviations
DURATION_MS = 5000           # → 5s
DURATION_US = 5000000        # → 5s
DURATION_NS = 5000000000     # → 5s

# Bare literals (no context)
BARE_SECONDS = 900           # → 15 minutes
BARE_MILLIS = 900000         # → 15 minutes

# Should be ignored
PORT = 8080                  # → nothing (filtered)
COLOR = 0xFF0000             # → nothing (hex ignore pattern)
IP_ADDRESS = "192.168.1.1"   # → nothing (IP ignore pattern)
