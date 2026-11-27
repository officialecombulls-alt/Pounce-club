# Reference design tokens (reference/source.html)

Source of truth: `reference/source.html`. Screenshots: `ref-1440.png`, `ref-768.png`, `ref-390.png`.
Ported to `app/styles/lp.css`, scoped under `.lp`.

| Token | Value |
|---|---|
| Font | Inter variable (wght 100–900, opsz 14–32), self-hosted as `public/fonts/inter-latin.woff2` (Latin subset) |
| `--red` (accent, CTA, selected pack) | `#b3122a` |
| `--ink` (text, promo bar) | `#121212` |
| `--muted` | `#555` |
| `--line` (borders) | `#d8d8d8` |
| Band background | `#f7f7f7` |
| Media frame background | `#efefef` (gallery), `#e9e9e9` (demo), `#eaeaea` (kit) |
| Content width | `min(1200px, 100% − 80px)`; phone `100% − 32px` |
| Breakpoints | 760px (phone), 370px (small phone) |
| H1 | clamp(2.3rem, 4vw, 3.25rem) / 700 / lh 1.03 / ls −.055em; phone 2.35rem |
| H2 | clamp(2rem, 3.9vw, 3.5rem) / 700; intro H2 clamp(2rem, 4.4vw, 3.875rem) |
| Eyebrow (`.category`) | .75rem / 700 / ls .13em / uppercase / red |
| Section padding | clamp(40px, 5.5vw, 78px) |
| Radii | frames 10px, pack options + CTA 7px, view buttons 5px |
| CTA | 48px min height, red, white 700 text |
| Gallery frame ratio | 1.18 desktop, 1.85 phone; split frames 1.62 / 1.75 |
