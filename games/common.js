// Gedeelde helpers: canvas-schaling, highscore, pointer-besturing.
window.Arcade = {
  hi(id) { try { return Number(localStorage.getItem('arcade:hi:' + id)) || 0; } catch (e) { return 0; } },
  saveHi(id, score) {
    try { if (score > this.hi(id)) localStorage.setItem('arcade:hi:' + id, String(score)); } catch (e) {}
  },
  // Vaste logische resolutie W x H, geschaald naar het scherm.
  fit(canvas, W, H) {
    canvas.width = W; canvas.height = H;
    const resize = () => {
      const s = Math.min(innerWidth / W, innerHeight / H);
      canvas.style.width = W * s + 'px'; canvas.style.height = H * s + 'px';
    };
    addEventListener('resize', resize); resize();
  },
  // Pointer-positie in logische coördinaten.
  pos(canvas, e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
  },
};
