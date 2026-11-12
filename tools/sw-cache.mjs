#!/usr/bin/env node
// Keeps the service worker's cache name in step with its assets.
//   node tools/sw-cache.mjs          check: every listed file exists and CACHE matches the content hash (exit 1 if not)
//   node tools/sw-cache.mjs --write  rewrite CACHE in sw.js to the current hash
// The hash covers sw.js (minus its CACHE line) and the content of every file listed in CORE and VENDOR, so any edit to
// a precached file changes the cache name and clients fetch fresh copies. No dependencies.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const swPath = join(root, 'sw.js');
const sw = readFileSync(swPath, 'utf8');

const listed = [];
for (const name of ['CORE', 'VENDOR']) {
  const m = sw.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  if (!m) { console.error(`sw.js: could not find ${name} list`); process.exit(2); }
  listed.push(...[...m[1].matchAll(/'(\.\/[^']*)'/g)].map((x) => x[1]));
}
const files = [...new Set(listed)].sort();

const missing = files.filter((f) => f !== './' && !existsSync(join(root, f)));
if (missing.length) { console.error('Listed in sw.js but missing on disk:\n  ' + missing.join('\n  ')); process.exit(1); }

const h = createHash('sha256');
h.update(sw.replace(/^const CACHE = .*$/m, ''));
for (const f of files) if (f !== './') { h.update(f); h.update(readFileSync(join(root, f))); }
const want = 'retro-arcade-' + h.digest('hex').slice(0, 10);
const have = (sw.match(/^const CACHE = '([^']*)'/m) || [])[1];

if (process.argv.includes('--write')) {
  writeFileSync(swPath, sw.replace(/^const CACHE = .*$/m, `const CACHE = '${want}';`));
  console.log(`CACHE = ${want} (${files.length} files)`);
} else if (have !== want) {
  console.error(`sw.js CACHE is '${have}' but the assets hash to '${want}'. Run: node tools/sw-cache.mjs --write`);
  process.exit(1);
} else {
  console.log(`OK: ${want}, ${files.length} files present`);
}
