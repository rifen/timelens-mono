const fs = require("node:fs");
const path = require("node:path");

const coreDist = path.resolve(__dirname, "../../core/dist");
const targetDir = path.resolve(__dirname, "../dist/@rifen/timescope-core");
const nodeModulesDir = path.resolve(
  __dirname,
  "../dist/node_modules/@rifen/timescope-core",
);
const rootNodeModulesDir = path.resolve(
  __dirname,
  "../node_modules/@rifen/timescope-core",
);

console.log("Bundling core into VSIX...");

// Ensure target directories exist
// Clean any previous bundled core copies
fs.rmSync(targetDir, { recursive: true, force: true });
fs.rmSync(nodeModulesDir, { recursive: true, force: true });
fs.rmSync(rootNodeModulesDir, { recursive: true, force: true });
// Recreate empty directories
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(nodeModulesDir, { recursive: true });
fs.mkdirSync(rootNodeModulesDir, { recursive: true });

// Copy all files from core/dist to targetDir
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    // Skip the GCF folder – it is no longer part of the public runtime API
    if (entry.isDirectory() && entry.name === "gcf") {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(coreDist, targetDir);
copyRecursive(coreDist, nodeModulesDir);
copyRecursive(coreDist, rootNodeModulesDir);

// Create a minimal package.json for the bundled core
const corePkg = require(path.resolve(__dirname, "../../core/package.json"));
const bundledPkg = {
  name: corePkg.name,
  version: corePkg.version,
  description: corePkg.description,
  main: "./index.js",
  types: "./index.d.ts",
  dependencies: {},
};
fs.writeFileSync(
  path.join(targetDir, "package.json"),
  JSON.stringify(bundledPkg, null, 2),
);
fs.writeFileSync(
  path.join(nodeModulesDir, "package.json"),
  JSON.stringify(bundledPkg, null, 2),
);
fs.writeFileSync(
  path.join(rootNodeModulesDir, "package.json"),
  JSON.stringify(bundledPkg, null, 2),
);

console.log("Core bundled successfully at", targetDir);
console.log("Core also available at", nodeModulesDir);
console.log("Core also available at", rootNodeModulesDir);
