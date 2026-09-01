# CREATOR.CO Video Title Generator v15 PWA

PWA features:
- Installable on desktop and supported phones
- Standalone app window
- Offline caching via Service Worker
- App manifest
- CC icons (192x192 and 512x512)
- In-app Install App button when browser exposes the install prompt

Important:
PWA installation does NOT work when opening `index.html` directly with `file://`.
Serve the folder via HTTPS, or use localhost.

Quick local test:
`python -m http.server 8080`
Then open:
`http://localhost:8080`

For normal use, deploy the folder to an HTTPS host such as GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your own web server.
