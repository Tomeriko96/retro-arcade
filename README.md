# Retro Arcade

Small classic games as an installable, offline-capable PWA. One shared shell (manifest, service worker, launcher) with separate games next to it. No frameworks, no build step, no backend.

**Play:** https://tomeriko96.github.io/retro-arcade/

## Games

| Game | Controls |
| --- | --- |
| Breakout | Left/Right move the paddle, A launches |
| Blocks | Left/Right move, Down soft-drops, A or Up rotates, B hard-drops |
| Side Shooter | D-pad moves the ship, hold A to fire |

Every game runs inside a Game Boy-style console with an on-screen D-pad, A/B and Start/Select (touch), and the same buttons on the keyboard: arrows or WASD, Z or Space = A, X = B, Enter = Start (pause), Esc = back to the menu.

All games are written from scratch (vanilla JS + Canvas), so no unclear code or asset licenses come along. High scores are stored per game in `localStorage`.

## Adding a game

1. Add `games/<name>.html` (copy an existing game; `Arcade.mount()` from `games/common.js` builds the console, `Arcade.held` and `Arcade.on()` give you the buttons).
2. Add the game to `GAMES` in `index.html`.
3. Add the file to `ASSETS` in `sw.js` and bump `CACHE` (e.g. `retro-arcade-v4`), otherwise existing installs will not receive the update.

## Running locally

```bash
python3 -m http.server 8000
```

Service workers work on `localhost`, so installing and offline testing work this way too.

## License

MIT, see `LICENSE`.
