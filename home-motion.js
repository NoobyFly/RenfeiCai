(() => {
  'use strict';
  const host = document.querySelector('[data-home-motion]');
  if (!host) return;
  const canvas = host.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const W = 600, H = 320, TAU = Math.PI * 2;
  const ground = document.createElement('canvas');
  ground.width = W;
  ground.height = H;
  const base = ground.getContext('2d');
  const random = n => { const q = Math.sin(n * 127.1 + 311.7) * 43758.5453; return q - Math.floor(q); };
  const gradient = base.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#e7eae2');
  gradient.addColorStop(.6, '#e0e5d9');
  gradient.addColorStop(1, '#d5ddcf');
  base.fillStyle = gradient;
  base.fillRect(0, 0, W, H);
  base.fillStyle = '#284833';
  for (let i = 0; i < 950; i++) {
    base.globalAlpha = .012 + random(i + 888) * .016;
    base.fillRect(random(i) * W, random(i + 1291) * H, .7, .7);
  }

  let paused = reduced.matches;
  let visible = true;
  let frameId = 0;
  let last = 0;
  let lastPaint = 0;
  let time = 11;
  let frames = 0;

  // Same line geometry, palette and timing as the selected D6 study.
  function draw() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * ratio), height = Math.round(rect.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(width / W, 0, 0, height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(ground, 0, 0);
    const scale = Math.min(width / W, height / H);
    ctx.setTransform(scale, 0, 0, scale, (width - W * scale) / 2, (height - H * scale) / 2);
    ctx.save();
    ctx.translate(300, 261);
    ctx.scale(1, 20 / 170);
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, 170);
    shadow.addColorStop(0, 'rgba(32,58,42,.11)');
    shadow.addColorStop(1, 'rgba(32,58,42,0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-170, -170, 340, 340);
    ctx.restore();
    for (let i = 0; i < 112; i++) {
      const u = i / 111, x = 105 + u * 390;
      const y0 = 58 + Math.sin(u * Math.PI) * 11 + Math.cos(u * TAU) * 8;
      const y1 = 178 + Math.sin(u * TAU - time * .19) * 40 + Math.sin(u * 12 + time * .18) * 20;
      const bow = Math.sin(time * .3 + u * 3) * 5;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.bezierCurveTo(x + bow, y0 + 50, x - bow, y1 - 30, x, y1);
      ctx.strokeStyle = i % 29 === 0 ? '#a2895ca8' : `rgba(47,79,64,${.18 + .42 * Math.sin(u * Math.PI)})`;
      ctx.lineWidth = i % 5 === 0 ? 1.1 : .6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y1, i % 11 === 0 ? 1.8 : .65, 0, TAU);
      ctx.fillStyle = '#4869579c';
      ctx.fill();
    }
    canvas.dataset.frame = String(++frames);
  }

  function isActive() { return !paused && visible && !document.hidden; }
  function tick(now) {
    frameId = 0;
    if (!isActive()) return;
    if (last) time += Math.min((now - last) / 1000, .07);
    last = now;
    if (now - lastPaint >= 33) { lastPaint = now; draw(); }
    frameId = requestAnimationFrame(tick);
  }
  function sync() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    last = 0;
    host.dataset.motionState = document.hidden ? 'background' : paused ? 'paused' : visible ? 'playing' : 'offscreen';
    if (isActive()) frameId = requestAnimationFrame(tick);
  }
  host.hidden = false;
  draw();
  sync();
  reduced.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: .08 }).observe(host);
  }
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(canvas);
  else window.addEventListener('resize', draw);
  window.addEventListener('pagehide', () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; });
  window.addEventListener('pageshow', sync);
})();
