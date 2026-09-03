# CREATOR.CO Video Title Generator v16 — Vercel PWA

Upload ALL files/folders in this package to the root of your GitHub repository:

- index.html
- manifest.json
- sw.js
- vercel.json
- icons/
  - icon-192.png
  - icon-512.png
- pwa-check.html

Do NOT upload only index.html.

After Vercel deploy:
1. Open `https://YOUR-DOMAIN/manifest.json` — must return JSON, HTTP 200.
2. Open `https://YOUR-DOMAIN/sw.js` — must return JavaScript, HTTP 200.
3. Open `https://YOUR-DOMAIN/icons/icon-192.png` — must show the icon.
4. Open `https://YOUR-DOMAIN/pwa-check.html` — all checks should be green.
5. In Chrome desktop: DevTools → Application → Manifest and Service Workers.
6. Hard reload once after redeploying, because an older service worker can be cached.

iPhone/iPad:
Safari does not rely on the Chromium beforeinstallprompt flow. Use Share → Add to Home Screen.


## v17 Branding Update
- Browser favicon replaced with the supplied CREATOR.CO logo.
- PWA 192x192 icon replaced.
- PWA 512x512 icon replaced.
- Apple touch icon uses the CREATOR.CO logo.
- Service worker cache version bumped so the new icon is refreshed after redeploy.


## v18 UI / Branding Update
- Fixed theme dropdown option contrast in dark mode.
- App name: CREATOR.CO - Music Video Title Generator
- Description: Generator Judul Video Musik dengan Topik Cluster Berbasis SEO
- Footer: © 2026 Created by Santanu Saputra
- PWA manifest metadata updated.
- Service worker cache bumped to v18.


## v19 Regenerate Fix
- Regenerate Keywords now produces a new Related Keywords set.
- Regenerate Atmosphere now produces a new Atmosphere / Vibes set.
- Regenerate All now rebuilds Related Keywords, Mood / Scenario, Emotional Keywords, Atmosphere / Vibes, and Titles.
- Regenerate Titles only changes title combinations while preserving current keyword/atmosphere data.
- Added internal variation seeds so regeneration does not simply render the same list again.


## v20 Layout Update
- Removed the left-panel Export Spreadsheet button.
- Export remains available in the generated-results area.
- Reset button moved to a centered bottom row.


## v21 Checkbox UI Update
- Atmosphere checkbox labels are vertically aligned with the checkbox.
- Added clearer spacing between the checkbox square and the label text.
- Increased checkbox size consistency across browsers.


## v22 Checkbox Alignment
- Checkbox and atmosphere phrase use a strict horizontal two-column grid.
- Checkbox stays on the left.
- Label stays on the right.
- Fixed 12px horizontal spacing between checkbox and phrase.


## v23 Checkbox Layout Fix
Root cause fixed:
- Global `.field label { display:block; }` was overriding the checkbox row layout.
- Atmosphere options now use `.field label.check-item { display:flex; flex-direction:row; }`.
- Checkbox is locked to the left at 16x16 px.
- Text stays to the right with a 12 px gap.


## v24 Clean Text Input
- Cluster and Main Keyword are always normalized to lowercase.
- Paste uses text/plain only; rich-text formatting is discarded.
- Extra spaces and invisible zero-width characters are removed.
- Unicode is normalized with NFKC.
- Validation also re-cleans both fields as a final safeguard.


## v25 Input Normalization Correction
- Cluster and Main Keyword are converted to lowercase only.
- Paste still uses plain text only.
- Spaces are fully allowed.
- Multiple spaces are preserved.
- Punctuation, symbols, slashes, dashes, and other characters are preserved.
- Caret position is preserved while typing.


## v26 Bulk Copy
- Renamed `Copy All Key Output` to `Bulk Copy`.
- Bulk Copy now copies:
  - Recommended Title
  - All Alternative Titles
  - Meta Tag Keywords
  - Description Hashtags


## v27 Auto Scroll
- Clicking Generate SEO Title automatically scrolls the page to the top.
- Uses smooth scrolling for a cleaner transition.


## v28 Result Auto Scroll
- Auto-scroll target changed from page top to the `Keyword Analysis` section.
- Applied to Generate SEO Title.
- Applied to Regenerate Keywords.
- Applied to Regenerate Atmosphere.
- Applied to Regenerate Titles.
- Applied to Regenerate All.
- Uses smooth scroll for desktop and mobile.


## v29 Reliable Keyword Analysis Auto Scroll
- Target is exactly `div.kicker#keywordAnalysis`.
- Scroll no longer fires before generation.
- Scroll fires after `render(v)` completes.
- Uses two animation frames so the newly rendered output is laid out before scrolling.
- Applies consistently to Generate SEO Titles and every Regenerate action because all actions flow through `run()`.
- Added `scroll-margin-top` for cleaner positioning.


## v30 Sticky Header Scroll Offset
- Auto-scroll still targets exactly `div.kicker#keywordAnalysis`.
- Scroll position now subtracts the detected sticky/fixed header height.
- Added a 16px visual gap below the sticky menu.
- Added a 140px `scroll-margin-top` fallback for browsers/layouts where header detection differs.
- Applies to Generate and all Regenerate actions because scrolling still happens after render.


## v31 Atmosphere Update
- Added `rain` to Atmosphere / Vibes.
- Minimum selection is now 1 option.
- Maximum selection remains 5 options.
- Added dedicated rain atmosphere phrases.


## v32 SEO Metadata
- Added meta description: `Generator Judul Video Musik dengan Topik Cluster Berbasis SEO`
- Added canonical URL using root path `/`.
- Added Open Graph metadata for social sharing.
- Added Twitter Card metadata.
- Social preview image uses `/icons/icon-512.png`.

Note: after a final custom domain is chosen, replacing relative canonical/OG URLs with absolute URLs is recommended for strongest SEO/social compatibility.
