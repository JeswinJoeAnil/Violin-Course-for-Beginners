/* ============================================================
   VIOLIN ACADEMY — LANDING PAGE JS
   GSAP + ScrollTrigger + Lenis + Canvas animations
   ============================================================ */

// ---- GSAP + Plugins ----
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ---- Lenis smooth scroll ----
// Access lenis from global smooth-scroll.js
const lenis = window.lenis;

/* ============================================================
   PRELOADER
   ============================================================ */
(function initPreloader() {
  const loader = document.getElementById('preloader');
  const bar    = document.querySelector('.preloader-progress-bar');
  if (!loader) return;

  let prog = 0;
  const interval = setInterval(() => {
    prog += Math.random() * 18;
    if (prog >= 100) { prog = 100; clearInterval(interval); }
    bar.style.width = prog + '%';
    if (prog >= 100) {
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0, duration: 0.3, ease: 'power2.inOut',
          onComplete: () => { loader.style.display = 'none'; startIntro(); }
        });
      }, 100);
    }
  }, 80);
})();

/* ============================================================
   INTRO SCREEN (Music symbol → landing transition)
   ============================================================ */
function startIntro() {
  const intro  = document.getElementById('intro-screen');
  const clef   = document.querySelector('.intro-clef');
  const tag    = document.querySelector('.intro-tagline');
  const sub    = document.querySelector('.intro-sub');
  const skip   = document.querySelector('.intro-skip');
  if (!intro) { startHeroAnimation(); return; }

  initIntroCanvas();

  const tl = gsap.timeline({ onComplete: transitionToHero });
  tl.to(clef, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.2)', delay: 0.2 })
    .to(tag,  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to(sub,  { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to(skip, { opacity: 1, duration: 0.4 }, '-=0.2')
    .to({}, { duration: 0.2 }); // hold

  skip.addEventListener('click', () => { tl.progress(1); });
}

function transitionToHero() {
  const intro = document.getElementById('intro-screen');
  const clef  = document.querySelector('.intro-clef');
  const tl = gsap.timeline({ onComplete: () => { intro.style.display = 'none'; startHeroAnimation(); } });
  tl.to(clef, { scale: 30, opacity: 0, duration: 1.2, ease: 'power3.in' })
    .to(intro, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.3');
}

function initIntroCanvas() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, notes = [], anim;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  // Floating music notes
  const symbols = ['♩','♪','♫','♬','𝄞','𝄢'];
  for (let i = 0; i < 35; i++) {
    notes.push({
      x: Math.random() * W || Math.random() * 800,
      y: Math.random() * H || Math.random() * 600,
      char: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() * 22 + 10,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.25 + 0.05,
      drift: (Math.random() - 0.5) * 0.3
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    notes.forEach(n => {
      ctx.font = `${n.size}px serif`;
      ctx.fillStyle = `rgba(201,168,76,${n.opacity})`;
      ctx.fillText(n.char, n.x, n.y);
      n.y -= n.speed;
      n.x += n.drift;
      if (n.y < -30) { n.y = H + 30; n.x = Math.random() * W; }
    });
    anim = requestAnimationFrame(draw);
  }
  draw();
  // cleanup on transition
  document.getElementById('intro-screen').addEventListener('transitionend', () => { cancelAnimationFrame(anim); });
}

/* ============================================================
   HERO CANVAS — Waveform visualizer
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, phase = 0;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const lines = [
    { amp: 60,  freq: 0.012, speed: 0.018, color: 'rgba(201,168,76,0.12)',  offset: 0    },
    { amp: 90,  freq: 0.008, speed: 0.012, color: 'rgba(201,168,76,0.06)',  offset: 1.5  },
    { amp: 40,  freq: 0.02,  speed: 0.025, color: 'rgba(108,99,255,0.08)',  offset: 3    },
    { amp: 120, freq: 0.005, speed: 0.008, color: 'rgba(201,168,76,0.04)',  offset: 4.5  },
    { amp: 55,  freq: 0.015, speed: 0.02,  color: 'rgba(240,234,216,0.04)', offset: 6    },
  ];

  function drawWave(line, t) {
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    for (let x = 0; x <= W; x += 4) {
      const y = H / 2
        + Math.sin((x * line.freq) + t + line.offset) * line.amp
        + Math.sin((x * line.freq * 2) + t * 1.3 + line.offset) * (line.amp * 0.3)
        + Math.cos((x * line.freq * 0.5) + t * 0.7) * (line.amp * 0.2);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawParticles(t) {
    for (let i = 0; i < 5; i++) {
      const x = ((t * 40 + i * (W / 5)) % W);
      const y = H / 2 + Math.sin(t * 1.5 + i * 1.2) * 80;
      const r = (Math.sin(t + i) * 0.5 + 0.5) * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${(Math.sin(t + i) * 0.5 + 0.5) * 0.5})`;
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    phase += 0.012;
    lines.forEach(l => drawWave(l, phase * l.speed / 0.012));
    drawParticles(phase);
    requestAnimationFrame(animate);
  }
  animate();
}

/* ============================================================
   MORPH CANVAS — scroll-driven shape morphing
   ============================================================ */
function initMorphCanvas() {
  const canvas = document.getElementById('morph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  let progress = 0; // 0 = circles, 1 = bars
  let t = 0;

  function lerp(a, b, p) { return a + (b - a) * p; }
  function easeInOut(p) { return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.02;
    const ep = easeInOut(Math.min(progress, 1));

    // Background gradient pulse
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.6);
    grad.addColorStop(0, `rgba(201,168,76,${0.04 + ep * 0.04})`);
    grad.addColorStop(1, 'rgba(7,7,9,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Morph between sine wave (0) and equalizer bars (1)
    const barCount = 28;
    const bW = W / (barCount * 2);

    for (let i = 0; i < barCount; i++) {
      const xCenter = (i / barCount) * W + bW;
      // Wave form shape
      const waveH = (Math.sin((i / barCount) * Math.PI * 4 + t) * 0.5 + 0.5) * H * 0.4;
      // Bar shape
      const barH  = (Math.abs(Math.sin(i * 0.5 + t * 0.8)) * 0.7 + 0.15) * H * 0.5;
      const h = lerp(waveH, barH, ep);

      const alpha = lerp(0.15, 0.55, ep) * (Math.sin(i * 0.4 + t * 0.5) * 0.3 + 0.7);
      const g = ctx.createLinearGradient(xCenter, H/2 - h, xCenter, H/2 + h);
      g.addColorStop(0,   `rgba(201,168,76,0)`);
      g.addColorStop(0.3, `rgba(201,168,76,${alpha})`);
      g.addColorStop(0.5, `rgba(232,199,106,${alpha * 1.3})`);
      g.addColorStop(0.7, `rgba(201,168,76,${alpha})`);
      g.addColorStop(1,   `rgba(201,168,76,0)`);

      const bRadius = lerp(bW, 3, ep);
      ctx.fillStyle = g;
      ctx.beginPath();
      // Morph bar width
      const bWMorph = lerp(2, bW, ep);
      if (ctx.roundRect) {
        ctx.roundRect(xCenter - bWMorph/2, H/2 - h, bWMorph, h * 2, bRadius);
      } else {
        ctx.rect(xCenter - bWMorph/2, H/2 - h, bWMorph, h * 2);
      }
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();

  // ScrollTrigger drives progress
  ScrollTrigger.create({
    trigger: '#morph-section',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: self => { progress = self.progress; }
  });
}

/* ============================================================
   HERO ANIMATION (runs after intro)
   ============================================================ */
function startHeroAnimation() {
  initHeroCanvas();
  initMorphCanvas();

  const tl = gsap.timeline({ delay: 0.1 });
  tl.to('.hero-eyebrow',  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to('.hero-title .line span', {
        opacity: 1, y: 0,
        duration: 0.9, stagger: 0.12,
        ease: 'power4.out'
      }, '-=0.2')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('.hero-ctas',     { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero-scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.1');
}

/* ============================================================
   NAVBAR — smart hide/show + scroll style
   ============================================================ */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let lastY = 0, ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // scrolled style
        if (y > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        // smart hide
        if (y > 200) {
          if (y > lastY + 5) nav.classList.add('hidden');
          else if (y < lastY - 5) nav.classList.remove('hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });

  // Dropdown
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const trigger = dd.querySelector('a');
    const panel   = dd.querySelector('.nav-dropdown-panel');
    let closeTimer;
    dd.addEventListener('mouseenter', () => { clearTimeout(closeTimer); dd.classList.add('open'); });
    dd.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => dd.classList.remove('open'), 150); });
    // touch
    trigger.addEventListener('click', e => { e.preventDefault(); dd.classList.toggle('open'); });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
})();

/* ============================================================
   AUTH MODAL
   ============================================================ */
(function initAuth() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  const modal   = overlay.querySelector('.auth-modal');
  const close   = overlay.querySelector('.auth-close');
  const tabs    = overlay.querySelectorAll('.auth-tab');
  const panels  = overlay.querySelectorAll('.auth-panel');

  function open(tab = 'login') {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    tabs.forEach(t => { t.classList.toggle('active', t.dataset.tab === tab); });
    panels.forEach(p => { p.classList.toggle('active', p.id === 'panel-' + tab); });
    lenis.stop();
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lenis.start();
  }

  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Trigger buttons
  document.querySelectorAll('[data-auth]').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.auth || 'login'));
  });

  // Keyboard
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  window.openAuth = open;
})();

/* ============================================================
   SCROLL ANIMATIONS — Overview
   ============================================================ */
(function initScrollAnimations() {
  // Intersection Observer for reveal classes
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));

  // Stat counters
  const statNums = document.querySelectorAll('.stat-card-num[data-target]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let current = 0;
        const duration = 1800;
        const step = target / (duration / 16);
        const ticker = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
          if (current >= target) clearInterval(ticker);
        }, 16);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObserver.observe(el));

  // Overview stat numbers (inline)
  const overviewStats = document.querySelectorAll('.stat-num[data-target]');
  const ovObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 80;
        const ticker = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current) + suffix;
          if (current >= target) clearInterval(ticker);
        }, 16);
        ovObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  overviewStats.forEach(el => ovObserver.observe(el));
})();

