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
- Nothing else in the game code is modified. They run unchanged inside an iframe (`games/play.html`),
  which sends key events to them from the on-screen console buttons.

## Licensing of this repository

This repository is licensed **GPL-3.0-or-later** (see `LICENSE`). All the vendored licenses above
are compatible with that: MIT code and "GPL-2.0-or-later" code can be combined into a GPL-3.0 work,
and Hextris (GPL-3.0-only) fixes the combined work at version 3, which is what we use.

Games written for this project (`games/breakout.html`, `shooter.html`, `blocks.html`) and the
shell are also GPL-3.0-or-later.

Not included on purpose: other games in Libre Arcade with non-GPL-compatible, custom or
asset-restricted licenses, and the original-material assets of games whose art is under other terms.
