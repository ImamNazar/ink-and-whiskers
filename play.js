/* ============================================================
   ink & whiskers — the play studio
   01 pour a hexagon · 02 colour of your day
   03 the prompt jar · 04 which painting are you?
============================================================ */

(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     01 · POUR A HEXAGON — real ink-marbling maths
     Each drop is a disc that displaces every older drop:
       p' = c + (p − c) · √(1 + r² / |p − c|²)
     A "tine" (comb) drag shears points sideways with falloff.
  ========================================================== */
  const canvas = document.getElementById('pourCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2;

    const PALETTES = [
      { name: 'ocean',  colors: ['#0E5D62', '#1B7F86', '#7FB7BE', '#F5EFE4', '#0A3A54', '#C9D8D9'] },
      { name: 'ember',  colors: ['#B83A5C', '#E2653B', '#C99D3F', '#F5EFE4', '#5C1F32', '#F0B27A'] },
      { name: 'garden', colors: ['#2C5F2D', '#7BA05B', '#C99D3F', '#F5EFE4', '#B83A5C', '#DCE8C8'] },
      { name: 'cosmic', colors: ['#1A1633', '#41337A', '#B83A5C', '#C99D3F', '#F5EFE4', '#2A6F97'] },
      { name: 'thabu',  colors: ['#0E5D62', '#B83A5C', '#C99D3F', '#2C5F2D', '#E8D4C5', '#1A1612'] }
    ];
    let palette = PALETTES[4];
    let colorIdx = 0;

    /** drops: { pts: [{x,y}...], color } — newest drawn last */
    let drops = [];
    let tool = 'drop';
    const PTS = 64; // points per drop outline

    const hexPath = () => {
      const r = Math.min(W, H) / 2 - 6;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 180 * (60 * i - 90);
        const x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
    };

    const paintBase = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      hexPath();
      ctx.clip();
      ctx.fillStyle = '#F5EFE4';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      // hex rim
      hexPath();
      ctx.strokeStyle = 'rgba(26,22,18,.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const redraw = () => {
      paintBase();
      ctx.save();
      hexPath();
      ctx.clip();
      for (const d of drops) {
        ctx.beginPath();
        d.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
      }
      ctx.restore();
      hexPath();
      ctx.strokeStyle = 'rgba(26,22,18,.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const addDrop = (x, y, r) => {
      // displace existing drops outward
      for (const d of drops) {
        for (const p of d.pts) {
          const dx = p.x - x, dy = p.y - y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 === 0) continue;
          const s = Math.sqrt(1 + (r * r) / dist2);
          p.x = x + dx * s;
          p.y = y + dy * s;
        }
      }
      // new drop circle
      const pts = [];
      for (let i = 0; i < PTS; i++) {
        const a = (Math.PI * 2 * i) / PTS;
        pts.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a) });
      }
      drops.push({ pts, color: palette.colors[colorIdx % palette.colors.length] });
      colorIdx++;
      if (drops.length > 140) drops = drops.slice(-140); // keep it snappy
    };

    // tine / comb: shear along drag direction with distance falloff
    const tine = (x, y, dx, dy) => {
      const len = Math.hypot(dx, dy);
      if (len < 0.5) return;
      const ux = dx / len, uy = dy / len; // drag direction
      const nx = -uy, ny = ux;            // normal to it
      const Z = 24;                       // sharpness
      const A = Math.min(len, 40);        // strength
      for (const d of drops) {
        for (const p of d.pts) {
          // perpendicular distance from the drag line
          const relx = p.x - x, rely = p.y - y;
          const dist = Math.abs(relx * nx + rely * ny);
          const shift = (A * Z) / (dist + Z);
          p.x += ux * shift;
          p.y += uy * shift;
        }
      }
    };

    const hint = document.getElementById('pourHint');
    const hideHint = () => { if (hint) hint.classList.add('is-hidden'); };

    const toCanvasXY = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H
      };
    };

    let pointerDown = false;
    let last = null;
    let lastDropAt = 0;

    canvas.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      hideHint();
      const p = toCanvasXY(e);
      last = p;
      if (tool === 'drop') {
        addDrop(p.x, p.y, 34 + Math.random() * 40);
        redraw();
      }
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointerDown) return;
      const p = toCanvasXY(e);
      if (tool === 'drop') {
        const now = performance.now();
        if (now - lastDropAt > 90) {
          addDrop(p.x, p.y, 22 + Math.random() * 26);
          lastDropAt = now;
          redraw();
        }
      } else if (last) {
        tine(last.x, last.y, p.x - last.x, p.y - last.y);
        redraw();
      }
      last = p;
    });

    const release = () => { pointerDown = false; last = null; };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    /* palette buttons */
    const palWrap = document.getElementById('pourPalettes');
    PALETTES.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'pal-btn' + (p === palette ? ' is-active' : '');
      b.setAttribute('aria-pressed', p === palette ? 'true' : 'false');
      b.title = p.name;
      b.innerHTML =
        `<span class="pal-chips">` +
        p.colors.slice(0, 5).map((c) => `<i style="background:${c}"></i>`).join('') +
        `</span><span class="pal-name hand">${p.name}</span>`;
      b.addEventListener('click', () => {
        palette = p;
        colorIdx = 0;
        palWrap.querySelectorAll('.pal-btn').forEach((x) => {
          x.classList.remove('is-active');
          x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('is-active');
        b.setAttribute('aria-pressed', 'true');
      });
      palWrap.appendChild(b);
    });

    /* tools */
    const toolDrop = document.getElementById('toolDrop');
    const toolComb = document.getElementById('toolComb');
    const setTool = (t) => {
      tool = t;
      toolDrop.classList.toggle('is-active', t === 'drop');
      toolComb.classList.toggle('is-active', t === 'comb');
      toolDrop.setAttribute('aria-pressed', t === 'drop');
      toolComb.setAttribute('aria-pressed', t === 'comb');
      canvas.style.cursor = t === 'drop' ? 'crosshair' : 'grab';
    };
    toolDrop.addEventListener('click', () => setTool('drop'));
    toolComb.addEventListener('click', () => setTool('comb'));

    /* rinse + save */
    document.getElementById('pourRinse').addEventListener('click', () => {
      drops = [];
      colorIdx = 0;
      redraw();
      if (hint) hint.classList.remove('is-hidden');
    });

    document.getElementById('pourSave').addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = 'my-ink-and-whiskers-pour.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    });

    /* a tiny starter pour so the canvas never feels empty */
    if (!reduceMotion) {
      setTimeout(() => {
        if (drops.length) return;
        addDrop(CX - 60, CY - 40, 70);
        addDrop(CX + 50, CY + 30, 60);
        addDrop(CX, CY, 46);
        redraw();
      }, 1200);
    }
    redraw();
  }

  /* ==========================================================
     02 · COLOUR OF YOUR DAY
  ========================================================== */
  const moodWrap = document.getElementById('moodWords');
  if (moodWrap) {
    const MOODS = {
      quiet:    { line: 'a soft day. keep it that way.',
                  swatches: [['morning fog', '#D8D3C8'], ['quiet teal', '#5E8C8F'], ['unbleached', '#F5EFE4'], ['closed curtains', '#4A3F35'], ['one candle', '#C99D3F']] },
      loud:     { line: 'a day that walked in without knocking.',
                  swatches: [['front-row red', '#C22B4E'], ['brass', '#C99D3F'], ['shout of teal', '#0E5D62'], ['hot blush', '#E88CA0'], ['ink, for contrast', '#1A1612']] },
      homesick: { line: 'somewhere else is also a colour.',
                  swatches: [['mum\'s kitchen', '#C97B3F'], ['monsoon green', '#2C5F2D'], ['old gold', '#B8912F'], ['far-away sea', '#0A3A54'], ['letter paper', '#F0E6D2']] },
      brave:    { line: 'paint first, worry later.',
                  swatches: [['leap red', '#B83A5C'], ['no-map blue', '#155E75'], ['sunlit nerve', '#E2A23B'], ['fresh start', '#F5EFE4'], ['deep breath', '#073B3E']] },
      soft:     { line: 'the kind of day a cat would design.',
                  swatches: [['paw pink', '#E8B4C0'], ['warm milk', '#F3E9DA'], ['dozing gold', '#D9B36A'], ['blanket grey', '#8C8478'], ['nap-time green', '#9DB595']] },
      thunder:  { line: 'good. storms make the best pours.',
                  swatches: [['bruised sky', '#3B3A50'], ['storm teal', '#0E5D62'], ['lightning', '#F5EFE4'], ['wet slate', '#5C6670'], ['after-rain gold', '#C99D3F']] },
      giddy:    { line: 'a whole confetti of a day.',
                  swatches: [['party magenta', '#C93A78'], ['lemon drop', '#E8C33B'], ['pool blue', '#3BA7C9'], ['mint bite', '#7BC9A0'], ['tangerine', '#E2743B']] },
      tired:    { line: 'still a colour. still counts.',
                  swatches: [['heavy lids', '#6B5F52'], ['weak tea', '#D9C6A5'], ['dim teal', '#41666A'], ['pillow', '#EFE7D8'], ['tomorrow', '#A0B5B7']] }
    };

    const result = document.getElementById('moodResult');

    Object.keys(MOODS).forEach((word) => {
      const b = document.createElement('button');
      b.className = 'mood-word';
      b.textContent = word;
      b.addEventListener('click', () => {
        moodWrap.querySelectorAll('.mood-word').forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        const m = MOODS[word];
        result.innerHTML =
          `<p class="hand mood-line">"${m.line}"</p>
           <div class="mood-swatches">` +
          m.swatches.map(([name, hex]) =>
            `<button class="swatch" data-hex="${hex}" title="copy ${hex}">
               <i style="background:${hex}"></i>
               <span class="swatch-name">${name}</span>
               <span class="swatch-hex">${hex}</span>
             </button>`).join('') +
          `</div>
           <p class="mood-copy-hint">tap a swatch to copy its code</p>`;

        result.querySelectorAll('.swatch').forEach((s) => {
          s.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(s.dataset.hex);
              const old = s.querySelector('.swatch-hex').textContent;
              s.querySelector('.swatch-hex').textContent = 'copied!';
              setTimeout(() => { s.querySelector('.swatch-hex').textContent = old; }, 1200);
            } catch { /* clipboard unavailable — the hex is visible anyway */ }
          });
        });
      });
      moodWrap.appendChild(b);
    });
  }

  /* ==========================================================
     03 · THE PROMPT JAR
  ========================================================== */
  const jarBtn = document.getElementById('jarBtn');
  if (jarBtn) {
    const PROMPTS = [
      'paint the last thing that made you laugh — badly, on purpose.',
      'mix the exact colour of your morning tea or coffee. name it.',
      'draw your street as if it were somewhere by the sea.',
      'a hexagon, filled with whatever today felt like.',
      'paint a cat you have met exactly once.',
      'the sky right now, in three colours only.',
      'something from your childhood living room, from memory.',
      'a flower that doesn\'t exist yet. give it a name.',
      'trace your hand. fill it with every colour on your desk.',
      'the sound of rain, but as a pattern.',
      'paint a door you\'d like to walk through.',
      'your favourite person, as a colour palette — no faces allowed.',
      'the ocean, but from above, like a bird who isn\'t in a hurry.',
      'a tiny painting the size of a postage stamp. take your time.',
      'the word "home" without writing any letters.',
      'something teal. anything teal. thabu insists.'
    ];
    const stage = document.getElementById('slipStage');
    let lastIdx = -1;

    jarBtn.addEventListener('click', () => {
      let i;
      do { i = Math.floor(Math.random() * PROMPTS.length); } while (i === lastIdx && PROMPTS.length > 1);
      lastIdx = i;

      jarBtn.classList.remove('is-shaking');
      void jarBtn.offsetWidth; // restart animation
      jarBtn.classList.add('is-shaking');

      const rot = (Math.random() * 6 - 3).toFixed(1);
      stage.innerHTML =
        `<div class="slip" style="--rot:${rot}deg">
           <span class="slip-pin" aria-hidden="true"></span>
           <p class="hand slip-text">${PROMPTS[i]}</p>
           <span class="slip-num">slip nº ${String(i + 1).padStart(2, '0')} / ${PROMPTS.length}</span>
         </div>`;
    });
  }

  /* ==========================================================
     04 · WHICH PAINTING ARE YOU?
  ========================================================== */
  const quizWrap = document.getElementById('quizStudio');
  if (quizWrap) {
    // result keys: ocean, birds, cat, waratah, hex, street
    const RESULTS = {
      ocean:   { img: 'images/ocean-pour.jpg',  title: 'and this time, for herself',
                 line: 'you are the ocean pour — calm on the surface, doing a thousand things underneath. you make big feelings look effortless.' },
      birds:   { img: 'images/stained-glass-birds.jpg', title: 'the birds stole the spotlight',
                 line: 'you are the stained-glass birds — detailed, colourful, and impossible to ignore even when you\'re trying to be background.' },
      cat:     { img: 'images/kitten-daisies.jpg', title: 'sun on his face, daisies everywhere',
                 line: 'you are the kitten in the daisies — you find the warm spot in any situation and you are not sorry about it.' },
      waratah: { img: 'images/waratah.jpg', title: 'waratah, loud and home',
                 line: 'you are the waratah — bold, rooted, and unmistakably yourself. people remember meeting you.' },
      hex:     { img: 'images/hex-pour-ember.jpg', title: 'embers in a blue sea',
                 line: 'you are the ember hexagon — mostly calm, secretly on fire, and full of details people only notice up close.' },
      street:  { img: 'images/island-steps.jpg', title: 'steps to the sun',
                 line: 'you are the sunny street — optimistic, warm, and always halfway to somewhere better. people follow you there.' }
    };

    const QUESTIONS = [
      { q: 'it\'s a free saturday morning. you…',
        a: [ ['stay in bed listening to rain', 'ocean'],
             ['reorganise everything, beautifully', 'birds'],
             ['find a sunny spot and stay there', 'cat'],
             ['call everyone. make a plan. go.', 'street'] ] },
      { q: 'pick a weather.',
        a: [ ['storm rolling in over the sea', 'ocean'],
             ['golden late-afternoon light', 'waratah'],
             ['first proper day of summer', 'street'],
             ['that hour after rain stops', 'hex'] ] },
      { q: 'someone hands you a brush. first instinct?',
        a: [ ['tiny careful details', 'birds'],
             ['big fearless strokes', 'waratah'],
             ['pour it and see what happens', 'hex'],
             ['paint something that makes people smile', 'cat'] ] },
      { q: 'your comfort colour, honestly:',
        a: [ ['deep, quiet teal', 'ocean'],
             ['a red that means it', 'waratah'],
             ['warm terracotta and gold', 'street'],
             ['every colour at once', 'hex'] ] },
      { q: 'what do you want people to say about you?',
        a: [ ['"there\'s more to them than you think"', 'ocean'],
             ['"i noticed every little thing"', 'birds'],
             ['"they made everything feel lighter"', 'cat'],
             ['"unforgettable, honestly"', 'waratah'] ] }
    ];

    let step = 0;
    const score = {};

    const renderQ = () => {
      const item = QUESTIONS[step];
      quizWrap.innerHTML =
        `<div class="quiz-card">
           <p class="kicker">question ${step + 1} of ${QUESTIONS.length}</p>
           <h3 class="display quiz-q">${item.q}</h3>
           <div class="quiz-answers">` +
        item.a.map(([label, key], i) =>
          `<button class="quiz-a" data-key="${key}"><span class="quiz-a-num">${'abcd'[i]}.</span> ${label}</button>`).join('') +
        `</div>
           <div class="quiz-dots" aria-hidden="true">` +
        QUESTIONS.map((_, i) => `<i class="${i < step ? 'done' : i === step ? 'now' : ''}"></i>`).join('') +
        `</div>
         </div>`;

      quizWrap.querySelectorAll('.quiz-a').forEach((b) => {
        b.addEventListener('click', () => {
          const k = b.dataset.key;
          score[k] = (score[k] || 0) + 1;
          step++;
          step < QUESTIONS.length ? renderQ() : renderResult();
        });
      });
    };

    const renderResult = () => {
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      const r = RESULTS[best];
      quizWrap.innerHTML =
        `<div class="quiz-card quiz-card--result">
           <p class="kicker">— your painting</p>
           <div class="quiz-result-grid">
             <div class="quiz-result-img"><img src="${r.img}" alt="${r.title}" /></div>
             <div class="quiz-result-text">
               <h3 class="display">${r.title}</h3>
               <p class="hand quiz-result-line">${r.line}</p>
               <div class="quiz-result-actions">
                 <a class="btn btn--primary btn--sm" href="gallery.html">see it in the gallery</a>
                 <button class="btn btn--ghost btn--sm" id="quizAgain">take it again</button>
               </div>
             </div>
           </div>
         </div>`;
      document.getElementById('quizAgain').addEventListener('click', () => {
        step = 0;
        for (const k in score) delete score[k];
        renderQ();
      });
    };

    renderQ();
  }
})();
