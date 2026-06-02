# AGENTS.md

<!-- railsmith:start core -->
## Project Overview
- Static browser-only TypeScript app template. `src/app.ts` is the typed source; `public/app.js` is compiled output served with `public/index.html` and `public/global.css`.
- Deploy target is Cloudflare Pages or any static host serving `public/`; no bundler, server runtime, or server functions are part of this repo.

## Commands
- Install dependencies with `npm install`.
- Build with `npm run build` (`tsc`, emits into `public/`).
- Lint/type-check with `npm run lint` (`tsc --noEmit`).
- Test with `npm test` (build first, then `node --test tests/*.test.mjs`).
- For local smoke checks, run `python3 -m http.server 4173 --directory public` after building and open `http://localhost:4173`.

## Architecture Guardrails
- Keep browser logic in `src/app.ts`; do not hand-edit `public/app.js` except as generated build output.
- Keep public deploy assets under `public/`. Cloudflare-specific static routing and headers live in `public/_redirects` and `public/_headers`.
- Preserve the browser-only/static-hosting model. Do not add server routes, server functions, API backends, bundlers, or framework runtime without explicit request.
- Preserve Google Analytics page capture in `src/app.ts` and the script wiring in `public/index.html` unless replacing it with equivalent page analytics capture.
- Avoid leaking implementation/vendor terms into served public copy unless intentional; `tests/app-state.test.mjs` checks selected served files for disallowed provider/tooling terms.

## Testing Guidance
- Add or update `node:test` coverage in `tests/*.test.mjs` for state reducers, persistence parsing, or other exported behavior from `public/app.js`.
- Run `npm test` before finishing changes that affect TypeScript behavior, generated JS, or served public assets.

## Security And Deploy
- Keep static security headers in `public/_headers` when changing deploy assets; review them when adding capabilities that need browser permissions or external resources.
- Do not commit secrets, tokens, private keys, or generated credentials. This template should not require runtime secrets.
<!-- railsmith:end core -->
