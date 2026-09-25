# CryptoPulse — Frontend

[English version](README.md)

Interfejs-ticker dla [`CryptoPulse_BackendDemo`](https://github.com/Tolemak/CryptoPulse_BackendDemo):
ceny kryptowalut na żywo z Binance, Kraken i Coinbase, z przyciskiem
ręcznego odświeżenia. PL/EN.

Vite + React 19 + TypeScript. Odpytuje `GET /api/prices` co 15s;
`POST /api/prices/refresh` do ręcznego re-pollu (limit po stronie backendu:
raz na 60s). Gdy poll się nie uda, ostatnie ceny zostają na ekranie z
oznaczeniem, z której są godziny.

## Uruchomienie

Wymaga lokalnie uruchomionego backendu, z CORS dopuszczającym origin tej
appki.

```bash
npm install
npm run dev
```

`VITE_API_BASE_URL` (w `.env`) wskazuje na backend — domyślnie
`http://localhost:8000`. `.env.production` ma placeholder na docelowy
origin API.

## Build i deploy

```bash
npm run lint
npm run build
```

`dist/` wypychany na branch `gh-pages` przez CI, serwowany statycznie —
patrz `.github/workflows/deploy.yml`. `.htaccess` (kopiowany do `dist/`)
ustawia nagłówki bezpieczeństwa, w tym CSP — `connect-src` musi zgadzać się
z `VITE_API_BASE_URL`.
