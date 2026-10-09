# CryptoPulse Frontend

[![status: done](https://img.shields.io/badge/status-done-blue)](https://github.com/Tolemak/CryptoPulse_Frontend)

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

Notes:

- The language and theme buttons live in the shared `<tolemak-bar>` status bar (`src/tolemak-bar`): plain custom elements with no dependencies, so the same file works in React, Twig and static pages; colors come from the host page through `--tb-*` custom properties. Its stylesheets are constructed (`CSSStyleSheet`) instead of `<style>` tags so it also works under a strict `style-src` CSP. `langList()` is a method, not a getter, because React 19 assigns attributes as properties when the element has one of that name.
- The bar only announces the language choice (`tolemak-lang` event), since the translations belong to the app. The theme event (`tolemak-theme`) is cancelable: apps with their own theme state (this one, `ThemeContext`) cancel it and apply the theme themselves, which keeps the radial animation. If storage is disabled the choice lasts until reload.
- `usePrices` polls every 15 s with a 60 s manual refresh cooldown (the countdown is rounded up, so a started second still shows as a full one). Its effect calls the async `load()` directly; nothing is set before the first `await`, which the `react/set-state-in-effect` lint rule cannot see across the call, hence the `oxlint-disable-next-line` there.
- The pulse dot flashes once each time new prices arrive; when the API is unreachable the last prices stay up and the board dims like a panel that lost power. The look is a currency-exchange rate board: an LCD panel in the light theme, a red LED board in the dark one.

After the checks pass on `main`, CI packages the built `dist/` as `ghcr.io/tolemak/cryptopulse-frontend-static:<commit sha>` (a `FROM scratch` image with the files in `/site`) with a signed build provenance attestation. The server pulls it, verifies the attestation and swaps the site in one step; CI never connects to it.
