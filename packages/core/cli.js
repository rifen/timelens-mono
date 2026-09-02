#!/usr/bin/env node

var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? (o, m, k, k2) => {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (
                  !desc ||
                  ("get" in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = { enumerable: true, get: () => m[k] };
              }
              Object.defineProperty(o, k2, desc);
          }
        : (o, m, k, k2) => {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? (o, v) => {
              Object.defineProperty(o, "default", {
                  enumerable: true,
                  value: v,
              });
          }
        : (o, v) => {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (() => {
        var ownKeys = (o) => {
            ownKeys =
                Object.getOwnPropertyNames ||
                ((o) => {
                    var ar = [];
                    for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
                    return ar;
                });
            return ownKeys(o);
        };
        return (mod) => {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== "default") __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = runCLI;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("path"));
const detection_1 = require("./detection");
const formatting_1 = require("./formatting");
const SUPPORTED_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".swift",
    ".c",
    ".cpp",
    ".h",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".conf",
    ".env",
    ".lua",
    ".sh",
    ".bash",
    ".zsh",
    ".rb",
    ".php",
]);
const IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "out",
    "target",
    ".next",
    ".cache",
    "vendor",
]);
function printHelp() {
    console.log(`
TimeScope CLI - AI-native code duration detection

Usage:
  timelens scan <file-or-dir> [options]
  timelens parse <expression-or-token> [options]

Commands:
  scan <path>          Scan file(s) for duration tokens (timeouts, intervals, TTLs, etc.)
  parse <expr>         Parse and evaluate a single duration expression or token

Options:
  --format=<format>    Output format: 'json' or 'text' (default: text)
  --unit=<unit>        Default unit: 'seconds', 'milliseconds', 'auto'
  --min=<number>       Minimum value filter
  --max=<number>       Maximum value filter
  --no-context         Disable contextual keyword inferences
  -h, --help           Show this help message

Examples:
  timelens scan src/ --format=json
  timelens scan config.yaml --format=text
  timelens parse "60 * 60 * 24"
  timelens parse "30000" --unit=milliseconds
`);
}
function parseArgs(args) {
    let command = "help";
    let target;
    let format = "text";
    const settings = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "-h" || arg === "--help" || arg === "help") {
            return { command: "help", format, settings };
        }
        if (arg === "scan" || arg === "parse") {
            command = arg;
            if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
                target = args[++i];
            }
            continue;
        }
        if (arg.startsWith("--format=")) {
            const f = arg.split("=")[1];
            if (["json", "text"].includes(f)) format = f;
            continue;
        }
        if (arg === "--json") {
            format = "json";
            continue;
        }
        if (arg === "--text") {
            format = "text";
            continue;
        }
        if (arg.startsWith("--unit=")) {
            const u = arg.split("=")[1];
            settings.defaultUnit = u;
            continue;
        }
        if (arg.startsWith("--min=")) {
            settings.minValue = Number(arg.split("=")[1]);
            continue;
        }
        if (arg.startsWith("--max=")) {
            settings.maxValue = Number(arg.split("=")[1]);
            continue;
        }
        if (arg === "--no-context") {
            settings.contextClues = false;
            continue;
        }
        // Positional target fallback
        if (!target && !arg.startsWith("-")) {
            target = arg;
        }
    }
    return { command, target, format, settings };
}
function collectFiles(dirOrFile) {
    const stat = fs.statSync(dirOrFile);
    if (!stat.isDirectory()) {
        return [dirOrFile];
    }
    const results = [];
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith("."))
                continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (SUPPORTED_EXTENSIONS.has(ext)) {
                    results.push(fullPath);
                }
            }
        }
    }
    walk(dirOrFile);
    return results;
}
function runCLI() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        printHelp();
        return;
    }
    const { command, target, format, settings } = parseArgs(args);
    if (command === "help" || !target) {
        printHelp();
        return;
    }
    if (command === "parse") {
        const detected = (0, detection_1.detectDuration)(
            target,
            target,
            settings,
        );
        if (!detected) {
            console.error(`Could not detect a valid duration in: "${target}"`);
            process.exit(1);
        }
        const formatted = (0, formatting_1.formatDurationFull)(
            detected.value,
            detected.unit,
            {
                format: "verbose",
                showBreakdown: true,
                showUnitLabel: true,
            },
        );
        const compact = (0, formatting_1.formatDurationFull)(
            detected.value,
            detected.unit,
            {
                format: "compact",
                showBreakdown: true,
                showUnitLabel: true,
            },
        );
        if (format === "json") {
            console.log(
                JSON.stringify({ ...detected, formatted, compact }, null, 2),
            );
        } else {
            console.log(`Value:      ${detected.value} ${detected.unit}`);
            console.log(`Formatted:  ${formatted} (${compact})`);
            console.log(
                `Confidence: ${(detected.confidence * 100).toFixed(0)}% (${detected.source})`,
            );
            if (detected.contextHint)
                console.log(`Hint:       ${detected.contextHint}`);
        }
        return;
    }
    if (command === "scan") {
        if (!fs.existsSync(target)) {
            console.error(`Error: Path does not exist: ${target}`);
            process.exit(1);
        }
        const files = collectFiles(target);
        const allResults = [];
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, "utf-8");
                const scan = (0, detection_1.scanCode)(content, file, settings);
                if (scan.items.length > 0) {
                    allResults.push(scan);
                }
            } catch (_) {
                // Skip unreadable files
            }
        }
        if (format === "json") {
            console.log(JSON.stringify(allResults, null, 2));
        } else {
            let totalDetections = 0;
            for (const res of allResults) {
                console.log(
                    `\n📄 ${res.filePath} (${res.items.length} durations):`,
                );
                for (const item of res.items) {
                    const id = item.identifier ? `[${item.identifier}] ` : "";
                    console.log(
                        `  Line ${item.line}:${item.column} -> ${id}"${item.token}" = ${item.formatted} (${item.unit}, ${(item.confidence * 100).toFixed(0)}% conf)`,
                    );
                }
                totalDetections += res.items.length;
            }
            console.log(
                `\nScan completed: ${totalDetections} durations found across ${allResults.length} files.`,
            );
        }
    }
}
if (require.main === module) {
    runCLI();
}
//# sourceMappingURL=cli.js.map
