# Retro Arcade

Small classic games as an installable, offline-capable PWA. One shared shell (manifest, service worker, launcher) with separate games next to it. No frameworks, no build step, no backend.

**Play:** https://tomeriko96.github.io/retro-arcade/

## Games

| Game | Controls |
| --- | --- |
| Breakout | drag the paddle, tap to launch |
| Side Shooter | drag the ship, it fires automatically |

All games are written from scratch (vanilla JS + Canvas), so no unclear code or asset licenses come along. High scores are stored per game in `localStorage`.

## Adding a game

1. Add `games/<name>.html` (use `games/common.js` for scaling and high scores).
2. Add the game to `GAMES` in `index.html`.
3. Add the file to `ASSETS` in `sw.js` and bump `CACHE` (e.g. `retro-arcade-v3`), otherwise existing installs will not receive the update.

## Running locally

```bash
python3 -m http.server 8000
```

Service workers work on `localhost`, so installing and offline testing work this way too.

## License

MIT, see `LICENSE`.
