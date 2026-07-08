/* ============================================================
   ink & whiskers — shared interactions (all pages)
============================================================ */

(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = document.body.dataset.page || 'home';

  /* ---- Artwork captions (voiced like her Instagram) ---- */
  const ART_DATA = {
    1:  { title: 'the birds stole the spotlight',
          caption: 'the flowers are pretty but the birds stole the spotlight for me 🐥',
          meta: 'glass paint on acrylic sheet · 2026' },
    2:  { title: 'a little soul, soft strokes',
          caption: 'a little soul captured in soft strokes 🐱',
          meta: 'acrylic on canvas · 16″ × 20″' },
    3:  { title: 'one pour, endless details',
          caption: 'one pour. endless details. 🦋',
          meta: 'acrylic pour on hexagonal canvas' },
    4:  { title: 'waratah, loud and home',
          caption: 'home in a single bloom 🌺',
          meta: 'acrylic on canvas · australian native series' },
    5:  { title: 'and this time, for herself',
          caption: 'and this time, for herself. 💙',
          meta: 'acrylic pour on 24″ canvas' },
    6:  { title: 'a quiet kind of ocean',
          caption: 'a quiet kind of ocean 🌊',
          meta: 'acrylic pour on hexagonal canvas' },
    7:  { title: 'the whole palette, changing',
          caption: 'the kind of presence that changes the whole palette 🎨',
          meta: 'acrylic pour on hexagonal canvas' },
    8:  { title: 'sun on his face, daisies everywhere',
          caption: 'he found the sun before i found the sky colour ☀️',
          meta: 'acrylic on canvas · new' },
    9:  { title: 'the natives, back and louder',
          caption: 'banksia season, apparently 🌺',
          meta: 'acrylic on canvas · australian native series · new' },
    10: { title: 'a storm she poured on purpose',
          caption: 'the biggest canvas yet — and the loudest quiet 🌊',
          meta: 'acrylic pour · big square canvas · new' },
    11: { title: 'embers in a blue sea',
          caption: 'a little fire, a lot of ocean 🔥',
          meta: 'acrylic pour on hexagonal canvas · new' },
    12: { title: 'a garden, if you squint',
          caption: 'cells like a garden from above 🌼',
          meta: 'acrylic pour on hexagonal canvas · new' },
    13: { title: 'a hexagon, sunbathing',
          caption: 'drying in the good light, supervised by a succulent 🌵',
          meta: 'acrylic pour · on the windowsill · new' },
    14: { title: 'saturday mornings, in glass',
          caption: 'a childhood living room, held up to the sky 📺',
          meta: 'glass paint · new' },
    15: { title: 'somewhere with warm windows',
          caption: 'a street i haven\'t been to but somehow miss 🚗',
          meta: 'acrylic on canvas · new' },
    16: { title: 'steps to the sun',
          caption: 'painting my way to summer, one step at a time 🌞',
          meta: 'acrylic on canvas · new' },
    17: { title: 'held up to the light',
          caption: 'glass paint only really wakes up when the sun walks through it ✨',
          meta: 'glass paint · in the wild · new' }
  };

  /* ---- Ink entry / page-wipe transitions ---- */
  const curtain = document.getElementById('inkCurtain');
  if (curtain) {
    // home entry animation
    window.addEventListener('load', () => {
      setTimeout(() => curtain.classList.add('is-done'), reduceMotion ? 0 : 900);
    });
    // safety: never trap the page
    setTimeout(() => curtain.classList.add('is-done'), 2500);
  }

  const wipe = document.getElementById('inkWipe');
  if (wipe) {
    // wipe-in on subpages
    requestAnimationFrame(() => wipe.classList.add('is-done'));

    // wipe-out on internal navigation
    if (!reduceMotion) {
      document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        const isInternalPage = /^(index|gallery|artist|play)\.html/.test(href);
        if (!isInternalPage || a.target === '_blank') return;
        // same page + hash → let it scroll
        const [file, hash] = href.split('#');
        const current = location.pathname.split('/').pop() || 'index.html';
        if (file === current && hash) return;

        e.preventDefault();
        wipe.classList.remove('is-done');
        wipe.classList.add('is-leaving');
        setTimeout(() => { location.href = href; }, 420);
      });
    }
  }

  /* ---- Custom cursor (desktop only) ---- */
  const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasFinePointer) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) {
      let mx = innerWidth / 2, my = innerHeight / 2;
      let rx = mx, ry = my;

      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      });

      const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      };
      loop();

      const HOVER_SEL = 'a, button, .art, .palette span, .filter, .scroll-cue, .btn, .easel-card, .door, canvas, .mood-word, .swatch';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(HOVER_SEL)) document.body.classList.add('is-hovering');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(HOVER_SEL)) document.body.classList.remove('is-hovering');
      });
    }
  }

  /* ---- Scroll progress hex ---- */
  const hexFill = document.getElementById('hexFill');
  if (hexFill) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      hexFill.style.transform = `scaleY(${p})`;
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal, .art, .easel-card, .door');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- Easel strip: drag to scroll + gentle drift ---- */
  const track = document.getElementById('easelTrack');
  if (track) {
    let isDown = false, startX = 0, startScroll = 0, dragged = false;

    track.addEventListener('pointerdown', (e) => {
      isDown = true; dragged = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) dragged = true;
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });
    // stop link clicks after a drag
    track.addEventListener('click', (e) => {
      if (dragged) { e.preventDefault(); dragged = false; }
    }, true);

    // gentle auto-drift until first interaction
    if (!reduceMotion) {
      let drifting = true;
      const stop = () => { drifting = false; };
      track.addEventListener('pointerdown', stop, { once: true });
      track.addEventListener('wheel', stop, { once: true });
      const drift = () => {
        if (drifting && !isDown) {
          track.scrollLeft += 0.35;
          if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) drifting = false;
        }
        if (drifting) requestAnimationFrame(drift);
      };
      setTimeout(() => requestAnimationFrame(drift), 2200);
    }
  }

  /* ---- Gallery filters ---- */
  const filters = document.querySelectorAll('.filter');
  const arts = Array.from(document.querySelectorAll('.art'));
  if (filters.length && arts.length) {
    // show counts
    filters.forEach((btn) => {
      const f = btn.dataset.filter;
      const count = f === 'all'
        ? arts.length
        : arts.filter((a) => (a.dataset.cat || '').split(' ').includes(f)).length;
      const c = document.createElement('span');
      c.className = 'filter-count';
      c.textContent = count;
      btn.appendChild(c);
    });

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        arts.forEach((a) => {
          const show = f === 'all' || (a.dataset.cat || '').split(' ').includes(f);
          a.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ---- Lightbox (gallery page) ---- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox && arts.length) {
    const lbImg = document.getElementById('lbImg');
    const lbNum = document.getElementById('lbNum');
    const lbTitle = document.getElementById('lbTitle');
    const lbWords = document.getElementById('lbWords');
    const lbMeta = document.getElementById('lbMeta');
    const btnClose = document.getElementById('lbClose');
    const btnPrev = document.getElementById('lbPrev');
    const btnNext = document.getElementById('lbNext');

    let currentIdx = -1;

    const visibleArts = () => arts.filter((a) => !a.classList.contains('is-hidden'));

    const openAt = (art) => {
      const list = visibleArts();
      currentIdx = list.indexOf(art);
      if (currentIdx === -1) return;
      render(list[currentIdx]);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    };

    const render = (art) => {
      const id = art.dataset.id;
      const data = ART_DATA[id] || {};
      const img = art.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbNum.textContent = `— ${String(id).padStart(2, '0')}`;
      lbTitle.textContent = data.title || '';
      lbWords.textContent = data.caption || '';
      lbMeta.textContent = data.meta || '';
    };

    const step = (dir) => {
      const list = visibleArts();
      if (!list.length) return;
      currentIdx = (currentIdx + dir + list.length) % list.length;
      render(list[currentIdx]);
    };

    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    arts.forEach((art) => {
      art.addEventListener('click', () => openAt(art));
      art.setAttribute('tabindex', '0');
      art.setAttribute('role', 'button');
      art.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(art); }
      });
    });

    btnClose.addEventListener('click', close);
    if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    // deep link: gallery.html#p12 opens that piece
    const openFromHash = () => {
      const m = location.hash.match(/^#p(\d+)$/);
      if (!m) return;
      const target = document.getElementById(`p${m[1]}`);
      if (target) {
        target.scrollIntoView({ block: 'center' });
        setTimeout(() => openAt(target), reduceMotion ? 0 : 500);
      }
    };
    window.addEventListener('load', openFromHash);
    window.addEventListener('hashchange', openFromHash);
  }

  /* ---- Peek cat easter egg ---- */
  const cat = document.getElementById('peekCat');
  if (cat && !reduceMotion) {
    let shown = false;
    const maybePeek = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (p > 0.55 && !shown) {
        shown = true;
        cat.classList.add('peeking');
        setTimeout(() => cat.classList.remove('peeking'), 4200);
      }
    };
    document.addEventListener('scroll', maybePeek, { passive: true });
  }
})();
