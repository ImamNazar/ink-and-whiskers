# The Living Sketchbook — design and implementation plan

## North star
Keep the paintings legible and central. Motion is a layer of atmosphere, never a prerequisite for understanding or navigating.

## Shipped in this draft branch
1. **Layered parallax:** small decorative hero shapes translate gently on desktop scroll; no content text is moved.
2. **Cinematic gallery:** existing accessible lightbox receives painting-specific ambient colour without filtering the original image.
3. **Animated typography:** one-time heading reveal with IntersectionObserver and the Web Animations API.
4. **Draggable artwork wall:** existing drag-to-scroll easel is retained; keyboard arrows and mobile scroll snapping are added.
5. **Liquid ink graphics:** CSS-generated organic two-colour ink composition on the new artist's desk, avoiding heavyweight WebGL.
6. **Wandering cat:** existing scroll-triggered peek is retained; a keyboard-accessible studio-cat button offers optional playful notes.
7. **Artistic transitions:** existing ink-wipe navigation remains; no new animation library.
8. **Interactive artist's desk:** palette buttons update the ink illustration, colour label and pressed states.

## Guardrails
- No new dependencies or external animation services.
- Reduce motion: no heading/parallax/cat movement; existing site styles also disable many transitions.
- Touch: native horizontal scrolling, not global scroll hijacking.
- Accessible controls: semantic buttons, accessible names, aria-pressed and aria-live.
- Performance: requestAnimationFrame scroll batching; decorative effects only on desktop fine pointers.

## Before merge
- Browser-test on iPhone-width (320/375/430), tablet (768), desktop (1280+).
- Verify lightbox image, caption, colour transitions, keyboard trap and Escape.
- Check page transitions and navigation across all four pages.
- Check prefers-reduced-motion and keyboard-only use.
- Check console errors, network requests and Core Web Vitals.
- Add the two new paintings once binary image upload is supported.

Do not merge or deploy until these checks are complete.
