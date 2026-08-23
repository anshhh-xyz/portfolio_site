# Portfolio Site — Round 1 Review

Repo: `anshhh-xyz/portfolio_site` (branch `main`, commit `36d4c16`)
Scope: `index.html`, `style.css`, `js/**`

A note before the list: the repo's last two commits are `remove demo videos and gltf 3d asset` and `ignore video and 3d model binaries in .gitignore`. So right now there is **no Three.js / GLTF robot anywhere in this repo** — no `<canvas>`, no loader, no reference in any JS file. If that's intentional (moved to a leaner hero), ignore this note. If it's meant to still be there, it's effectively "bug #0" — the centerpiece got dropped along with the binary asset and never re-added in a lighter form.

---

## 🔴 Critical / Functional Bugs

### 1. Resume download link is broken (404)
`index.html` — `<a href="resume.pdf" class="hero-btn hero-btn-ghost" download>`
There is no `resume.pdf` in the repo at all. The "pip install resume.pdf" button currently does nothing but fail silently (browser just does nothing or shows a broken download). This is one of two primary CTAs in the hero — worth fixing first.

### 2. Clicking the nav logo does nothing
`js/navigation.js`, lines 52–70 + `index.html` line 38
`navLinks` is `document.querySelectorAll(".rail a")`, which also grabs `.rail-brand` (the "Ansh_Portfolio.py" logo link). But the brand `<a>` has no `data-target` attribute. The click handler does:
```js
e.preventDefault();
const targetId = link.dataset.target; // undefined for the brand link
const targetSec = document.getElementById(targetId); // null
if (targetSec) { ... } // never runs
```
So `preventDefault()` fires (killing the native `#hero` jump) but nothing replaces it — clicking your own name/logo is a dead click. Either give the brand link `data-target="hero"` or exclude it from the `navLinks` query.

### 3. Logo text disappears entirely on mobile (CSS specificity bug)
`style.css` — inside `@media (max-width: 900px)`, line ~1301:
```css
.rail a span { display: none; }
```
This selector (`.rail` class + `a` + `span`, specificity 0,1,2) beats `.rail-brand-hash { display: inline-block; }` (specificity 0,1,0). Since `.rail-brand-tag`/`.rail-brand-name`/`.rail-brand-suffix`/`.rail-brand-hash` are all `<span>`s nested inside `.rail-brand` (which is an `<a>` inside `.rail`), they all get caught by this rule too. Net effect: on every viewport ≤900px, the entire "Ansh_Portfolio.py" wordmark is invisible — the fix at line 1270 that shrinks `.rail-brand-tag`'s font-size never gets a chance to render, because the text is `display:none`. Likely fix: scope the hiding rule to nav-item spans specifically (e.g. `.rail ol a span`) instead of all `.rail a span`.

### 4. `aria-controls` points to a non-existent element
`index.html`, skills tabs (lines 239–246):
```html
<button ... aria-controls="skills-panel">Languages</button>
```
There is no element with `id="skills-panel"` anywhere on the page — the actual panels are `id="skills-panel-0"` and `id="skills-panel-1"` (used for the cross-fade sweep transition). Screen readers relying on `aria-controls` get a broken reference. Either drop `aria-controls` here or point it at both panel IDs / update it dynamically in `skills.js` when the active slot changes.

---

## 🟠 High-Priority Issues

### 5. GSAP/ScrollTrigger/Lenis block initial render
`index.html`, lines 15–17 — these three `<script>` tags in `<head>` have **no `defer`**, unlike every local script at the bottom of `<body>`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
```
These block HTML parsing until each downloads and executes, directly delaying first paint. Adding `defer` to all three is safe here — deferred scripts execute in document order regardless of `<head>` vs `<body>` placement, so `main.js`'s `typeof gsap !== "undefined"` checks will still pass.

### 6. Contact form has no real fallback — it's `mailto:` only
`js/components/contact.js`, lines 40–46
The terminal "transmit_payload.sh" form shows a `[SUCCESS]` message and then just does `window.location.href = "mailto:..."`. If the visitor has no default mail client configured (very common — webmail users, most mobile browsers without a set default app), nothing happens after that "success" message, and the message is lost with no error shown. Worth wiring this to a real backend (Formspree, EmailJS, a small serverless function) so the "success" state is actually true, with `mailto:` as a secondary option rather than the only path.

### 7. Motion-reduction support is inconsistent
`prefers-reduced-motion` is only checked in two files (`navigation.js`, `smooth-scroll.js`). Everything else ignores it entirely and always animates:
- `js/effects/asciify.js` — glitch/decode animation always plays on hover + scroll-into-view.
- `js/effects/space.js` — starfield/meteor canvas loop, no check at all.
- `js/effects/ascii-sweep.js` — WebGL sweep transitions.
- `js/effects/cursor.js` — custom cursor lerp animation.
- `js/main.js` — all GSAP `ScrollTrigger` entrance animations.
- `style.css` — no `@media (prefers-reduced-motion: reduce)` block exists at all.

For someone who's set the OS-level reduce-motion preference, this is a real accessibility gap. Recommend a single shared `prefersReducedMotion` check (e.g. attach `data-reduced-motion` to `<html>` once and gate the heavier effects/CSS off of it) rather than re-checking `matchMedia` ad hoc per file.

### 8. Starfield background never pauses, never debounces
`js/effects/space.js`
- The `requestAnimationFrame` loop (`spaceLoop`, line 184) runs forever with no `document.visibilitychange` pause — it keeps drawing (and costing battery/CPU) even when the tab is backgrounded or the window is minimized.
- The `resize` listener (line 171) has no debounce, so during a manual window resize/drag it fully rebuilds the entire star array (`starCount` new `Star` objects) on every single `resize` event fired, which can be dozens of times a second. Contrast this with the debounced resize logic already used elsewhere in the project (e.g. nav/breakpoint handling) — this file is the odd one out.

---

## 🟡 Medium — Content / UX

### 9. "Live Demo" links that aren't demos
- **DetectIQ** (`index.html` ~line 289): the "Live Demo" icon links to `https://github.com/anshhh-xyz/DetectIQ#demo` — a GitHub README anchor, not a deployed app. If that anchor doesn't exist in the README, it just lands on the repo root with no scroll.
- **AutoExpense** (~line 459): same pattern — `.../AutoExpense#architecture`, labeled "Live Demo / Specs" in the `title` attribute. Mixing "Live Demo" language with what's actually documentation is a bit misleading; consider relabeling these to "Docs" / "Architecture" so the icon/tooltip sets accurate expectations.
- **Lagom** (~line 403): the second link goes to the generic `https://huggingface.co/datasets` homepage rather than anything Lagom-specific — reads like a placeholder that never got swapped for the real dataset URL.

