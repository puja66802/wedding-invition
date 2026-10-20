/*
  Confetti: rang-birange kaagaz ke tukde
  --------------------------------------
  - Confetti.burst(x, y)  -> #app ke andar is point se tukde udte hain, phir neeche girte hain
  - x, y = screen par position (clientX / clientY jaisa)
  - Koi library nahi; ek canvas banta hai aur khatam hone par hat jata hai
*/
const Confetti = (() => {
  const COLORS = ['#D9474F', '#E28383', '#F2B8BB', '#C9A35E', '#E9CD92', '#6E3B3B', '#FFFFFF'];
  const COUNT = 150;
  const DURATION = 4200;        // ms

  function burst(x, y) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const app = document.getElementById('app');
    const box = app.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    app.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Shuruaati point #app ke hisaab se
    const ox = x - box.left;
    const oy = y - box.top;

    const pieces = Array.from({ length: COUNT }, () => {
      const angle = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.1;   // zyadatar upar ki taraf
      const speed = 6 + Math.random() * 9;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - .5) * .35,
        flip: Math.random() * Math.PI,       // kaagaz palatne ka asar
        vflip: .08 + Math.random() * .12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    });

    const start = performance.now();
    let last = start;

    function frame(now) {
      const dt = Math.min(2, (now - last) / 16.7);   // 60fps ke hisaab se
      last = now;
      const t = now - start;
      const fade = t > DURATION - 900 ? Math.max(0, (DURATION - t) / 900) : 1;

      ctx.clearRect(0, 0, box.width, box.height);
      for (const p of pieces) {
        p.vx *= Math.pow(.985, dt);                  // hawa ka rukaav
        p.vy = p.vy * Math.pow(.985, dt) + .28 * dt; // gravity
        p.x += p.vx * dt + Math.sin(p.flip) * .6;    // halka hilna
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        p.flip += p.vflip * dt;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (t < DURATION) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  return { burst };
})();