/* ============================================================
   GSAP PINNED HORIZONTAL SCROLL — Features
   ============================================================ */
(function initFeaturesScroll() {
  const section = document.getElementById('features');
  const track   = document.querySelector('.features-track');
  const fill    = document.querySelector('.features-progress-fill');
  if (!section || !track) return;

  const totalWidth  = track.scrollWidth;
  const viewWidth   = track.offsetWidth;
  const scrollDist  = totalWidth - viewWidth + 128; // 128 = padding

  gsap.to(track, {
    x: () => -scrollDist,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + (scrollDist + viewWidth),
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
      onUpdate: self => {
        if (fill) fill.style.width = (self.progress * 100) + '%';
      }
    }
  });
})();

/* ============================================================
   MORPH TEXT — GSAP word reveal
   ============================================================ */
(function initMorphText() {
  gsap.from('.morph-text p span', {
    opacity: 0, y: 40, stagger: 0.08, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#morph-section', start: 'top 70%' }
  });
})();

/* ============================================================
   OVERVIEW PARALLAX
   ============================================================ */
(function initParallax() {
  gsap.to('.overview-visual', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '#overview',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });
  gsap.to('.hero-glow-1', {
    y: 120, x: 40,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
  gsap.to('.hero-glow-2', {
    y: 80, x: -30,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
})();

/* ============================================================
   CTA SECTION text reveal
   ============================================================ */
gsap.from('.cta-title', {
  opacity: 0, y: 60, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '#cta', start: 'top 70%' }
});
gsap.from('.cta-sub', {
  opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', delay: 0.2,
  scrollTrigger: { trigger: '#cta', start: 'top 70%' }
});
gsap.from('.cta-actions', {
  opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', delay: 0.4,
  scrollTrigger: { trigger: '#cta', start: 'top 70%' }
});

/* ============================================================
   FEATURE CARDS — per card hover glow
   ============================================================ */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});
