/* ============================================================
   ink & whiskers — interactions
============================================================ */

(() => {
  'use strict';

  /* ---- Artwork captions (real ones from her Instagram) ---- */
  const ART_DATA = {
    1: {
      title: 'the birds stole the spotlight',
      caption: 'the flowers are pretty but the birds stole the spotlight for me 🐥',
      meta: 'glass paint on acrylic sheet · 2026'
    },
    2: {
      title: 'a little soul, soft strokes',
      caption: 'a little soul captured in soft strokes 🐱',
      meta: 'acrylic on canvas · 16″ × 20″'
    },
    3: {
      title: 'one pour, endless details',
      caption: 'one pour. endless details. 🦋',
      meta: 'acrylic pour on hexagonal canvas'
    },
    4: {
      title: 'waratah, loud and home',
      caption: 'home in a single bloom 🌺',
      meta: 'acrylic on canvas · australian native series'
    },
    5: {
      title: 'and this time, for herself',
      caption: 'and this time, for herself. 💙',
      meta: 'acrylic pour on 24″ canvas'
    },
    6: {
      title: 'a quiet kind of ocean',
      caption: 'a quiet kind of ocean 🌊',
      meta: 'acrylic pour on hexagonal canvas'
    },
    7: {
      title: 'the whole palette, changing',
      caption: 'the kind of presence that changes the whole palette 🎨',
      meta: 'acrylic pour on hexagonal canvas'
    }
  };

  /* ---- Custom cursor (desktop only) ---- */
  const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasFinePointer) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    // ring trails with easing
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    // hover state
    const HOVER_SEL = 'a, button, .art, .palette span, .filter, .scroll-cue, .btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(HOVER_SEL)) document.body.classList.add('is-hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(HOVER_SEL)) document.body.classList.remove('is-hovering');
    });
  }

  /* ---- Scroll progress hex ---- */
  const hexFill = document.getElementById('hexFill');
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? h.scrollTop / max : 0;
    if (hexFill) hexFill.style.transform = `scaleY(${pct})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---- Reveal on scroll ---- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---- Stagger the gallery tiles on first reveal ---- */
  const artTiles = document.querySelectorAll('.art');
  const artObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(artTiles).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('is-in'), idx * 110);
        artObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  artTiles.forEach(el => artObserver.observe(el));

  /* ---- Gallery filters ---- */
  const filters = document.querySelectorAll('.filter');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach(f => f.classList.remove('is-active'));
      btn.classList.add('is-active');

      artTiles.forEach(tile => {
        const tags = (tile.dataset.cat || '').split(/\s+/);
        const show = cat === 'all' || tags.includes(cat);
        tile.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---- Lightbox ---- */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbWords  = document.getElementById('lbWords');
  const lbMeta   = document.getElementById('lbMeta');
  const lbNum    = document.getElementById('lbNum');
  const lbClose  = document.getElementById('lbClose');

  const openLightbox = (tile) => {
    const id = tile.dataset.id;
    const data = ART_DATA[id];
    if (!data) return;

    const img = tile.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = data.title;
    lbWords.textContent = data.caption;
    lbMeta.textContent = data.meta;
    lbNum.textContent = `— ${String(id).padStart(2, '0')}`;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  artTiles.forEach(tile => tile.addEventListener('click', () => openLightbox(tile)));
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  /* ---- Peek cat easter egg ---- */
  const peekCat = document.getElementById('peekCat');
  let peekShown = false;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (pct > 0.45 && pct < 0.85 && !peekShown) {
      peekCat.classList.add('peeking');
      peekShown = true;
    } else if ((pct <= 0.45 || pct >= 0.85) && peekShown) {
      peekCat.classList.remove('peeking');
      peekShown = false;
    }
  }, { passive: true });

  /* ---- Console love note ---- */
  console.log(
    '%c ink & whiskers ',
    'background:#1A1612;color:#F5EFE4;font-family:serif;font-size:14px;padding:6px 12px;border-radius:4px;',
    '\nmade with paint, patience, and a little hex-shaped joy.\n→ instagram.com/ink_n_whiskers'
  );
})();
