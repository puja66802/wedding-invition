/* =========================================================
   SCREEN 2 : Couple photo (scroll hone wala page)
   - SCROLL par tap -> neeche wale hissa tak smooth scroll
   - Thoda scroll hote hi SCROLL ishara chhup jata hai
   - Save The Date wale hisse ki cheezein dikhne par fade-in
   - Countdown: shaadi tak live ginti
   - Celebrations: event ki date/din + Maps link
   - Legacy of Love: photo slider (auto + swipe)
   - RSVP: lifafe se nikalta contact card
   - Scratch: ek dil, ghisne par date + confetti
   ========================================================= */
(() => {
  const screen = document.getElementById('screen-2');
  const btn    = screen.querySelector('.s2-scroll');
  const next   = document.getElementById('s2-next');

  btn.addEventListener('click', () => {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Scroll par: SCROLL ishara chhupao + upar ki photo ka parallax
  let ticking = false;
  screen.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = screen.scrollTop;
      screen.classList.toggle('is-scrolled', y > 40);
      // sirf pehli screen tak hi zaroorat hai
      if (y <= screen.clientHeight) screen.style.setProperty('--s2-y', y);
      ticking = false;
    });
  }, { passive: true });

  // Scroll effects: cheez dikhne par .is-visible.
  // Ek saath dikhne wali cheezein thode-thode gap se aati hain (--d)
  const io = new IntersectionObserver((entries) => {
    const shown = entries.filter((e) => e.isIntersecting);
    shown.forEach((entry, i) => {
      entry.target.style.setProperty('--d', `${i * 0.12}s`);
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { root: screen, threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  screen.querySelectorAll('.reveal, .reveal-lines, .reveal-line, .reveal-card').forEach((el) => io.observe(el));

  // Countdown: har second shaadi tak ka bacha time
  const count  = screen.querySelector('.s2-count');
  const target = new Date(count.dataset.target).getTime();
  const boxes  = {};
  count.querySelectorAll('[data-unit]').forEach((el) => { boxes[el.dataset.unit] = el; });

  function tick() {
    const left = Math.max(0, target - Date.now());
    const s = Math.floor(left / 1000);
    const values = {
      days:    Math.floor(s / 86400),
      hours:   Math.floor(s / 3600) % 24,
      minutes: Math.floor(s / 60) % 60,
      seconds: s % 60
    };
    for (const unit in values) {
      const text = String(values[unit]).padStart(2, '0');
      if (boxes[unit].textContent !== text) boxes[unit].textContent = text;
    }
  }
  tick();
  setInterval(tick, 1000);

  // Celebrations: data-date se "24th November, 2026" + din, aur Maps link
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];
  const DAYS   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const suffix = (n) => (n % 100 >= 11 && n % 100 <= 13) ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');

  screen.querySelectorAll('.s2-event').forEach((ev) => {
    const [y, m, d] = ev.dataset.date.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    ev.querySelector('.s2-event-day').textContent = `${d}${suffix(d)} ${MONTHS[m - 1]}, ${y}`;
    ev.querySelector('.s2-event-weekday').textContent = DAYS[date.getDay()];

    const btn = ev.querySelector('.s2-event-btn');
    btn.href = btn.dataset.map ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(btn.dataset.venue)}`;
  });

  // A Legacy of Love: photo slider (beech wali badi, side wali jhaankti)
  const gallery = screen.querySelector('.s2-gallery');
  const track   = gallery.querySelector('.s2-gallery-track');
  const SLIDE_EVERY  = 2500;    // ms: kitni der mein agli photo
  const SLIDE_TIME   = 650;     // ms: agli photo tak khisakne ka time
  const REWIND_TIME  = 2000;    // ms: aakhri photo se pehli tak aaram se wapas
  const TOUCH_PAUSE  = 4000;    // ms: user ke chhoone ke baad auto slide kitni der ruke
  const MAX_PHOTOS  = 30;

  // Jo photo 16:9 nahi hai uska crop: kaunsa hissa dikhe (CSS object-position)
  const GALLERY_POSITION = {
    4: 'center 6%',    // lambi photo: upar se (chehre) dikhao
    6: 'center 25%'
  };

  // assets/1.jpeg, 2.jpeg ... dhoondo (jo pehla na mile wahan ruko)
  function findGalleryPhotos(n = 1, found = []) {
    if (n > MAX_PHOTOS) return Promise.resolve(found);
    return new Promise((resolve) => {
      const src = `assets/${n}.jpeg`;
      const img = new Image();
      img.onload  = () => resolve(findGalleryPhotos(n + 1, [...found, src]));
      img.onerror = () => resolve(found);
      img.src = src;
    });
  }

  // Ek slide se agli tak ki doori (photo ki chaudai + gap)
  function step() {
    const slides = track.children;
    return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
  }
  const current = () => Math.round(track.scrollLeft / step());

  function markActive() {
    const i = current();
    [...track.children].forEach((slide, k) => slide.classList.toggle('is-active', k === i));
  }
  track.addEventListener('scroll', () => requestAnimationFrame(markActive), { passive: true });

  findGalleryPhotos().then((photos) => {
    if (!photos.length) return;
    track.innerHTML = photos.map((src, i) => {
      const pos = GALLERY_POSITION[i + 1];
      const style = pos ? ` style="object-position:${pos}"` : '';
      return `<figure class="s2-slide"><img src="${src}" alt="Photo ${i + 1}" loading="lazy"${style}></figure>`;
    }).join('');
    track.scrollLeft = 0;
    markActive();
  });

  // Apni smooth scroll (browser wale se dheema/tez control ho sake).
  // Chalne ke dauraan snap band, khatam hone par wapas.
  let anim = null;
  let animEnd = 0;
  function stopAnim() {
    if (anim) cancelAnimationFrame(anim);
    anim = null;
    track.style.scrollSnapType = '';
  }
  function animateTo(left, duration) {
    stopAnim();
    const from = track.scrollLeft;
    const start = performance.now();
    animEnd = start + duration;
    const ease = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    track.style.scrollSnapType = 'none';
    const frame = (now) => {
      const p = Math.min(1, (now - start) / duration);
      track.scrollLeft = from + (left - from) * ease(p);
      if (p < 1) anim = requestAnimationFrame(frame);
      else stopAnim();
    };
    anim = requestAnimationFrame(frame);
  }

  // Auto slide: sirf jab slider dikh raha ho, aur user ke chhoone par thodi der ruk jaye
  let galleryVisible = false;
  let pausedUntil = 0;
  new IntersectionObserver(([e]) => { galleryVisible = e.isIntersecting; }, { root: screen })
    .observe(gallery);
  const pause = () => { stopAnim(); pausedUntil = Date.now() + TOUCH_PAUSE; };
  ['touchstart', 'wheel'].forEach((type) => track.addEventListener(type, pause, { passive: true }));

  setInterval(() => {
    const count = track.children.length;
    // Animation atak gayi ho (jaise app background mein gaya) to chhod do
    if (anim && performance.now() > animEnd + 1000) stopAnim();
    if (!galleryVisible || count < 2 || anim || Date.now() < pausedUntil) return;
    const i = current();
    if (i >= count - 1) animateTo(0, REWIND_TIME);            // 6 ke baad aaram se 1 par
    else animateTo((i + 1) * step(), SLIDE_TIME);
  }, SLIDE_EVERY);

  // Computer par mouse se kheench kar slide (phone par ungli se swipe pehle se chalta hai)
  let drag = null;
  track.addEventListener('pointerdown', (e) => {
    pause();
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: track.scrollLeft };
    track.style.scrollSnapType = 'none';
    track.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    track.scrollLeft = drag.left - (e.clientX - drag.x);
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    track.classList.remove('is-dragging');
    animateTo(current() * step(), 350);                       // sabse paas wali photo par tik jao
  });

  // RSVP lifafe par pehli screen wali mohar (wahi design, dobara likhna nahi padta)
  const seal = document.querySelector('#s1-seal svg');
  if (seal) screen.querySelector('.s2-env-seal').appendChild(seal.cloneNode(true));

  // Scratch: dil ghisne par date dikhti hai; saare dil (abhi ek) ho jaayein to confetti
  const scratchBox = screen.querySelector('.s2-scratch');
  const scratchHint = screen.querySelector('.s2-scratch-hint');
  const BRUSH = 28;              // ghisne wali ungli ki chaudai (px)
  const REVEAL_AT = 0.5;         // dil ka itna hissa saaf hote hi poora dikha do

  // Dil ka raasta (SVG wale .s2-heart-bg jaisa hi), size w x h ke liye
  function heartPath(ctx, w, h, k = 1) {
    const cx = w / 2, cy = h / 2;
    const X = (x) => cx + (x / 100 * w - cx) * k;
    const Y = (y) => cy + (y / 100 * h - cy) * k;
    ctx.beginPath();
    ctx.moveTo(X(50), Y(30));
    ctx.bezierCurveTo(X(50), Y(15), X(38), Y(2), X(24), Y(2));
    ctx.bezierCurveTo(X(0), Y(2), X(0), Y(32), X(0), Y(32));
    ctx.bezierCurveTo(X(0), Y(55), X(22), Y(75), X(50), Y(98));
    ctx.bezierCurveTo(X(78), Y(75), X(100), Y(55), X(100), Y(32));
    ctx.bezierCurveTo(X(100), Y(32), X(100), Y(2), X(76), Y(2));
    ctx.bezierCurveTo(X(62), Y(2), X(50), Y(15), X(50), Y(30));
    ctx.closePath();
  }

  const hearts = [...scratchBox.querySelectorAll('.s2-heart')].map((el) => {
    const canvas = el.querySelector('.s2-heart-canvas');
    const ctx = canvas.getContext('2d');
    const state = { el, canvas, ctx, total: 0, scratched: false, revealed: false };

    // Glittery rose-gold parat sirf dil ke andar
    state.draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, hgt = canvas.clientHeight;
      if (!w) return;
      canvas.width = w * dpr;
      canvas.height = hgt * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, hgt);

      // --- Base rose-gold gradient (dark at edge, lighter in centre) ---
      const g = ctx.createRadialGradient(w * .48, hgt * .42, w * .04, w * .48, hgt * .42, w * .72);
      g.addColorStop(0,   '#D9848E');
      g.addColorStop(.35, '#C46878');
      g.addColorStop(.70, '#A84F60');
      g.addColorStop(1,   '#8C3A4A');
      heartPath(ctx, w, hgt);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.save();
      heartPath(ctx, w, hgt);
      ctx.clip();

      // --- Glitter dots: many tiny sparkling particles ---
      const rng = (seed) => { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; }; };
      const r = rng(42);
      const glitterColors = [
        'rgba(255,220,220,.75)', 'rgba(255,200,210,.60)', 'rgba(255,240,235,.85)',
        'rgba(240,170,180,.55)', 'rgba(255,255,240,.70)', 'rgba(220,160,170,.50)'
      ];
      for (let i = 0; i < 260; i++) {
        const gx = r() * w, gy = r() * hgt;
        const gr = r() * 1.6 + 0.2;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fillStyle = glitterColors[Math.floor(r() * glitterColors.length)];
        ctx.fill();
      }
      // A few bigger bright sparkle stars
      for (let i = 0; i < 12; i++) {
        const sx = r() * w, sy = r() * hgt;
        ctx.fillStyle = `rgba(255,245,245,${0.55 + r() * 0.40})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r() * 2.5 + 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Top-left radial highlight: gives the 3-D rounded shine ---
      const shine = ctx.createRadialGradient(w * .32, hgt * .24, 0, w * .38, hgt * .32, w * .50);
      shine.addColorStop(0,   'rgba(255,240,240,.42)');
      shine.addColorStop(.45, 'rgba(255,210,215,.14)');
      shine.addColorStop(1,   'rgba(255,210,215,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, w, hgt);

      ctx.restore();

      // --- Inner border ring (delicate) ---
      heartPath(ctx, w, hgt, .90);
      ctx.strokeStyle = 'rgba(255, 230, 230, .45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Outer border
      heartPath(ctx, w, hgt, 1.0);
      ctx.strokeStyle = 'rgba(130, 50, 65, .40)';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // --- Text: Scratch to Reveal ---
      ctx.save();
      heartPath(ctx, w, hgt);
      ctx.clip();
      ctx.fillStyle = 'rgba(255, 245, 245, .90)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (w > 150) {
        ctx.font = `italic 500 ${Math.round(w * .095)}px "Great Vibes", "Allura", cursive`;
        ctx.fillText('Scratch to Reveal', w / 2, hgt * .46);
        // small star accent above text
        ctx.font = `${Math.round(w * .09)}px Georgia, serif`;
        ctx.fillStyle = 'rgba(255, 230, 230, .70)';
        ctx.fillText('\u2726', w / 2, hgt * .30);
      }
      ctx.restore();

      state.total = countOpaque();
    };

    // Kitne pixel abhi bhi parat wale hain (har 6th pixel dekh kar)
    function countOpaque() {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4 * 6) if (data[i] >= 128) n++;
      return n;
    }
    state.cleared = () => (state.total ? 1 - countOpaque() / state.total : 0);
    return state;
  });

  function revealHeart(hs) {
    if (hs.revealed) return;
    hs.revealed = true;
    hs.el.classList.add('is-revealed');
    if (navigator.vibrate) navigator.vibrate(15);
    if (hearts.every((x) => x.revealed)) {
      scratchBox.classList.add('is-done');
      scratchHint.classList.add('is-done');
      if (navigator.vibrate) navigator.vibrate([20, 40, 30]);
      const r = scratchBox.getBoundingClientRect();
      setTimeout(() => Confetti.burst(r.left + r.width / 2, r.top + r.height / 2), 250);
    }
  }

  hearts.forEach((hs) => {
    const { canvas, ctx } = hs;
    let last = null;
    let moves = 0;
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      // dhadakne wale scale ko bhi sambhalo
      return [(e.clientX - r.left) * canvas.clientWidth / r.width,
              (e.clientY - r.top) * canvas.clientHeight / r.height];
    };
    const scratchLine = (x, y, px, py) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = BRUSH * 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (hs.revealed) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* kuch browsers mein na chale to bhi theek */ }
      scratchBox.classList.add('is-touched');
      hs.scratched = true;
      last = point(e);
      scratchLine(last[0], last[1], last[0], last[1]);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!last || hs.revealed) return;
      const p = point(e);
      scratchLine(p[0], p[1], last[0], last[1]);
      last = p;
      if (++moves % 6 === 0 && hs.cleared() > REVEAL_AT) revealHeart(hs);
    });
    const end = () => {
      if (!last) return;
      last = null;
      if (!hs.revealed && hs.cleared() > REVEAL_AT) revealHeart(hs);
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  });

  // Font/size taiyaar hone par parat banao (jo dil abhi tak ghisa nahi gaya)
  const drawUnscratched = () => hearts.forEach((hs) => { if (!hs.scratched) hs.draw(); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawUnscratched);
  new ResizeObserver(drawUnscratched).observe(scratchBox);

  App.register('screen-2', {
    onEnter() {
      screen.classList.remove('is-scrolled');
      screen.style.setProperty('--s2-y', 0);
    }
  });
})();
