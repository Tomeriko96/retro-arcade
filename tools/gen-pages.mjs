#!/usr/bin/env node
// Generates one static page per vendored game (games/netris.html, ...) from games/play.html, so each has its own
// <title>, description, canonical URL and social card in the HTML itself (crawlers and link previews do not run JS).
//   node tools/gen-pages.mjs          write the pages
//   node tools/gen-pages.mjs --check  exit 1 if a page is missing or out of date
// After changing play.html or the table below, run it, then `node tools/sw-cache.mjs --write`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://tomeriko96.github.io/retro-arcade/';
const GAMES = {
  netris: ['Netris', 'Falling blocks. Port of Netris 0.52.'],
  hextris: ['Hextris', 'Match blocks around a spinning hexagon.'],
  asteroids: ['Asteroids Infinity', 'Fly, shoot and survive the asteroid field.'],
  yanoid: ['Yanoid', 'Arkanoid-style brick breaker with power-ups.'],
  invaders: ['Space Invaders', 'Defend Earth from the descending invaders.'],
  snake: ['Snake', 'Eat, grow, do not hit yourself.'],
};
const template = readFileSync(join(root, 'games/play.html'), 'utf8');
const GENERIC_DESC = 'Classic mini-games. Installable, offline, no account.';
const must = (s, needle) => { if (!s.includes(needle)) { console.error(`play.html no longer contains: ${needle}`); process.exit(2); } };
for (const n of ['<title>Retro Arcade</title>', `<meta name="description" content="${GENERIC_DESC}">`, '<meta property="og:title" content="Retro Arcade">',
  `<meta property="og:description" content="${GENERIC_DESC}">`, '<meta name="twitter:title" content="Retro Arcade">', `<meta name="twitter:description" content="${GENERIC_DESC}">`,
  '<script src="nozoom.js"></script>']) must(template, n);

const check = process.argv.includes('--check');
let stale = 0;
for (const [id, [title, blurb]] of Object.entries(GAMES)) {
  const full = `${title} – Retro Arcade`, desc = `${blurb} Free, offline, no account.`, url = `${BASE}games/${id}.html`;
  const page = template
    .replace('<title>Retro Arcade</title>', `<title>${full}</title>`)
    .replace(`<meta name="description" content="${GENERIC_DESC}">`, `<meta name="description" content="${desc}">\n<link rel="canonical" href="${url}">`)
    .replace('<meta property="og:title" content="Retro Arcade">', `<meta property="og:title" content="${full}">\n<meta property="og:url" content="${url}">`)
    .replace(`<meta property="og:description" content="${GENERIC_DESC}">`, `<meta property="og:description" content="${desc}">`)
    .replace('<meta name="twitter:title" content="Retro Arcade">', `<meta name="twitter:title" content="${full}">`)
    .replace(`<meta name="twitter:description" content="${GENERIC_DESC}">`, `<meta name="twitter:description" content="${desc}">`)
    .replace('<script src="nozoom.js"></script>', `<script>window.ARCADE_GAME = '${id}';</script>\n<script src="nozoom.js"></script>`);
  const path = join(root, `games/${id}.html`);
  if (check) { if (!existsSync(path) || readFileSync(path, 'utf8') !== page) { console.error(`out of date: games/${id}.html`); stale++; } }
  else writeFileSync(path, page);
}
if (check) { if (stale) { console.error('Run: node tools/gen-pages.mjs'); process.exit(1); } console.log('OK: game pages up to date'); }
else console.log(`wrote ${Object.keys(GAMES).length} pages`);
