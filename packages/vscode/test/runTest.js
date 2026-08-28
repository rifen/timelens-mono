// @ts-nocheck
const path = require('path');
const { execSync } = require('child_process');

async function runTests() {
  try {
    // Compile test files using the tsconfig
    execSync('npx tsc -p ./tsconfig.test.json', { stdio: 'inherit' });
    
    // Find compiled JS files
    const testFiles = execSync('find dist/test -name "*.js" -type f', { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    if (testFiles.length === 0) {
      console.error('No compiled test files found');
      return;
    }
    
    // Run mocha with compiled files
    const mochaArgs = testFiles.map(f => path.relative(process.cwd(), f)).join(' ');
    execSync(`npx mocha ${mochaArgs} --require source-map-support/register`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Tests failed:', e.message);
    process.exit(1);
  }
}

runTests().catch(console.error);