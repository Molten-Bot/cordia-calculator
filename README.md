# Cordia Web Blank

Static browser-only web app template for fast downstream customization.

## Structure

- `public/index.html` - app markup and deploy entry point
- `public/global.css` - global styling
- `src/app.ts` - typed browser-only application source
- `public/app.js` - compiled browser application logic
- `public/_redirects` - Cloudflare Pages SPA fallback
- `public/_headers` - basic static security headers

## Run locally

Install dependencies, compile TypeScript, then serve the `public` folder with any static file server:

```sh
npm install
npm run build
python3 -m http.server 4173 --directory public
```

Then open `http://localhost:4173`.

## Deploy on Cloudflare Pages

Use these project settings:

- Build command: `npm run build`
- Build output directory: `public`

This template does not require bundling or server functions.
