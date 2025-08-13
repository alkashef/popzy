// Minimal test runner for pure modules (no transpile, node only)
// Usage: node tests/unit/runner.js

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

function log(ok, name, error) {
  if (ok) {
    console.log(`ok - ${name}`);
  } else {
    console.error(`not ok - ${name}: ${error?.message || error}`);
  }
}

async function run(testModule) {
  for (const [name, fn] of Object.entries(testModule)) {
    if (typeof fn === 'function') {
      try {
        const result = fn.length > 0 ? fn(assert) : fn();
        if (result && typeof result.then === 'function') {
          await result;
        }
        log(true, name);
        passed++;
      } catch (e) {
        log(false, name, e);
        failed++;
      }
    }
  }
}

async function load(file) {
  const mod = require(path.resolve(file));
  await run(mod);
}

(async () => {
  // Discover *.test.js in tests/unit
  const unitDir = path.resolve(__dirname);
  const files = fs.readdirSync(unitDir).filter((f) => f.endsWith('.test.js'));
  for (const f of files) {
    await load(path.join(unitDir, f));
  }
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
