# ink & whiskers

A small, hand-built personal gallery site for [@ink_n_whiskers](https://www.instagram.com/ink_n_whiskers/) — a static site, no build step, no backend. Just paint, type, and a little hex-shaped joy.

Now a **four-page site** with an interactive play studio.

![preview](images/stained-glass-birds.jpg)

## What's inside

```
ink-and-whiskers/
├── index.html       ← home: hero, "fresh off the easel", three doors
├── gallery.html     ← all 17 paintings · filters · lightbox with arrows
├── artist.html      ← about thabu, process, moments, palette
├── play.html        ← the play studio (4 interactive activities)
├── styles.css       ← all the styles, one file
├── script.js        ← shared: cursor, nav, reveals, lightbox, transitions
├── play.js          ← the play studio activities
├── images/          ← her artwork + photos
└── README.md
```

No frameworks. No `npm install`. Open `index.html` in a browser and it works.

## The play studio (play.html)

Four small activities to get visitors falling in love with art:

1. **Pour a hexagon** — a real-maths ink-marbling toy. Tap to drop paint, drag the comb to swirl it, pick from five of her palettes, and download your pour as an image.
2. **The colour of your day** — pick a feeling, get a named five-swatch palette. Tap a swatch to copy its hex code.
3. **The prompt jar** — shake the jar, pull a painting prompt on a little paper slip.
4. **Which painting are you?** — a five-question quiz that matches you to one of the paintings.

## Hosting it on GitHub Pages

1. **Replace the files in your repo** with everything in this folder (keep the same repo, `ink-and-whiskers`).
   ```bash
   git add .
   git commit -m "v2: multi-page + new paintings + play studio"
   git push
   ```
2. Pages is already on, so the site updates itself at
   `https://<your-username>.github.io/ink-and-whiskers/` within a minute or two.
   (Hard-refresh with Ctrl/Cmd+Shift+R if the old CSS is cached.)

## Making it her own

Everything is plain HTML — save, refresh, done.

### Add a new artwork
1. Drop the image into `images/`.
2. In `gallery.html`, copy any `<figure class="art …">` block, give it the next `data-id` and `id="pN"`, and set the image + title. Add `is-new` to the class list to give it the pink "new" drop.
3. In `script.js`, add a matching entry to `ART_DATA` (title, caption, meta) — that's what the lightbox shows.
4. (Optional) add a card for it in the "fresh off the easel" strip in `index.html`, linking to `gallery.html#pN`.

### Update captions
`script.js` → `ART_DATA` near the top. **Note:** the captions for the new pieces (ids 8–17) are written in her voice as placeholders — swap in her real Instagram captions when you get a chance.

### Edit the prompts / quiz / mood palettes
All in `play.js` — the `PROMPTS`, `QUESTIONS`/`RESULTS`, and `MOODS` blocks are plain text, easy to rewrite.

### Change the colour palette
`styles.css` → the variables at the top (`--paper`, `--ink`, `--teal`, `--rose`…). The whole site re-tints itself.

## Design notes

- **Typography:** Fraunces (variable display serif), Newsreader (editorial body), Caveat (the hand-written bits).
- **Palette:** pulled directly from her paintings — deep teal, magenta rose, warm gold, emerald, blush, ink black.
- **Motifs:** hexagons throughout — the pour toy literally pours into one.
- **Interactions:** ink-drop entry, ink-wipe page transitions, drag-to-scroll easel strip with gentle auto-drift, paint-dot cursor, hex scroll progress, filterable gallery with keyboard-friendly lightbox (← → to browse), a cat that peeks in halfway down every page.
- **Responsive & accessible:** works on phones through big screens, honours `prefers-reduced-motion`, visible focus states, alt text on every artwork.
- **Performance:** vanilla JS only, compressed images, lazy-loading below the fold.

## Credits

Artwork © Thabu Jacob (@ink_n_whiskers). Site built with care.
