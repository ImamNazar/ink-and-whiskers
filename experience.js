/* The Living Sketchbook — progressive, dependency-free enhancements */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const motionOK = () => !reduced.matches;
  const desktopMotion = () => motionOK() && fine.matches && innerWidth > 800;

  // Animated headings: visible by default; only animate with browser support.
  if (motionOK() && 'IntersectionObserver' in window) {
    const headings = document.querySelectorAll('.section-head .display, .easel-head .display, .play-head .display, .page-hero .display, .manifesto .display');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{opacity:.65, transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.2,.6,.2,1)'});
      observer.unobserve(entry.target);
    }),{threshold:.15});
    headings.forEach(h => observer.observe(h));
  }

  // Parallax only on fine-pointer desktop; no scroll hijacking or layout movement.
  const layers = Array.from(document.querySelectorAll('.hero-art .float-hex, .hero-art .float-blob'));
  let queued = false;
  const updateLayers = () => {
    queued = false;
    if (!desktopMotion()) { layers.forEach(el => el.style.removeProperty('--drift-y')); return; }
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const progress = Math.max(-1, Math.min(1,(innerHeight / 2 - rect.top - rect.height / 2)/innerHeight));
    layers.forEach((el,i) => el.style.setProperty('--drift-y', (progress * (i+1) * 13).toFixed(1)+'px'));
  };
  addEventListener('scroll', () => { if (!queued) {queued=true;requestAnimationFrame(updateLayers);} }, {passive:true});
  addEventListener('resize', updateLayers, {passive:true});
  reduced.addEventListener('change', updateLayers);
  updateLayers();

  // Artwork lightbox ambient colour; the original artwork stays unfiltered.
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const palettes = ['#3c564c','#b2764a','#2d536b','#9e455d','#48687d','#397f7c','#b56c4d','#7d9c91','#9e5263','#577d9b','#bc7455','#648a67','#607d8d','#c49c6d','#9c6b4c','#648eb4','#527a66'];
    const observer = new MutationObserver(() => {
      if (!lightbox.classList.contains('is-open')) return;
      const num = parseInt(document.getElementById('lbNum')?.textContent.replace(/\D/g,'') || '1',10);
      lightbox.style.setProperty('--art-ambient',palettes[(num-1)%palettes.length]);
    });
    observer.observe(lightbox,{attributes:true,attributeFilter:['class']});
    const num = document.getElementById('lbNum');
    if (num) observer.observe(num,{childList:true});
  }

  // A small colour playground: tap swatches to change the ink illustration.
  const desk = document.getElementById('artistsDesk');
  if (desk) {
    const canvas = desk.querySelector('.desk-ink');
    const label = desk.querySelector('.desk-color-name');
    const buttons = Array.from(desk.querySelectorAll('[data-ink]'));
    const choose = button => {
      buttons.forEach(b => b.setAttribute('aria-pressed',String(b===button)));
      canvas.style.setProperty('--ink-one',button.dataset.ink);
      canvas.style.setProperty('--ink-two',button.dataset.inkTwo);
      label.textContent = button.dataset.name;
      if (motionOK()) canvas.animate([{transform:'scale(.96) rotate(-2deg)',opacity:.7},{transform:'scale(1) rotate(0)',opacity:1}],{duration:450,easing:'ease-out'});
    };
    buttons.forEach(button=>button.addEventListener('click',()=>choose(button)));
    if (buttons[0]) choose(buttons[0]);
  }

  // Cat: optional, keyboard accessible discovery; never interrupts content.
  const cat = document.getElementById('sketchCat');
  const catNote = document.getElementById('sketchCatNote');
  if (cat && catNote) {
    const notes = ['the cat approves of this colour.','a little whisker of encouragement.','art looks better with a curious cat.','a tiny studio supervisor says hello.'];
    let index=0;
    cat.addEventListener('click',()=>{
      catNote.textContent=notes[index++ % notes.length];
      catNote.hidden=false;
      if (motionOK()) cat.animate([{transform:'rotate(-8deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0deg)'}],{duration:420});
    });
  }

  // Stop carousel auto-drift when users focus it; support keyboard arrow scrolling.
  const track = document.getElementById('easelTrack');
  if (track) {
    track.addEventListener('keydown',e=>{
      if (e.target !== track || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*Math.min(320,track.clientWidth*.75),behavior:motionOK()?'smooth':'instant'});
    });
  }
})();