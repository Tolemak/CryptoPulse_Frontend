# CryptoPulse — Frontend

[Wersja polska](README.pl.md)

A ticker UI for [`CryptoPulse_BackendDemo`](https://github.com/Tolemak/CryptoPulse_BackendDemo):
live aggregated crypto prices across Binance, Kraken, and Coinbase, with a
manual refresh button. PL/EN.

Vite + React 19 + TypeScript. Polls `GET /api/prices` every 15s;
`POST /api/prices/refresh` for a manual re-poll (rate-limited server-side to
once per 60s). When a poll fails, the last prices stay on screen, marked with
the time they were loaded.

## Running it

Requires the backend running locally, with CORS allowing this app's origin.

```bash
npm install
npm run dev
```

`VITE_API_BASE_URL` (in `.env`) points at the backend — defaults to
`http://localhost:8000`. `.env.production` holds a placeholder for the
deployed API origin.

## Build & deploy

```bash
npm run lint
npm run build
```

`dist/` pushed to a `gh-pages` branch by CI, served statically — see
`.github/workflows/deploy.yml`. `.htaccess` (copied into `dist/`) sets the
security headers, CSP included — its `connect-src` must match
`VITE_API_BASE_URL`.
