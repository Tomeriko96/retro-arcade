// Shared helpers: canvas scaling, high score, pointer input.
window.Arcade = {
  hi(id) { try { return Number(localStorage.getItem('arcade:hi:' + id)) || 0; } catch (e) { return 0; } },
  saveHi(id, score) {
    try { if (score > this.hi(id)) localStorage.setItem('arcade:hi:' + id, String(score)); } catch (e) {}
  },
  // Fixed logical resolution W x H, scaled to fit the screen.
  fit(canvas, W, H) {
    canvas.width = W; canvas.height = H;
    const resize = () => {
      const s = Math.min(innerWidth / W, innerHeight / H);
      canvas.style.width = W * s + 'px'; canvas.style.height = H * s + 'px';
    };
    addEventListener('resize', resize); resize();
  },
  // Pointer position in logical coordinates.
  pos(canvas, e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
  },
};
