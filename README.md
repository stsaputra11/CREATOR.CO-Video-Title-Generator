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
