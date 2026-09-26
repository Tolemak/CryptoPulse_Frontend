# CryptoPulse Frontend

Price ticker for [CryptoPulse_BackendDemo](https://github.com/Tolemak/CryptoPulse_BackendDemo): aggregated prices refreshed every 15 s plus a manual refresh button. React + TypeScript + Vite, PL/EN. [crypto-pulse.tolemak.pl](https://crypto-pulse.tolemak.pl/)

[Polska wersja](README.pl.md)

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Needs the backend running; its address goes in `VITE_API_BASE_URL` (`.env`, default `http://localhost:8000`). If the production API origin changes, update `connect-src` in `.htaccess` too.

CI pushes the built `dist/` to the `build` branch, the server deploys from there.
