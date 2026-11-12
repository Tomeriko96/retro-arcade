// Hosts a vendored GPL/MIT game in an iframe inside the console and turns console buttons into key events.
const K = {
  left:  { key: 'ArrowLeft',  code: 'ArrowLeft',  kc: 37 },
  up:    { key: 'ArrowUp',    code: 'ArrowUp',    kc: 38 },
  right: { key: 'ArrowRight', code: 'ArrowRight', kc: 39 },
  down:  { key: 'ArrowDown',  code: 'ArrowDown',  kc: 40 },
  enter: { key: 'Enter',      code: 'Enter',      kc: 13 },
  space: { key: ' ',          code: 'Space',      kc: 32 },
  esc:   { key: 'Escape',     code: 'Escape',     kc: 27 },
  ctrl:  { key: 'Control',    code: 'ControlLeft', kc: 17 },
  p:     { key: 'p',          code: 'KeyP',       kc: 80 },
  s:     { key: 's',          code: 'KeyS',       kc: 83 },
  one:   { key: '1',          code: 'Digit1',     kc: 49 },
};
const dirs = { left: K.left, right: K.right, up: K.up, down: K.down };
// Upstream Snake never calls start(), so its first frame collides at an uninitialised position and shows GAME OVER before
// anyone has played. Repaint a proper start screen, and shrink messages to fit (the Impact font is missing on many systems).
// Vendored pages lack a language, a main landmark and a heading, and Hextris has unlabelled icon buttons. Fix them in the
// live iframe document instead of editing the vendored files.
function a11yBase(w, title) {
  const d = w.document;
  if (!d.documentElement.lang) d.documentElement.lang = 'en';
  const st = d.createElement('style');
  st.textContent = '.arcade-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}';
  d.head.appendChild(st);
  const main = d.querySelector('main') || d.querySelector('[role=main]') || d.getElementById('app') || d.body;
  if (main.tagName !== 'MAIN' && !main.getAttribute('role')) main.setAttribute('role', 'main');
  const h = d.querySelector('h1');
  if (!h || w.getComputedStyle(h).display === 'none') {
    const n = d.createElement('h1'); n.className = 'arcade-sr'; n.textContent = title;
    main.insertBefore(n, main.firstChild);
  }
}
function hextrisA11y(w) {
  for (const [sel, alt] of [['#openSideBar', 'Help'], ['#pauseBtn', 'Pause'], ['#restartBtn', 'Restart'], ['#restart', 'Restart']]) {
    const e = w.document.querySelector(sel); if (e && !e.getAttribute('alt')) e.setAttribute('alt', alt);
  }
}
function snakeIntro(w) {
  const gm = w.game, cv = w.canvas, c = w.context;
  if (!gm) return;
  const stop = gm.stop;
  gm.stop = function () { if (gm.score) Arcade.saveHi('snake', gm.score); return stop.apply(this, arguments); };
  gm.drawMessage = function () {
    if (gm.message === null) return;
    let size = cv.height / 10;
    c.font = size + 'px Impact'; c.textAlign = 'center';
    const wide = c.measureText(gm.message).width;
    if (wide > cv.width * 0.9) { size *= cv.width * 0.9 / wide; c.font = size + 'px Impact'; }
    c.fillStyle = '#00F'; c.strokeStyle = '#FFF';
    c.fillText(gm.message, cv.width / 2, cv.height / 2); c.strokeText(gm.message, cv.width / 2, cv.height / 2);
  };
  // Nothing has been started yet, whatever the game believes (it may not have run its first frame yet).
  gm.over = true; gm.message = 'PRESS SPACEBAR TO START'; gm.resetCanvas(); gm.drawMessage();
}
const GAMES = {
  netris:   { title: 'Netris',            lcd: 'invert', src: 'vendor/netris/index.html',             ar: '3 / 5', vw: 480, css: 'footer,.topbar h1{display:none!important}', labels: { up: 'Rotation', a: 'Rotate', b: 'Drop' }, keys: { ...dirs, a: K.up, b: K.p, start: K.s } },
  hextris:  { title: 'Hextris',           lcd: 'none', init: hextrisA11y, src: 'vendor/hextris/index.html',            ar: '3 / 4', vw: 480, labels: { up: null, left: 'Rotate', right: 'Rotate', a: 'Start', b: 'Pause', start: 'Start' }, keys: { ...dirs, a: K.enter, b: K.space, start: K.enter } },
  asteroids:{ title: 'Asteroids Infinity',lcd: 'invert', src: 'vendor/asteroids-infinity/index.html', ar: '4 / 3', vw: 640, css: 'header,footer{display:none!important}', labels: { up: 'Thrust', down: 'Brake', a: 'Fire', b: 'Shield', start: 'Select' }, keys: { ...dirs, a: K.space, b: K.ctrl, start: K.enter } },
  yanoid:   { title: 'Yanoid',            lcd: 'none', bg: '#090b0d', src: 'vendor/yanoid/index.html',             ar: '3 / 4', vw: 520, css: '.logo,#pauseBtn,#helpBtn,#aboutBtn,.touch-controls,.footer-controls{display:none!important}', labels: { up: null, down: null, a: 'Fire', b: 'Pause', start: 'Start' }, keys: { left: K.left, right: K.right, a: K.space, b: K.esc, start: { click: '#startBtn' } } },
  invaders: { title: 'Space Invaders',    lcd: 'invert', src: 'vendor/html5-space-invaders/index.html', ar: '4 / 5', vw: 640, labels: { up: null, down: null, a: 'Fire', b: 'Enter', start: 'Start' }, keys: { left: K.left, right: K.right, a: K.space, b: K.enter, start: K.one } },
  snake:    { title: 'Snake',             lcd: 'light', src: 'vendor/html5-snake/index.html',        ar: '4 / 3', vw: 820, init: snakeIntro, labels: { a: 'Start', b: null, start: 'Start' }, keys: { ...dirs, a: K.enter, b: K.enter, start: K.enter } },
};
// Per game: `css` hides vendor chrome that duplicates the console (same-origin injection keeps the vendored files untouched);
// `init` runs once the game has loaded. Snake's size.js sizes its canvas from the iframe viewport (80%, in 4:3 grid steps),
// so a ~820px wide 4:3 box yields exactly its native 640x480 canvas (800x600 is the minimum; the extra covers the screen border).
// The static per-game pages (netris.html, ...) set window.ARCADE_GAME; play.html?g=<id> still works for older links.
const id = window.ARCADE_GAME || new URLSearchParams(location.search).get('g');
const g = GAMES[id];
if (!g) { location.replace('../'); }
else {
  if (!window.ARCADE_GAME) { // play.html?g=... duplicates the static page of the same game: point search engines at that one
    const link = document.createElement('link'); link.rel = 'canonical';
    link.href = new URL(({ netris: 'netris', hextris: 'hextris', asteroids: 'asteroids', yanoid: 'yanoid', invaders: 'invaders', snake: 'snake' })[id] + '.html', location.href).href;
    document.head.appendChild(link);
  }
  const [w, h] = g.ar.split('/').map(Number);
  const { cv, wake } = Arcade.mount({ title: g.title, W: w * 100, H: h * 100, labels: g.labels });
  const frame = document.createElement('iframe');
  // Sandbox: blocks popups, forms, modals, downloads and top-level navigation from vendored code. It deliberately keeps
  // allow-same-origin (Chrome logs a warning for that combination): the console reaches into the frame to inject CSS,
  // forward keys, hand focus back and repaint Snake's start screen, and the games need their own localStorage. With both
  // flags the sandbox is NOT a security boundary against a malicious vendored script; the real defences are that the files
  // are vendored (reviewed, pinned) and the page CSP allows no outside origin. Isolating them would need a separate origin
  // plus a postMessage bridge for all of the above.
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  if (id === 'hextris') { try { const s = localStorage.getItem('saveState'); if (s && s !== '{}') JSON.parse(s); } catch (e) { try { localStorage.removeItem('saveState'); } catch (e2) {} } }
  frame.tabIndex = -1; // not a tab stop: keys are forwarded by the console, and focus inside the frame would swallow Esc/R/P
  frame.src = g.src; frame.title = g.title; frame.className = 'lcd-' + g.lcd; if (g.bg) frame.style.background = g.bg; // dark games: no white flash before they paint
  frame.style.width = g.vw + 'px'; frame.style.height = (g.vw * h / w) + 'px';
  cv.replaceWith(frame);
  frame.style.touchAction = 'manipulation';
  frame.addEventListener('load', () => {
    window.noZoom(frame.contentWindow, false); window.focus();
    try {
      const d = frame.contentDocument;
      if (g.css) { const st = d.createElement('style'); st.textContent = g.css; d.head.appendChild(st); }
      a11yBase(frame.contentWindow, g.title);
      if (g.init) g.init(frame.contentWindow);
    } catch (e) { /* cross-origin: leave the vendor page as is */ } try {
      frame.contentWindow.addEventListener('mousemove', wake);
      // Focus inside the frame (a click, or the game calling canvas.focus() when it starts) would silently kill Esc/R/P and
      // the rest of the console key mapping. Hand focus back to the console on both; the console forwards keys itself.
      // Form fields are left alone so typing would still work.
      const handBack = (e) => {
        if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
        setTimeout(() => { frame.blur(); window.focus(); }, 0);
      };
      frame.contentWindow.addEventListener('pointerup', handBack);
      frame.contentDocument.addEventListener('focusin', handBack);
    } catch (e) {} }); // keep the keyboard on the console so every key mapping works
  const box = frame.parentElement;
  const fit = () => {
    const s = box.clientWidth / g.vw; // game is laid out g.vw wide, then scaled; height follows the screen so no strip is left over
    frame.style.transform = 'scale(' + s + ')';
    frame.style.height = (box.clientHeight / s) + 'px';
  };
  new ResizeObserver(fit).observe(box); fit();

  function send(type, spec) {
    const win = frame.contentWindow;
    if (!win || !win.document || !win.document.body) return;
    const ev = new win.KeyboardEvent(type, { key: spec.key, code: spec.code, keyCode: spec.kc, which: spec.kc, bubbles: true, cancelable: true });
    // Some browsers ignore keyCode/which in the init dict; older games read them.
    Object.defineProperty(ev, 'keyCode', { get: () => spec.kc });
    Object.defineProperty(ev, 'which', { get: () => spec.kc });
    win.document.body.dispatchEvent(ev);
  }
  const live = new Map(); // button -> spec currently held down in the game
  Arcade.watch((name, down) => {
    const spec = g.keys[name];
    if (!spec) return;
    if (spec.click) { // some games start from an on-page button
      const el = frame.contentWindow.document.querySelector(spec.click);
      if (down && el) el.click();
      return;
    }
    if (down) { live.set(name, spec); send('keydown', spec); }
    else if (live.has(name)) { live.delete(name); send('keyup', spec); }
  });
}
