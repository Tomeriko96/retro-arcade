# Third-party games

The games in `games/vendor/` are not written by this project. They come from the
[Libre Arcade](https://github.com/linkingtechnologies/libre-arcade) collection
(commit `a5bddc0655f151b518d173d27cf93a20ef3203bf`, GPL-3.0), which restores or ports old
open-source games to the browser. Each game keeps its own license text and notices inside its
folder (`LICENSE`, `CREDITS.md`, `LICENSE.md`, `UPSTREAM-*`).

| Folder | Game | Original authors | License of the code we ship |
| --- | --- | --- | --- |
| `games/vendor/netris` | Netris 0.52 (web port) | Mark H. Weaver (engine); Libre Arcade authors (web UI) | GPL-2.0-or-later (engine), GPL-3.0-or-later (UI) |
| `games/vendor/hextris` | Hextris | Logan Engstrom, Garrett Finucane and contributors | GPL-3.0-only |
| `games/vendor/asteroids-infinity` | Asteroids Infinity 1.2 (web port) | Ben Whittaker (original); Libre Arcade authors (port) | GPL-3.0-or-later |
| `games/vendor/yanoid` | Yanoid 0.3.0 (web port) | Jonas Christian Drewsen, Bjarke Sørensen, Mads Bondo Dydensborg (original) | GPL-2.0-or-later (code and sprites), GPL-3.0-or-later (port) |
| `games/vendor/html5-space-invaders` | HTML5 Space Invaders | Jon Toivonen (`toivjon`) | MIT |
| `games/vendor/html5-snake` | HTML5 Snake | Jason D. Straughan | MIT |

## What we changed

- Copied only each game's `public/` folder (the runnable game), plus its license and notice files.
- Removed the GoatCounter analytics `<script>` tag from every `index.html`, so no game phones home.
- Hextris (`js/initialization.js`): the saved game is now written on `pagehide`/`visibilitychange` instead of
  `unload`, which Chromium blocks, so the save never happened.
- Hextris (`index.html`): the placeholder high score in the markup is `0` instead of a made-up `10292`, which
  showed for a moment before the game's script replaced it.
- Netris (`index.html`): the footer link to a missing `SOFTWARE_ARCHAEOLOGY.md` now points to the shipped
  `UPSTREAM-PROVENANCE.md`.
- Nothing else in the game code is modified. They run inside a sandboxed iframe (`games/play.html`), which sends
  key events to them from the on-screen console buttons. `play.html` also injects a small stylesheet per game to
  hide vendor menus that duplicate the console, and repaints Snake's start screen; those are integration code in
  this repository, not edits to the vendored files. The same goes for the accessibility fixes it applies to the
  loaded vendor pages (page language, a main landmark, a hidden heading, alt text on Hextris' icon buttons) and
  for discarding an unreadable Hextris save before the game boots.

**Rule:** every edit to a file under `games/vendor/` must add a line to this list.

## Licensing of this repository

This repository is licensed **GPL-3.0-or-later** (see `LICENSE`). All the vendored licenses above
are compatible with that: MIT code and "GPL-2.0-or-later" code can be combined into a GPL-3.0 work,
and Hextris (GPL-3.0-only) fixes the combined work at version 3, which is what we use.

Games written for this project (`games/breakout.html`, `shooter.html`, `blocks.html`) and the
shell are also GPL-3.0-or-later.

Not included on purpose: other games in Libre Arcade with non-GPL-compatible, custom or
asset-restricted licenses, and the original-material assets of games whose art is under other terms.
