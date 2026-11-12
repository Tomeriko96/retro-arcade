// Launcher-only PWA glue: registers the service worker, offers an Install button where the browser supports it,
// explains "Add to Home Screen" on iOS, and shows a "new version" prompt when an updated worker takes over.
(function () {
  const $ = (id) => document.getElementById(id);
  const installBtn = $('install-btn'), iosHint = $('ios-hint'), toast = $('update-toast');
  const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone;

  let deferred = null;
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (installBtn && !standalone) installBtn.hidden = false;
  });
  addEventListener('appinstalled', () => { deferred = null; if (installBtn) installBtn.hidden = true; });
  if (installBtn) installBtn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) {}
    deferred = null; installBtn.hidden = true;
  });
  // iOS Safari has no install prompt API; point people to the share sheet instead.
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (iosHint && ios && !standalone) iosHint.hidden = false;

  if (!('serviceWorker' in navigator)) return;
  const showUpdate = () => { if (toast) toast.hidden = false; };
  function warmCache(reg) {
    // Fetch the vendored games in the background once the page is idle.
    const go = () => reg.active && reg.active.postMessage('warm');
    (window.requestIdleCallback || ((f) => setTimeout(f, 2000)))(go);
  }
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    navigator.serviceWorker.ready.then(warmCache);
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate();
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(); });
    });
    // Long-lived installed apps: look for a new version whenever the app comes back to the foreground.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
  const reload = $('update-reload');
  if (reload) reload.addEventListener('click', () => location.reload());
})();
