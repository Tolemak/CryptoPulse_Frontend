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

Needs the backend running; its address goes in `VITE_API_BASE_URL` (copy `.env.example` to `.env`, it points at `http://localhost:8000`; the build fails when it is unset). The build derives `connect-src` in `dist/.htaccess` from this value automatically.

Prices below $1 are shown with enough decimals for 2 significant digits (so sub-cent coins such as SHIB do not collapse to $0.00); the board cells carry bare numbers because the currency is stated once in its legend.

CI pushes the built `dist/` to the `build` branch, the server deploys from there.
