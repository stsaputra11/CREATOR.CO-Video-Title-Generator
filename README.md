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


## v50 Related Keyword Exact-Uniqueness Guard
- Related Keyword is rejected if it equals Main Keyword after normalization.
- Related Keywords are unique against one another after normalization.
- Equality check ignores capitalization, repeated spaces, and punctuation separators.
- Existing semantic near-duplicate protection remains active.
- A final safety filter runs before saving the 9 Related Keywords.


## v51 Copy Revision
- Changed visible label from `AI Mood / Scenario` to `Mood / Scenario`.
- Generator logic remains unchanged.

## v52 Niche / Use Case Update
- Updated niche groups and use-case groups.
- Added Spa / Relaxation / Massage / Meditation.
- Removed standalone Focus.
- Updated Cinematic hooks and Additional variations labels.


## v53 Niche Dropdown UI Fix
- Patched the actual `#niche` select markup.
- Updated visible niche options to the new grouped values.
- Removed the old plain Lofi / Piano / Lullaby / Tibetan Flute options.

## v54 Use Case Reset
- Use Case: Study, Work, Relax, Focus, Sleep only.
- Related Keywords block terms from other use cases.


## v55 Related Keyword Strategy Revision
- Removed hard conflict guard between use cases.
- Related Keywords now prioritize Main Keyword first.
- Selected Use Case is used as a soft context signal to expand keyword variations naturally.
- Existing uniqueness and Main Keyword exact-duplicate protections remain active.

## v56 Context Compatibility Guard
- Related Keywords reject opposing activity contexts inside the same phrase.
- Current incompatible pairs: Sleep+Focus, Sleep+Study, Sleep+Work.
- Example rejected: `rain sleep focus beats`.
- Main Keyword + Use Case remain the primary generation signals.


## v57 Title Context Compatibility
- The same opposing-context filter used by Related Keywords is now applied to generated titles.
- Titles containing Sleep+Focus, Sleep+Study, or Sleep+Work are rejected.
- Final safety filtering runs before titles are displayed.
- Relax + Focus remains allowed.

## v58 Friendly Generation Warning
- Added a user-friendly warning when Related Keywords or Titles cannot be generated.
- Message explains that Main Keyword and Use Case may have conflicting context.
- Removed the technical `Generator error:` prefix for this case.

## v59 Main Keyword × Use Case Pre-validation
- Added validation before Related Keyword and Title generation.
- Conflicting Main Keyword + Use Case combinations are blocked immediately.
- Examples blocked: `sleep rain lofi` + Focus, `deep focus music` + Sleep.
- Compatible combinations continue to generate normally.

## v60 Warning Auto-scroll
- Conflict warnings now auto-scroll to Video SEO Input.
- Scroll position accounts for sticky/fixed header height.
- Added a 16px visual gap and scroll-margin fallback so the target is not covered.

## v61 Unified Input Context Validation
- Context validation now checks Cluster + Main Keyword + Use Case together.
- Conflicting activity intent spread across different fields is blocked.
- Example blocked: Cluster `sleep rain` + Main Keyword `focus music`.
- Existing sticky-header-safe warning auto-scroll remains active.

## v62 Description Hashtags Ranking
- Description Hashtags are now ranked by Main Keyword relevance.
- Added social/YouTube familiarity heuristics for music-related hashtag phrasing.
- Added viral-potential heuristics based on concision, readability, familiarity, and intent.
- Generic spam tags such as #viral / #fyp / #trending are penalized unless truly relevant.
- Output remains capped at 5 hashtags.
- No fabricated search-volume data is used.

## v63 Meta Tag Keywords Ranking
- Meta Tag Keywords now use a dedicated ranking system independent from Description Hashtags.
- Ranking factors: Main Keyword relevance, YouTube search-intent heuristic, selected niche/use-case relevance, concision, and viral-potential heuristic.
- Main Keyword remains included.
- Output capped at 10 prioritized keywords.
- No fabricated search-volume data is used.

## v64 Meta Tag Syllable Priority
- Meta Tag Keywords now prioritize candidates with an estimated maximum of 4 syllables.
- <=4 syllable phrases are ranked ahead of longer candidates.
- Longer keywords remain eligible only when their relevance/search-intent score is strong.
- Main Keyword is still preserved even when longer than 4 syllables.

## v65 Meta Tag Word-count Priority
- Corrected Meta Tag Keywords priority from syllables to words.
- Keywords with 1–4 words are prioritized.
- Keywords longer than 4 words remain eligible only when strongly relevant.
- Main Keyword is still preserved even when longer than 4 words.

## v66 Meta Tag Hard 4-word Limit
- Meta Tag Keywords now have a hard maximum of 4 words.
- Candidates longer than 4 words are rejected before ranking.
- A final safety filter enforces the same limit before output.
- Main Keyword is included only if it is 4 words or fewer.

## v67 PWA Theme Color Repair
- Restored missing manifest.json and sw.js.
- Android/PWA theme color: #4ac0bb.
- HTML meta theme-color synchronized to #4ac0bb.
- Service worker cache version bumped to v67.
- Restored required PWA icon files and Vercel headers.
- Android status bars do not support CSS gradients; the teal endpoint of the app gradient is used as the solid system color.

## v68 Restore Original CREATOR.CO Icons
- Restored the exact user-provided 192x192 and 512x512 CREATOR.CO icons.
- Favicon, Apple touch icon, and PWA manifest now reference these restored assets.
- Service worker cache bumped so installed PWAs can refresh the icons.

## v69 Header Brand Logo
- Added a small CREATOR.CO logo to the left of the H1 title.
- Uses the same original 192x192 brand icon as favicon/PWA.
- Responsive sizing added for mobile and desktop.

## v70 Header Logo Reliability Fix
- Header H1 logo now uses an embedded data URL to prevent broken-image/404 issues.
- Original user-provided CREATOR.CO icon is preserved exactly.
- PWA/favicon icon file remains included in /icons.
- Service worker cache bumped to v70.

## v72 Safe Validation Scroll Fix
- Rebased from stable v70.
- Validation auto-scroll is handled only in run() after validate() returns null.
- Existing validate() logic is left untouched.
- Generate, Regenerate, Reset, Theme, and PWA handlers remain unchanged from v70.

## v73 Header Cleanup
- Removed the Install App button from the header.
- PWA manifest/service worker support remains intact.
- Theme selector and branding remain unchanged.

## v74 Install Button Hard Removal
- Removed all Install App button markup.
- Removed JavaScript references that could recreate/show it after theme changes.
- Removed beforeinstallprompt/appinstalled UI handlers.
- Added defensive CSS to force-hide any stale cached install button DOM.
- PWA manifest/service worker remain intact.

## v75 Teal Accent Unification
- Replaced remaining purple accent #604de6 with #4ac0bb.
- Accent text, focus ring, and action styling now use teal.
- Gradient variables are now teal-only for a consistent visual system.
- PWA theme_color remains aligned to #4ac0bb.

## v76 Unified Green–Teal Gradient
- Updated primary button gradient to #15a36d → #4ac0bb.
- Hover gradient: #12885c → #3aa9a5.
- Applied consistently across desktop, tablet, mobile, dark mode, light mode, and PWA.
- PWA theme_color remains aligned to #4ac0bb.
