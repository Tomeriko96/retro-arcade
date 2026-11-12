// Shared console shell + helpers: Game Boy-style on-screen controls, keyboard mapping, high scores.
// Games read Arcade.held.<button> every frame and/or register edge callbacks with Arcade.on(name, fn).
// Buttons: up down left right a b start select reset. "select" returns to the menu, "reset" reloads the game.
window.Arcade = (() => {
  const NAMES = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select', 'reset'];
  const KEYS = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left',
    arrowright:'right', d:'right', z:'a', ' ':'a', x:'b', enter:'start', p:'start', escape:'select', r:'reset' };
  const held = Object.fromEntries(NAMES.map((n) => [n, false]));
  const handlers = Object.fromEntries(NAMES.map((n) => [n, []]));
  const views = {}; // name -> elements to highlight
  const watchers = []; // fn(name, isDown) for every button change (used by play.html to drive embedded games)

  function paint(name) { for (const el of views[name] || []) el.classList.toggle('on', held[name]); }
  function press(name) {
    if (held[name]) return;
    held[name] = true; paint(name);
    for (const w of watchers) w(name, true);
    // Haptic tick only on touch devices, and not for people who asked for reduced motion.
    if (navigator.vibrate && matchMedia('(pointer: coarse)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(8);
    for (const fn of handlers[name]) fn();
  }
  function release(name) { if (held[name]) { held[name] = false; paint(name); for (const w of watchers) w(name, false); } }

  addEventListener('keydown', (e) => {
    const n = KEYS[e.key.toLowerCase()];
    if (!n || e.ctrlKey || e.metaKey || e.altKey) return;
    // Enter/Space on a focused link/button must keep their native activation.
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('a,button,input,select,textarea,[role=button]')) return;
    e.preventDefault();
    if (!e.repeat) press(n);
  });
  addEventListener('keyup', (e) => { const n = KEYS[e.key.toLowerCase()]; if (n) release(n); });
  addEventListener('blur', () => NAMES.forEach(release));
  document.addEventListener('visibilitychange', () => { if (document.hidden) NAMES.forEach(release); });
  // Long-press menus get in the way of the on-screen buttons and the game; everywhere else (credits, legend) they stay.
  document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('.screen, .btn, .ui-toggle')) e.preventDefault(); });

  function bindButton(el, name) {
    (views[name] = views[name] || []).push(el);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); press(name); });
    for (const t of ['pointerup', 'pointercancel']) el.addEventListener(t, () => release(name));
    // Keyboard activation (Enter/Space on a focused button) arrives as a click with detail 0.
    el.addEventListener('click', (e) => { if (e.detail === 0) { press(name); setTimeout(() => release(name), 80); } });
  }

  // Touch phones get the handheld with on-screen buttons; computers get a big screen and the keyboard.
  // ?ui=handheld|desktop or the toggle in the top bar overrides the automatic choice (remembered per device).
  function uiMode() {
    const q = new URLSearchParams(location.search).get('ui');
    if (q === 'handheld' || q === 'desktop') return q;
    try { const s = localStorage.getItem('arcade:ui'); if (s === 'handheld' || s === 'desktop') return s; } catch (e) {}
    const touch = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
    return touch ? 'handheld' : 'desktop';
  }
  const KEYHINT = { up: '&uarr; / W', down: '&darr; / S', left: '&larr; / A', right: '&rarr; / D', a: 'Z / Space', b: 'X' };

  // labels: per-button caption; null hides a button the game does not use.
  const LABELS = { up:'Up', down:'Down', left:'Left', right:'Right', a:'A', b:'B', start:'Pause' }; // start = the small green button
  function mount({ title, W, H, labels = {} }) {
    document.title = title + ' \u2013 Retro Arcade';
    document.documentElement.style.setProperty('--ar', W + ' / ' + H);
    const L = { ...LABELS, ...labels };
    const btn = (cls, k, small) => `<div class="btn ${cls}${L[k] === null ? ' off' : ''}"><button data-k="${k}" aria-label="${L[k] || k}"></button>${small ? '' : `<span class="cap">${L[k] || ''}</span>`}</div>`;
    const rows = ['up', 'left', 'right', 'down', 'a', 'b'].filter((k) => L[k] !== null).map((k) => [KEYHINT[k], L[k]])
      .concat([['Enter / P', L.start], ['R', 'Reset'], ['Esc', 'Menu']]);
    const legend = rows.map(([k, v]) => `<div class="row"><kbd>${k}</kbd>${v}</div>`).join('');
    const root = document.createElement('main');
    root.className = 'gb';
    root.innerHTML = `
      <h1 class="sr-only">${title} \u2013 Retro Arcade</h1>
      <div id="arcade-live" class="sr-only" role="status" aria-live="polite"></div>
      <div class="toast" aria-hidden="true"></div>
      <div class="top"><a href="../" aria-label="Back to game menu" aria-keyshortcuts="Escape">&larr; menu</a><span aria-hidden="true"></span><button class="ui-toggle" type="button"></button></div>
      <div class="screen"><canvas role="img" aria-label="${title} game screen"></canvas></div>
      <div class="left">
        <div class="small">
          <div class="btn green"><button data-k="start" aria-label="${L.start}"></button><span class="cap">${L.start}(P)</span></div>
          <div class="btn green"><button data-k="select" aria-label="Menu"></button><span class="cap">Menu(Esc)</span></div>
          <div class="btn red"><button data-k="reset" aria-label="Reset"></button><span class="cap">Reset(R)</span></div>
        </div>
        <div class="big">${btn('a', 'a')}${btn('b', 'b')}</div>
      </div>
      <div class="right"><div class="diamond">
        ${btn('u', 'up')}${btn('l', 'left')}${btn('r', 'right')}${btn('d', 'down')}
        <div class="mark" aria-hidden="true"><i class="mu">&#9650;</i><i class="ml">&#9664;</i><i class="mr">&#9654;</i><i class="md">&#9660;</i></div>
      </div></div>
      <div class="legend"><b>Controls</b><div class="rows">${legend}</div></div>
      <p class="hint">Arrows / WASD &middot; Z or Space = A &middot; X = B &middot; Enter / P = ${L.start} &middot; R = Reset &middot; Esc = Menu</p>`;
    document.body.appendChild(root);
    root.querySelector('.top span').textContent = title;
    const toggle = root.querySelector('.ui-toggle');
    const setMode = (m, save) => {
      document.documentElement.dataset.ui = m;
      toggle.textContent = m === 'desktop' ? 'On-screen buttons' : 'Keyboard view';
      if (save) { try { localStorage.setItem('arcade:ui', m); } catch (e) {} }
    };
    setMode(uiMode(), false);
    // Desktop view: show the header + key list briefly on load and whenever the mouse moves.
    let idle = 0;
    const wake = () => { root.classList.add('show'); clearTimeout(idle); idle = setTimeout(() => root.classList.remove('show'), 2500); };
    addEventListener('mousemove', wake);
    wake();
    toggle.addEventListener('click', () => setMode(document.documentElement.dataset.ui === 'desktop' ? 'handheld' : 'desktop', true));
    root.querySelectorAll('button[data-k]').forEach((b) => bindButton(b, b.dataset.k));
    handlers.select.push(() => { location.href = '../'; });
    // Reset throws away the run, and it sits right next to Pause under a thumb: ask for a second press.
    let resetArmed = 0;
    const toast = root.querySelector('.toast');
    handlers.reset.push(() => {
      if (Date.now() < resetArmed) { location.reload(); return; }
      resetArmed = Date.now() + 1800;
      toast.textContent = 'Press Reset (R) again to restart';
      toast.classList.add('show');
      Arcade.announce(toast.textContent);
      setTimeout(() => toast.classList.remove('show'), 1800);
    });
    const bars = () => {
      root.style.setProperty('--bar-top', root.querySelector('.top').offsetHeight + 'px');
      root.style.setProperty('--bar-bottom', root.querySelector('.legend').offsetHeight + 'px');
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(bars); ro.observe(root.querySelector('.top')); ro.observe(root.querySelector('.legend')); }
    bars();
    const cv = root.querySelector('canvas');
    const ctx = cv.getContext('2d');
    // Games draw in W x H logical units. Keep the backing store at the size actually shown (x devicePixelRatio) so
    // rectangles and text are rendered at native resolution instead of a small bitmap stretched to fit. The transform
    // maps logical units to pixels; games set their own styles every frame, so resetting the context on resize is safe.
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const k = r.width ? Math.max(1, Math.min(r.width * (devicePixelRatio || 1) / W, Math.sqrt(8e6 / (W * H)))) : 1; // cap at ~8 megapixels
      const pw = Math.round(W * k), ph = Math.round(H * k);
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
      ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(cv); else addEventListener('resize', fit);
    return { cv, ctx, wake };
  }

  // Offline support must not depend on entering through the launcher (deep links, installed-app launches).
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js', { updateViaCache: 'none' }).catch(() => {});
    // Once the worker is active and the page idle, ask it to cache the vendored games too.
    navigator.serviceWorker.ready.then((reg) => (window.requestIdleCallback || ((f) => setTimeout(f, 2000)))(() => reg.active && reg.active.postMessage('warm'))).catch(() => {});
  }

  return {
    held, mount,
    // LCD palette shared by every game: dark pixels on a green-grey screen.
    ink: '#1b2210', mid: '#5e6b47', lcd: '#9ead86',
    label: '#333c28', // HUD text: 4.8:1 on the LCD green (mid is only 2.4:1, fine for decoration, not for text)
    on(name, fn) { handlers[name].push(fn); },
    watch(fn) { watchers.push(fn); },
    hi(id) { try { return Number(localStorage.getItem('arcade:hi:' + id)) || 0; } catch (e) { return 0; } },
    saveHi(id, score) {
      const best = score > this.hi(id);
      try { if (best) localStorage.setItem('arcade:hi:' + id, String(score)); } catch (e) {}
      this.announce('Final score ' + score + (best ? '. New high score!' : '.'));
    },
    // Screen-reader announcement (polite live region). Canvas games otherwise say nothing about their state.
    announce(msg) {
      const el = document.getElementById('arcade-live');
      if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 50); }
    },
  };
})();
