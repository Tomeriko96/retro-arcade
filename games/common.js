// Shared console shell + helpers: Game Boy-style on-screen controls, keyboard mapping, high scores.
// Games read Arcade.held.<button> every frame and/or register edge callbacks with Arcade.on(name, fn).
// Buttons: up down left right a b start select. "select" returns to the menu.
window.Arcade = (() => {
  const NAMES = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
  const KEYS = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left',
    arrowright:'right', d:'right', z:'a', ' ':'a', x:'b', enter:'start', p:'start', escape:'select', backspace:'select' };
  const held = Object.fromEntries(NAMES.map((n) => [n, false]));
  const handlers = Object.fromEntries(NAMES.map((n) => [n, []]));
  const views = {}; // name -> elements to highlight

  function paint(name) { for (const el of views[name] || []) el.classList.toggle('on', held[name]); }
  function press(name) {
    if (held[name]) return;
    held[name] = true; paint(name);
    if (navigator.vibrate) navigator.vibrate(8);
    for (const fn of handlers[name]) fn();
  }
  function release(name) { if (held[name]) { held[name] = false; paint(name); } }

  addEventListener('keydown', (e) => {
    const n = KEYS[e.key.toLowerCase()];
    if (!n) return;
    e.preventDefault();
    if (!e.repeat) press(n);
  });
  addEventListener('keyup', (e) => { const n = KEYS[e.key.toLowerCase()]; if (n) release(n); });
  addEventListener('blur', () => NAMES.forEach(release));
  document.addEventListener('visibilitychange', () => { if (document.hidden) NAMES.forEach(release); });
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  function bindButton(el, name) {
    (views[name] = views[name] || []).push(el);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); press(name); });
    for (const t of ['pointerup', 'pointercancel']) el.addEventListener(t, () => release(name));
  }

  // The D-pad is one touch surface, so you can slide between directions and hold diagonals.
  function bindDpad(el) {
    const arms = { up: el.querySelector('.u'), down: el.querySelector('.d'), left: el.querySelector('.l'), right: el.querySelector('.r') };
    for (const [n, a] of Object.entries(arms)) (views[n] = views[n] || []).push(a);
    const apply = (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const dead = 0.25;
      const want = { left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead };
      for (const n of Object.keys(want)) want[n] ? press(n) : release(n);
    };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); apply(e); });
    el.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') apply(e); });
    for (const t of ['pointerup', 'pointercancel']) el.addEventListener(t, () => ['up', 'down', 'left', 'right'].forEach(release));
  }

  function mount({ title, W, H }) {
    document.title = title;
    document.documentElement.style.setProperty('--ar', W + ' / ' + H);
    const root = document.createElement('div');
    root.className = 'gb';
    root.innerHTML = `
      <div class="top"><a href="../">&larr; menu</a><span></span></div>
      <div class="screen"><canvas></canvas></div>
      <div class="pad">
        <div class="dpad"><i class="u"></i><i class="l"></i><i class="r"></i><i class="d"></i><i class="c"></i></div>
        <div class="mid"><button data-k="select">SELECT</button><button data-k="start">START</button></div>
        <div class="ab"><button data-k="b">B</button><button data-k="a">A</button></div>
      </div>
      <p class="hint">Arrows / WASD &middot; Z or Space = A &middot; X = B &middot; Enter = Start &middot; Esc = Menu</p>`;
    document.body.appendChild(root);
    root.querySelector('.top span').textContent = title;
    bindDpad(root.querySelector('.dpad'));
    root.querySelectorAll('button[data-k]').forEach((b) => bindButton(b, b.dataset.k));
    handlers.select.push(() => { location.href = '../'; });
    const cv = root.querySelector('canvas');
    cv.width = W; cv.height = H;
    return { cv, ctx: cv.getContext('2d') };
  }

  return {
    held, mount,
    on(name, fn) { handlers[name].push(fn); },
    hi(id) { try { return Number(localStorage.getItem('arcade:hi:' + id)) || 0; } catch (e) { return 0; } },
    saveHi(id, score) { try { if (score > this.hi(id)) localStorage.setItem('arcade:hi:' + id, String(score)); } catch (e) {} },
  };
})();
