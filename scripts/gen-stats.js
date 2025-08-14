/*
  Generate repository stats and update README between markers:
  <!-- stats:start --> ... <!-- stats:end -->

  Metrics:
  - Total lines of code (non-empty)
  - Actual code lines (non-comment, prod files) and percentage
  - Documentation lines (comment lines, prod files) and percentage
  - Test code lines (non-comment, tests/) and percentage
  - Test coverage (from coverage/coverage-summary.json lines.pct)
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const README = path.join(ROOT, 'README.md');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'coverage', 'test-results', '.nyc_output', '.cache', 'assets']);

const PROD_INCLUDE_EXT = new Set(['.js', '.css', '.html']);
const TEST_INCLUDE_EXT = new Set(['.js']);

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, fileList);
    } else {
      fileList.push(full);
    }
  }
  return fileList;
}

function isTestFile(fp) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  return rel.startsWith('tests/') && TEST_INCLUDE_EXT.has(path.extname(fp));
}

function isProdFile(fp) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  if (rel.startsWith('tests/')) return false;
  if (rel.startsWith('coverage/')) return false;
  const ext = path.extname(fp);
  if (!PROD_INCLUDE_EXT.has(ext)) return false;
  // Include top-level app.js, index.html, style.css, and everything under src/, styles/, partials/
  if (rel === 'app.js' || rel === 'index.html' || rel === 'style.css') return true;
  return rel.startsWith('src/') || rel.startsWith('styles/') || rel.startsWith('partials/');
}

function countFile(fp) {
  const ext = path.extname(fp);
  const content = fs.readFileSync(fp, 'utf8');
  const lines = content.split(/\r?\n/);
  let code = 0, doc = 0, nonEmpty = 0;
  let inBlock = false;
  let inHtmlComment = false;

  for (let raw of lines) {
    const line = raw; // keep original for patterns
    const t = line.trim();
    if (t === '') continue;

    if (ext === '.js' || ext === '.css') {
      // Handle block comments /* ... */ and // (js only)
      if (inBlock) {
        doc++; nonEmpty++;
        if (t.includes('*/')) inBlock = false;
        continue;
      }
      if (ext === '.js' && t.startsWith('//')) { doc++; nonEmpty++; continue; }

      const startIdx = t.indexOf('/*');
      if (startIdx === 0) {
        doc++; nonEmpty++;
        if (!t.includes('*/')) inBlock = true;
        continue;
      }
      if (startIdx > 0) {
        // code followed by comment start -> count as code, then enter block for next lines if not closed
        code++; nonEmpty++;
        if (!t.includes('*/')) inBlock = true;
        continue;
      }
      // For JS, handle inline '//' after code; still count as code
      code++; nonEmpty++;
      continue;
    }

    if (ext === '.html') {
      // HTML comments <!-- ... --> can span multiple lines
      if (inHtmlComment) {
        doc++; nonEmpty++;
        if (t.includes('-->')) inHtmlComment = false;
        continue;
      }
      const openIdx = t.indexOf('<!--');
      if (openIdx === 0) {
        doc++; nonEmpty++;
        if (!t.includes('-->')) inHtmlComment = true;
        continue;
      }
      if (openIdx > 0) {
        // code before comment
        code++; nonEmpty++;
        if (!t.includes('-->')) inHtmlComment = true;
        continue;
      }
      code++; nonEmpty++;
      continue;
    }
  }
  return { code, doc, nonEmpty };
}

function sumCounts(a, b) {
  return { code: a.code + b.code, doc: a.doc + b.doc, nonEmpty: a.nonEmpty + b.nonEmpty };
}

function formatPct(num, den) {
  if (den === 0) return '0.0%';
  return (Math.round((num * 1000) / den) / 10).toFixed(1) + '%';
}

function ensureCoverageSummary() {
  const summaryPath = path.join(ROOT, 'coverage', 'coverage-summary.json');
  if (fs.existsSync(summaryPath)) return summaryPath;
  try {
    execSync('npm run coverage:unit', { stdio: 'ignore', cwd: ROOT, shell: true });
  } catch (_) {
    // ignore failures; we only need the summary if produced
  }
  return fs.existsSync(summaryPath) ? summaryPath : null;
}

function readCoveragePct() {
  const summaryPath = ensureCoverageSummary();
  if (!summaryPath) return null;
  try {
    const json = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    // c8 json-summary has total.lines.pct
    const pct = json.total && json.total.lines && typeof json.total.lines.pct === 'number' ? json.total.lines.pct : null;
    return pct;
  } catch (_) {
    return null;
  }
}

function updateReadme(stats) {
  const markerStart = '<!-- stats:start -->';
  const markerEnd = '<!-- stats:end -->';
  const block = [
    markerStart,
    '',
    '## Project stats',
    '',
    `- Total lines (non-empty): ${stats.total}`,
    `- Actual code lines (prod): ${stats.prodCode} (${stats.prodCodePct})`,
    `- Documentation lines (prod): ${stats.prodDoc} (${stats.prodDocPct})`,
    `- Test code lines: ${stats.testCode} (${stats.testCodePct})`,
    `- Unit test coverage (lines): ${stats.coveragePct != null ? stats.coveragePct.toFixed(1) + '%' : 'N/A'}`,
    '',
    '<sub>Notes: Totals exclude blank lines. Documentation = comment lines in production files (.js/.css/.html). Test lines count non-comment lines under tests/. Coverage is from unit tests (c8).</sub>',
    '',
    markerEnd,
  ].join('\n');

  let readme = fs.readFileSync(README, 'utf8');
  if (readme.includes(markerStart) && readme.includes(markerEnd)) {
    const before = readme.substring(0, readme.indexOf(markerStart));
    const after = readme.substring(readme.indexOf(markerEnd) + markerEnd.length);
    readme = before + block + after;
  } else {
    // Append near end
    readme = readme.trimEnd() + '\n\n' + block + '\n';
  }
  fs.writeFileSync(README, readme, 'utf8');
}

function main() {
  const files = walk(ROOT);
  let prod = { code: 0, doc: 0, nonEmpty: 0 };
  let test = { code: 0, doc: 0, nonEmpty: 0 };
  for (const fp of files) {
    if (isProdFile(fp)) prod = sumCounts(prod, countFile(fp));
    else if (isTestFile(fp)) {
      const c = countFile(fp);
      // For tests we consider 'code' only (non-comment lines)
      test.code += c.code;
      test.nonEmpty += c.nonEmpty; // not used directly, but kept for completeness
    }
  }

  const total = prod.code + prod.doc + test.code;
  const coveragePct = readCoveragePct();

  const stats = {
    total,
    prodCode: prod.code,
    prodDoc: prod.doc,
    testCode: test.code,
    prodCodePct: formatPct(prod.code, total),
    prodDocPct: formatPct(prod.doc, total),
    testCodePct: formatPct(test.code, total),
    coveragePct: coveragePct,
  };

  updateReadme(stats);
  console.log('Stats updated in README.md');
}

main();