### 10. Leftover placeholder copy in production content
`index.html` ~line 177, About → Key Achievements:
```html
<li>...<strong>Hackathon wins:</strong> still loading... ⚡</li>
```
"still loading…" reads like a TODO that shipped. Either fill it in with a real line (or remove the "wins" framing if there aren't any yet) — right now it's the kind of thing a recruiter skimming the page will notice.

### 11. `deployment` skills tab is thin
`js/data/skills-data.js`, line 30 — the `deployment` category has exactly one entry (Vercel), while the other three tabs have 4–8. Given the fancy per-tab sweep transition this section is built around, one card in a tab feels unfinished. Natural additions given the rest of the stack described elsewhere on the page: Docker, AWS, GitHub Actions, Supabase Edge Functions (already mentioned in the Attendily project copy), Railway/Render.

---

## 🟢 Low — Polish / Hardening

### 12. No favicon, no social preview tags
`index.html` `<head>` has no `<link rel="icon">`, no `<meta name="description">`, and no Open Graph / Twitter Card tags (`og:title`, `og:image`, etc.). Right now sharing the link on LinkedIn/X/Slack/iMessage will show a bare title with no preview image or description — a missed opportunity for a portfolio whose whole point is to be shared.

### 13. No `robots.txt` / `sitemap.xml`
Minor, but standard practice for discoverability if this is meant to be indexed by search engines.

### 14. Missing `preconnect` for cdnjs.cloudflare.com
`index.html` preconnects to `fonts.googleapis.com`, `fonts.gstatic.com`, and `cdn.jsdelivr.net`, but GSAP + ScrollTrigger are loaded from `cdnjs.cloudflare.com` with no matching preconnect — one more DNS/TLS round trip than necessary on a render-blocking resource (see #5).

### 15. No Subresource Integrity (SRI) on third-party scripts
GSAP, ScrollTrigger, Lenis, and the Departure Mono font are all pulled from third-party CDNs with no `integrity`/`crossorigin` hash. Low risk in practice, but cheap to add and standard hardening for anything render-blocking or executable.

### 16. Departure Mono is served from an unofficial GitHub mirror
`style.css` line 23: `https://cdn.jsdelivr.net/gh/projectnoonnu/2409-1@1.0/DepartureMono-Regular.woff2`. This is someone's personal GitHub repo proxied through jsDelivr's `/gh/` endpoint, not an official font CDN/npm package. If that repo is ever deleted, renamed, or made private, every heading on the site silently falls back to JetBrains Mono. Worth self-hosting the `.woff2` file instead (a few KB, one-time download) to remove that single point of failure.

### 17. `ResizeObserver` in the project-card pixel effect uses stale dimensions
`js/components/projects.js`, lines 178–181:
```js
const ro = new ResizeObserver(() => {
  initPixelGrid(width / 2, height / 2); // width/height are the OLD values here
});
```
`initPixelGrid()` recalculates `width`/`height` from `getBoundingClientRect()` *inside* itself, but the origin point passed in is computed from the closure's pre-resize `width`/`height`. Cosmetically minor (just makes the dissolve-effect origin briefly off-center right after a resize), but worth passing `undefined` (which already defaults to centered) or recalculating the rect first.

### 18. Shared class name `about-terminal` reused across unrelated sections
`index.html` line 190 (About section terminal) and line 636 (Contact section's `bento-terminal`) both carry the class `about-terminal`. It works today because the styles happen to be compatible, but the name is misleading for future maintenance — a change scoped "for the about-page terminal" could unexpectedly hit the contact form terminal too. Consider a neutral shared name like `.terminal-card` with section-specific modifier classes.

### 19. Email is plain-text in the DOM
`index.html` line 708 — `anshhh.xyz@gmail.com` appears verbatim in markup (plus the `mailto:` href). Fine for a portfolio, but trivially scrapeable by bots. Not worth heavy obfuscation, but something like building it from two data attributes at runtime would cut down on casual scraping if spam becomes a problem.

---

## Quick-Win Priority Order

If tackling a subset first, this order gives the most visible impact for the least effort:

1. Fix the mobile logo disappearing (#3) — one-line CSS selector fix.
2. Fix the broken resume link (#1) — add the file or remove the `download` CTA.
3. Fix the dead logo click (#2) — add `data-target="hero"`.
4. Add `defer` to the three head scripts (#5) — free performance win.
5. Fix `aria-controls` (#4) — quick accessibility fix.
6. Decide on the contact form's real delivery mechanism (#6) — biggest UX risk since it's the "hire me" conversion point.
