// Stop double-tap and pinch zoom. iOS Safari ignores user-scalable=no, so also handle it in CSS and JS.
// noZoom(win) can be called for an embedded same-origin game (iframe) too.
(function () {
  function apply(win, blockFastTaps) {
    try {
      const d = win.document;
      // Keep a stricter touch-action (the console pages use "none" so nothing scrolls); otherwise block double-tap zoom.
      if (d.body && win.getComputedStyle(d.body).touchAction === 'auto') {
        const st = d.createElement('style');
        st.textContent = 'html,body{touch-action:manipulation}';
        (d.head || d.documentElement).appendChild(st);
      }
      for (const t of ['gesturestart', 'gesturechange', 'gestureend']) d.addEventListener(t, (e) => e.preventDefault());
      d.addEventListener('dblclick', (e) => e.preventDefault());
      if (blockFastTaps) {
        // Our own console buttons use pointer events, so swallowing the 2nd tap's touchend does not affect them.
        let last = 0;
        d.addEventListener('touchend', (e) => {
          const now = Date.now();
          if (now - last < 350 && e.cancelable) e.preventDefault();
          last = now;
        }, { passive: false });
      }
    } catch (e) { /* cross-origin frame: nothing to do */ }
  }
  window.noZoom = apply;
  apply(window, true);
})();
