# Retro Arcade

Small classic games as an installable, offline-capable PWA. One shared shell (manifest, service worker, launcher) with separate games next to it. No frameworks, no build step, no backend.

**Play:** https://tomeriko96.github.io/retro-arcade/

## Games

| Game | Controls |
| --- | --- |
| Breakout | Left/Right move the paddle, A launches |
| Blocks | Left/Right move, Down soft-drops, A or Up rotates, B hard-drops |
| Space Rocks | Left/Right turn, Up thrusts, hold A to fire, B warps (risky) |
| Side Shooter | D-pad moves the ship, hold A to fire |

The controls adapt to the device. On a touch phone every game runs inside a yellow brick-game handheld (layout after [react-tetris](https://chvin.github.io/react-tetris/)): four round buttons in a diamond, a big A and a smaller B, and small Pause / Menu / Reset buttons. On a computer the game fills the window and you play with the keyboard; a header with the key list shows briefly when you move the mouse. A button in that header switches views (also `?ui=handheld` or `?ui=desktop`), and the choice is remembered. The keys: arrows or WASD, Z or Space = A, X = B, Enter or P = Pause/Start, R = Reset, Esc = back to the menu.

Third-party games (from [Libre Arcade](https://github.com/linkingtechnologies/libre-arcade)), vendored unchanged except for removed analytics. See `THIRD_PARTY.md` for authors and licenses.

| Game | Controls |
| --- | --- |
| Netris | Left/Right move, A/Up rotates, Down soft-drops, B hard-drops |
| Hextris | Left/Right rotate the hexagon, Down speeds up, A starts, B pauses |
| Asteroids Infinity | D-pad flies, A fires, B shield |
| Yanoid | Left/Right move, A fires, Start begins, B pauses |
| Space Invaders | Left/Right move, A fires, Start begins |
| Snake | D-pad steers, A starts |

Breakout, Blocks, Space Rocks and Side Shooter are written from scratch (vanilla JS + Canvas). High scores of those four are stored per game in `localStorage`.

## Adding a game

1. Add `games/<name>.html` (copy an existing game; `Arcade.mount()` from `games/common.js` builds the console, `Arcade.held` and `Arcade.on()` give you the buttons). To embed an existing web game instead, put it in `games/vendor/<name>/` (keeping its license), add it to `GAMES` in `games/play.html` with a key mapping, and list it in `THIRD_PARTY.md`. If you change any vendored file, add a line under "What we changed" there.
2. Add a card to the grid in `index.html` (plain HTML, so the launcher works without JS). Add `data-id` and a reader in the `HI` map if the game keeps a high score.
3. Add the files to `CORE` (own games) or `VENDOR` (third-party, cached best-effort) in `sw.js`, then run `node tools/sw-cache.mjs --write`. It checks that every listed file exists and sets `CACHE` to a hash of their contents, so existing installs receive the update. CI (`.github/workflows/check-sw.yml`) fails if you forget.

## Running locally

```bash
python3 -m http.server 8000
```

Service workers work on `localhost`, so installing and offline testing work this way too. After editing any precached file, run `node tools/sw-cache.mjs --write` before committing.

## License

GPL-3.0-or-later, see `LICENSE`. Vendored games keep their own licenses, listed in `THIRD_PARTY.md`.

## Notes

- `404.html` uses root-relative `/retro-arcade/...` paths because GitHub Pages serves it at the missing URL's depth. If the repo or Pages path is renamed, update them.
- `.nojekyll` keeps GitHub Pages from running Jekyll over the site.
- The launcher deliberately does not load `games/nozoom.js`, so pinch-zoom works there; game pages load it to keep the play surface from zooming.
