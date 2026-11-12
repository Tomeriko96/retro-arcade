// Shared console shell + helpers: Game Boy-style on-screen controls, keyboard mapping, high scores.
// Games read Arcade.held.<button> every frame and/or register edge callbacks with Arcade.on(name, fn).
// Buttons: up down left right a b start select reset. "select" returns to the menu, "reset" reloads the game.
window.Arcade = (() => {
  const NAMES = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select', 'reset'];
  const KEYS = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left',
    arrowright:'right', d:'right', z:'a', ' ':'a', x:'b', enter:'start', p:'start', escape:'select', backspace:'select', r:'reset' };
  const held = Object.fromEntries(NAMES.map((n) => [n, false]));
  const handlers = Object.fromEntries(NAMES.map((n) => [n, []]));
  const views = {}; // name -> elements to highlight
  const watchers = []; // fn(name, isDown) for every button change (used by play.html to drive embedded games)

  function paint(name) { for (const el of views[name] || []) el.classList.toggle('on', held[name]); }
  function press(name) {
    if (held[name]) return;
    held[name] = true; paint(name);
    for (const w of watchers) w(name, true);
    if (navigator.vibrate) navigator.vibrate(8);
    for (const fn of handlers[name]) fn();
  }
  function release(name) { if (held[name]) { held[name] = false; paint(name); for (const w of watchers) w(name, false); } }

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

  // labels: per-button caption; null hides a button the game does not use.
  const LABELS = { up:'Up', down:'Down', left:'Left', right:'Right', a:'A', b:'B' };
  function mount({ title, W, H, labels = {} }) {
    document.title = title;
    document.documentElement.style.setProperty('--ar', W + ' / ' + H);
    const L = { ...LABELS, ...labels };
    const btn = (cls, k, small) => `<div class="btn ${cls}${L[k] === null ? ' off' : ''}"><button data-k="${k}" aria-label="${L[k] || k}"></button>${small ? '' : `<label>${L[k] || ''}</label>`}</div>`;
    const root = document.createElement('div');
    root.className = 'gb';
    root.innerHTML = `
      <div class="top"><a href="../">&larr; menu</a><span></span></div>
      <div class="screen"><canvas></canvas></div>
      <div class="left">
        <div class="small">
          <div class="btn green"><button data-k="start" aria-label="Pause"></button><label>Pause(P)</label></div>
          <div class="btn green"><button data-k="select" aria-label="Menu"></button><label>Menu(Esc)</label></div>
          <div class="btn red"><button data-k="reset" aria-label="Reset"></button><label>Reset(R)</label></div>
        </div>
        <div class="big">${btn('a', 'a')}${btn('b', 'b')}</div>
      </div>
      <div class="right"><div class="diamond">
        ${btn('u', 'up')}${btn('l', 'left')}${btn('r', 'right')}${btn('d', 'down')}
        <div class="mark"><i class="mu">&#9650;</i><i class="ml">&#9664;</i><i class="mr">&#9654;</i><i class="md">&#9660;</i></div>
      </div></div>
      <p class="hint">Arrows / WASD &middot; Z or Space = A &middot; X = B &middot; Enter / P = Pause &middot; R = Reset &middot; Esc = Menu</p>`;
    document.body.appendChild(root);
    root.querySelector('.top span').textContent = title;
    root.querySelectorAll('button[data-k]').forEach((b) => bindButton(b, b.dataset.k));
    handlers.select.push(() => { location.href = '../'; });
    handlers.reset.push(() => { location.reload(); });
    const cv = root.querySelector('canvas');
    cv.width = W; cv.height = H;
    return { cv, ctx: cv.getContext('2d') };
  }

  return {
    held, mount,
    // LCD palette shared by every game: dark pixels on a green-grey screen.
    ink: '#1b2210', mid: '#5e6b47', lcd: '#9ead86',
    on(name, fn) { handlers[name].push(fn); },
    watch(fn) { watchers.push(fn); },
    hi(id) { try { return Number(localStorage.getItem('arcade:hi:' + id)) || 0; } catch (e) { return 0; } },
    saveHi(id, score) { try { if (score > this.hi(id)) localStorage.setItem('arcade:hi:' + id, String(score)); } catch (e) {} },
  };
})();
