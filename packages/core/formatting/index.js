Object.defineProperty(exports, "__esModule", { value: true });
exports.toMilliseconds = toMilliseconds;
exports.formatDuration = formatDuration;
exports.formatDurationFull = formatDurationFull;
exports.evaluateExpression = evaluateExpression;
const UNITS = [
    { unit: "year", ms: 31557600000, short: "y" },
    { unit: "week", ms: 604800000, short: "w" },
    { unit: "day", ms: 86400000, short: "d" },
    { unit: "hour", ms: 3600000, short: "h" },
    { unit: "minute", ms: 60000, short: "m" },
    { unit: "second", ms: 1000, short: "s" },
    { unit: "millisecond", ms: 1, short: "ms" },
];
function toMilliseconds(value, unit) {
    switch (unit) {
        case "seconds":
            return value * 1000;
        case "milliseconds":
            return value;
        case "microseconds":
            return value / 1000;
        case "nanoseconds":
            return value / 1_000_000;
    }
}
function formatDuration(ms, options) {
    if (ms < 1) {
        return options.format === "verbose"
            ? "less than 1 millisecond"
            : "<1ms";
    }
    const breakdown = computeBreakdown(ms);
    const compact = formatCompact(breakdown);
    const verbose = formatVerbose(breakdown);
    if (options.format === "compact") return compact;
    if (options.format === "verbose") return verbose;
    return `${verbose} (${compact})`;
}
function formatDurationFull(value, unit, options) {
    const ms = toMilliseconds(value, unit);
    return formatDuration(ms, options);
}
function evaluateExpression(expr) {
    // Remove spaces and validate characters
    const sanitized = expr.replace(/\s+/g, "");
    // Only allow digits, operators, parentheses, and decimal points
    if (!/^[\d+\-*/().]+$/.test(sanitized)) {
        return null;
    }
    // Prevent extremely long expressions
    if (sanitized.length > 100) {
        return null;
    }
    try {
        // Safe arithmetic evaluation using a simple recursive descent parser
        // This avoids the security risk of new Function() / eval()
        const tokens = tokenize(sanitized);
        let pos = 0;
        function parseExpression() {
            let value = parseTerm();
            while (
                pos < tokens.length &&
                (tokens[pos] === "+" || tokens[pos] === "-")
            ) {
                const op = tokens[pos++];
                const right = parseTerm();
                value = op === "+" ? value + right : value - right;
            }
            return value;
        }
        function parseTerm() {
            let value = parseFactor();
            while (
                pos < tokens.length &&
                (tokens[pos] === "*" || tokens[pos] === "/")
            ) {
                const op = tokens[pos++];
                const right = parseFactor();
                value = op === "*" ? value * right : value / right;
            }
            return value;
        }
        function parseFactor() {
            if (tokens[pos] === "(") {
                pos++; // consume '('
                const value = parseExpression();
                if (pos >= tokens.length || tokens[pos] !== ")") {
                    return NaN; // mismatched parentheses
                }
                pos++; // consume ')'
                return value;
            }
            // Must be a number
            const num = Number(tokens[pos++]);
            if (isNaN(num)) return NaN;
            return num;
        }
        const result = parseExpression();
        // Ensure all tokens consumed and result is valid
        if (pos !== tokens.length || !isFinite(result)) {
            return null;
        }
        return result;
    } catch {
        return null;
    }
}
function tokenize(expr) {
    const tokens = [];
    let current = "";
    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];
        if (/[\d.]/.test(char)) {
            current += char;
        } else if (/[+\-*/()]/.test(char)) {
            if (current) {
                tokens.push(current);
                current = "";
            }
            tokens.push(char);
        }
    }
    if (current) {
        tokens.push(current);
    }
    return tokens;
}
function computeBreakdown(ms) {
    let remaining = ms;
    const result = [];
    for (const { unit, ms: unitMs, short } of UNITS) {
        if (remaining >= unitMs) {
            const value = Math.floor(remaining / unitMs);
            result.push({ unit, short, value });
            remaining = remaining % unitMs;
        }
    }
    return result;
}
function formatCompact(breakdown) {
    if (breakdown.length === 0) return "<1ms";
    const toShow = breakdown.slice(0, 2);
    return toShow.map(({ short, value }) => `${value}${short}`).join(" ");
}
function formatVerbose(breakdown) {
    if (breakdown.length === 0) return "less than 1 millisecond";
    return breakdown
        .map(({ unit, value }) => {
            const plural = value === 1 ? "" : "s";
            return `${value} ${unit}${plural}`;
        })
        .join(", ");
}
//# sourceMappingURL=index.js.map
