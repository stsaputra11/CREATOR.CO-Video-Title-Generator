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


## v33 SEO Revision
- Meta description updated to:
  `CREATOR.CO - Music Video Title Generator, buat judul dan topik cluster untuk video musik channel Youtube jadi lebih praktis.`
- Canonical URL set to:
  `https://creator-co-video-title-generator.vercel.app`
- Open Graph URL updated to canonical.
- Open Graph and Twitter images now use absolute URLs.


## v34 SEO Metadata Additions
- Meta keywords: `ai video title generator, topic content clustering`
- Publisher: `Santanu Saputra`
- hreflang: `id`
- HTML document language: `id`


## v35 Canonical Revision
- Canonical URL updated to `https://creator-co.vercel.app/`
- `og:url` updated to the same URL.
- `hreflang="id"` updated to the same URL.
- Open Graph and Twitter image URLs updated to the new domain.


## v36 Visual Accent Update
- Primary button gradient: `#bf3b3b → #4e278c`
- Application accent updated to the same red-to-purple gradient family.
- Focus, badge, checkbox, and theme accent treatments updated for consistency.
- PWA theme color updated to `#4e278c`.


## v37 Visual / SEO / Copy Revision
- Primary gradient changed to `#604de6 → #4ac0bb`.
- Application accent updated to the same gradient family.
- Added `<meta name="robots" content="index, follow">`.
- Visible H1 changed to `CREATOR.CO` only; page/meta title remains unchanged.
- Visible description changed to `Music Video Title Generator and Topic Cluster`.
- Export button label changed to `Export (.xlsx)`.


## v38 Mobile Result Actions
- Bulk Copy and Export (.xlsx) remain side-by-side on mobile.
- Both buttons use equal-width 2-column layout.
- Mobile spacing and padding adjusted to avoid wrapping.


## v39 Mobile Result Action Fix
- Patched the actual dynamically-rendered Bulk Copy / Export wrapper.
- Forced a true two-column grid at all screen sizes.
- Added compact breakpoints at 480px and 360px.
- Buttons now flex to available width instead of stacking.


## v40 Mobile Button Layout Final Fix
- Fixed actual dynamic Export button ID: `exportResultsBtn`.
- Replaced inline action wrapper with `.result-actions`.
- Bulk Copy and Export (.xlsx) are now forced into equal two-column layout.
- Added compact mobile rules down to 360px.


## v41 Mobile Result Actions Cleanup
- Removed previous conflicting result-action CSS rules.
- Desktop: Bulk Copy and Export (.xlsx) remain side-by-side.
- Mobile (≤640px): buttons stack vertically.
- Both mobile buttons use full width.


## v42 Tablet Action Width Fix
- Tablet breakpoint extended to 900px.
- At 900px and below, Bulk Copy and Export (.xlsx) stack vertically.
- Both buttons are forced to full width.


## v43 Result Button Layout Fix
- Root cause fixed: global `.primary { grid-column:1/-1 }` made Bulk Copy span both columns.
- Desktop: Bulk Copy and Export (.xlsx) now sit side-by-side at equal width.
- Tablet/mobile ≤900px: buttons stack vertically at 100% width.


## v44 Install App Button Accent Fix
- Install App now follows the primary app gradient `#604de6 → #4ac0bb`.
- Hover/focus states match the main button accent system.
- Theme selector styling remains unchanged.


## v45 Permanent Theme Dropdown Contrast Fix
- Theme dropdown options now always use dark text on a white option surface.
- Closed dropdown control still follows Light/Dark/System app theme.
- Rules are isolated from accent-color changes so future visual updates won't reintroduce the bug.


## v46 Unified Gradient System
- Generate SEO Titles and Install App now use the exact same gradient source.
- Gradient: `#604de6 → #4ac0bb`.
- Enforced in Dark and Light themes.
- Same rules apply across mobile, tablet, and desktop.
- App accents reference the same unified start/end colors.


## v47 Theme Dropdown Hard-Lock Fix
- Theme selector now has a stable `#themeSelect` target.
- All dropdown options are forced to dark text on white background.
- Rules are explicitly scoped for Dark and Light modes.
- Added `-webkit-text-fill-color` to prevent Chromium/WebKit theme overrides.
- Checked/disabled option states are also forced readable.


## v48 Final Theme Dropdown Contrast Fix
- Theme selector receives a stable `id="themeSelect"`.
- Each System / Light / Dark option also carries inline dark-text + white-background styling.
- Added final scoped CSS with `color-scheme: light` for native popup options.
- This is intentionally isolated from the app accent/theme palette so future visual changes cannot alter option readability.


## v49 Theme + Reset Fix
- Fixed Light / Dark / System selector after the theme select ID change.
- Theme preference is persisted in localStorage.
- System mode follows OS color-scheme changes.
- Reset button now spans the full row at 100% width.
