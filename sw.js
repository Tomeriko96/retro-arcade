const CACHE = 'retro-arcade-v15';
// Must all succeed: the launcher, our own games and the licence texts. If one fails the install is retried.
const CORE = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './games/common.js', './games/nozoom.js', './games/console.css',
  './games/breakout.html', './games/shooter.html', './games/blocks.html', './games/rocks.html', './games/play.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './LICENSE', './THIRD_PARTY.md',
  './games/vendor/netris/UPSTREAM-LICENSE', './games/vendor/netris/UPSTREAM-THIRD_PARTY_NOTICES.md', './games/vendor/netris/UPSTREAM-PROVENANCE.md',
  './games/vendor/hextris/CREDITS.md', './games/vendor/hextris/LICENSE.md', './games/vendor/hextris/UPSTREAM-LICENSE',
  './games/vendor/asteroids-infinity/UPSTREAM-LICENSE', './games/vendor/asteroids-infinity/UPSTREAM-THIRD_PARTY_NOTICES.md', './games/vendor/asteroids-infinity/UPSTREAM-PROVENANCE.md',
  './games/vendor/yanoid/UPSTREAM-LICENSE', './games/vendor/yanoid/UPSTREAM-THIRD_PARTY_NOTICES.md', './games/vendor/yanoid/UPSTREAM-PROVENANCE.md',
  './games/vendor/html5-space-invaders/CREDITS.md', './games/vendor/html5-space-invaders/LICENSE', './games/vendor/html5-space-invaders/UPSTREAM-LICENSE',
  './games/vendor/html5-snake/CREDITS.md', './games/vendor/html5-snake/LICENSE', './games/vendor/html5-snake/UPSTREAM-LICENSE',
];
// Vendored games: cached best-effort, so one flaky asset cannot stop the whole service worker from installing.
// Anything missed is cached the first time it is fetched (see the fetch handler).
const VENDOR = [
  './games/vendor/asteroids-infinity/index.html',
  './games/vendor/asteroids-infinity/src/app.js',
  './games/vendor/asteroids-infinity/src/asteroids.js',
  './games/vendor/asteroids-infinity/src/combat.js',
  './games/vendor/asteroids-infinity/src/core.js',
  './games/vendor/asteroids-infinity/src/frame-clock.js',
  './games/vendor/asteroids-infinity/src/frame-delta.js',
  './games/vendor/asteroids-infinity/src/input.js',
  './games/vendor/asteroids-infinity/src/menu.js',
  './games/vendor/asteroids-infinity/src/native-files.js',
  './games/vendor/asteroids-infinity/src/particles.js',
  './games/vendor/asteroids-infinity/src/render.js',
  './games/vendor/asteroids-infinity/src/rng-tape.js',
  './games/vendor/asteroids-infinity/src/saucers.js',
  './games/vendor/asteroids-infinity/src/sound.js',
  './games/vendor/asteroids-infinity/src/storage.js',
  './games/vendor/asteroids-infinity/style.css',
  './games/vendor/hextris/favicon.ico',
  './games/vendor/hextris/images/btn_back.svg',
  './games/vendor/hextris/images/btn_facebook.svg',
  './games/vendor/hextris/images/btn_help.svg',
  './games/vendor/hextris/images/btn_pause.svg',
  './games/vendor/hextris/images/btn_restart.svg',
  './games/vendor/hextris/images/btn_resume.svg',
  './games/vendor/hextris/images/btn_share.svg',
  './games/vendor/hextris/images/btn_twitter.svg',
  './games/vendor/hextris/images/facebook-opengraph.png',
  './games/vendor/hextris/images/icon_arrows.svg',
  './games/vendor/hextris/images/icons/apple-touch-120.png',
  './games/vendor/hextris/images/icons/apple-touch-152.png',
  './games/vendor/hextris/images/icons/apple-touch-167.png',
  './games/vendor/hextris/images/icons/apple-touch-180.png',
  './games/vendor/hextris/images/icons/apple-touch-512.png',
  './games/vendor/hextris/images/icons/apple-touch.svg',
  './games/vendor/hextris/images/icons/maskable-192.png',
  './games/vendor/hextris/images/icons/maskable-192.webp',
  './games/vendor/hextris/images/icons/maskable-512.png',
  './games/vendor/hextris/images/icons/maskable-512.webp',
  './games/vendor/hextris/images/icons/maskable.svg',
  './games/vendor/hextris/images/icons/transparent-192.png',
  './games/vendor/hextris/images/icons/transparent-192.webp',
  './games/vendor/hextris/images/icons/transparent-512.png',
  './games/vendor/hextris/images/icons/transparent-512.webp',
  './games/vendor/hextris/images/icons/transparent.svg',
  './games/vendor/hextris/images/twitter-opengraph.png',
  './games/vendor/hextris/index.html',
  './games/vendor/hextris/js/Block.js',
  './games/vendor/hextris/js/Hex.js',
  './games/vendor/hextris/js/Text.js',
  './games/vendor/hextris/js/checking.js',
  './games/vendor/hextris/js/comboTimer.js',
  './games/vendor/hextris/js/initialization.js',
  './games/vendor/hextris/js/input.js',
  './games/vendor/hextris/js/main.js',
  './games/vendor/hextris/js/math.js',
  './games/vendor/hextris/js/render.js',
  './games/vendor/hextris/js/save-state.js',
  './games/vendor/hextris/js/update.js',
  './games/vendor/hextris/js/view.js',
  './games/vendor/hextris/js/wavegen.js',
  './games/vendor/hextris/style/fa/css/font-awesome.min.css',
  './games/vendor/hextris/style/fa/fonts/fontawesome-webfont.eot',
  './games/vendor/hextris/style/fa/fonts/fontawesome-webfont.svg',
  './games/vendor/hextris/style/fa/fonts/fontawesome-webfont.ttf',
  './games/vendor/hextris/style/fa/fonts/fontawesome-webfont.woff',
  './games/vendor/hextris/style/fonts/Exo2-ExtraLight.otf',
  './games/vendor/hextris/style/fonts/Exo2-Regular.otf',
  './games/vendor/hextris/style/fonts/Exo2-SemiBold.otf',
  './games/vendor/hextris/style/style.css',
  './games/vendor/hextris/vendor/jquery.js',
  './games/vendor/hextris/vendor/js.cookie.js',
  './games/vendor/hextris/vendor/jsonfn.min.js',
  './games/vendor/hextris/vendor/keypress.min.js',
  './games/vendor/html5-snake/game.js',
  './games/vendor/html5-snake/index.html',
  './games/vendor/html5-snake/page.css',
  './games/vendor/html5-snake/size.js',
  './games/vendor/html5-space-invaders/bootstrap.js',
  './games/vendor/html5-space-invaders/game.js',
  './games/vendor/html5-space-invaders/index.html',
  './games/vendor/html5-space-invaders/scale.js',
  './games/vendor/html5-space-invaders/space_invaders_spritesheet.png',
  './games/vendor/html5-space-invaders/styles.css',
  './games/vendor/netris/favicon.svg',
  './games/vendor/netris/index.html',
  './games/vendor/netris/src/engine.js',
  './games/vendor/netris/src/robot.js',
  './games/vendor/netris/src/ui.js',
  './games/vendor/netris/style.css',
  './games/vendor/yanoid/assets/balls/red.png',
  './games/vendor/yanoid/assets/bricks/blue2_75.png',
  './games/vendor/yanoid/assets/bricks/blue_75.png',
  './games/vendor/yanoid/assets/bricks/gray_75.png',
  './games/vendor/yanoid/assets/bricks/gray_stay_75.png',
  './games/vendor/yanoid/assets/bricks/gray_weird_48.png',
  './games/vendor/yanoid/assets/bricks/green2_75.png',
  './games/vendor/yanoid/assets/bricks/green_75.png',
  './games/vendor/yanoid/assets/bricks/red2_75.png',
  './games/vendor/yanoid/assets/bricks/red_75.png',
  './games/vendor/yanoid/assets/bricks/yellow_stay_75.png',
  './games/vendor/yanoid/assets/fonts/yanoid-web-5x7.png',
  './games/vendor/yanoid/assets/paddles/square2_100.png',
  './games/vendor/yanoid/assets/paddles/square2_50.png',
  './games/vendor/yanoid/assets/paddles/square2_75.png',
  './games/vendor/yanoid/assets/powerups/blue_1UP.png',
  './games/vendor/yanoid/assets/powerups/green_s.png',
  './games/vendor/yanoid/assets/powerups/lightblue_-100.png',
  './games/vendor/yanoid/assets/powerups/lightblue_-1000.png',
  './games/vendor/yanoid/assets/powerups/lightblue_-500.png',
  './games/vendor/yanoid/assets/powerups/lightblue_100.png',
  './games/vendor/yanoid/assets/powerups/lightblue_1000.png',
  './games/vendor/yanoid/assets/powerups/lightblue_500.png',
  './games/vendor/yanoid/assets/powerups/powerup_larger.png',
  './games/vendor/yanoid/assets/powerups/powerup_normal.png',
  './games/vendor/yanoid/assets/powerups/powerup_smaller.png',
  './games/vendor/yanoid/assets/powerups/purple_ss.png',
  './games/vendor/yanoid/assets/powerups/red_b.png',
  './games/vendor/yanoid/assets/powerups/yellow_steallife.png',
  './games/vendor/yanoid/assets/shots/greenball.png',
  './games/vendor/yanoid/assets/shots/penetrating.png',
  './games/vendor/yanoid/assets/yanoid.png',
  './games/vendor/yanoid/index.html',
  './games/vendor/yanoid/src/app.js',
  './games/vendor/yanoid/src/audio.js',
  './games/vendor/yanoid/src/bitmap-font.js',
  './games/vendor/yanoid/src/core.js',
  './games/vendor/yanoid/src/game.js',
  './games/vendor/yanoid/src/maps.js',
  './games/vendor/yanoid/src/storage.js',
  './games/vendor/yanoid/style.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(CORE);
    await Promise.allSettled(VENDOR.map((u) => c.add(u)));
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      // No clients.claim(): claiming open pages blocks the back/forward cache. New versions take over on the next navigation.
  );
});

// Cache first, network as fallback (and store the response for next time).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit || fetch(e.request).then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
    )
  );
});
