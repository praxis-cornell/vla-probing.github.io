# Decoding Task Progress from VLA Representations

Project website. Static HTML/CSS — no build step.

```bash
python -m http.server 8000   # then open http://localhost:8000
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Layout

- `index.html` — the whole site
- `style.css` — all styles; palette documented in `COLOR_SCHEME.md`
- `assets/figures/` — overview figure, logos
- `assets/videos/` — supplementary videos (empty; see the placeholder blocks in `index.html`)

Template adapted from the [PolaRiS website](https://github.com/Edolphin232/vla-decoding.github.io) by Arhan Jain,
itself adapted from VideoMimic.
