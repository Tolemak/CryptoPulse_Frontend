# CryptoPulse Frontend

Ticker cen do [CryptoPulse_BackendDemo](https://github.com/Tolemak/CryptoPulse_BackendDemo): zagregowane ceny odświeżane co 15 s plus ręczne odświeżanie. React + TypeScript + Vite, PL/EN. [crypto-pulse.tolemak.pl](https://crypto-pulse.tolemak.pl/)

[English version](README.md)

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Potrzebuje działającego backendu, jego adres idzie do `VITE_API_BASE_URL` (skopiuj `.env.example` do `.env`, wskazuje na `http://localhost:8000`; build kończy się błędem, gdy nie jest ustawiona). Build automatycznie wyprowadza `connect-src` w `dist/.htaccess` z tej wartości.

CI wrzuca zbudowany `dist/` na gałąź `build`, z której deployuje serwer.
