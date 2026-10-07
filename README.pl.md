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

Ceny poniżej 1 USD są pokazywane z liczbą miejsc po przecinku dającą 2 cyfry znaczące (monety poniżej centa, np. SHIB, nie zamieniają się w 0,00 USD); komórki tablicy mają gołe liczby, bo waluta jest podana raz w jej legendzie.

Uwagi:

- Przyciski języka i motywu są we wspólnym pasku statusu `<tolemak-bar>` (`src/tolemak-bar`): zwykłe custom elements bez zależności, więc ten sam plik działa w React, Twig i statycznych stronach; kolory pochodzą ze strony hosta przez właściwości `--tb-*`. Style są konstruowane (`CSSStyleSheet`) zamiast tagów `<style>`, żeby pasek działał też przy ścisłym CSP `style-src`. `langList()` jest metodą, a nie getterem, bo React 19 przypisuje atrybuty jako właściwości, gdy element ma właściwość o tej nazwie.
- Pasek tylko ogłasza wybór języka (zdarzenie `tolemak-lang`), bo tłumaczenia należą do aplikacji. Zdarzenie motywu (`tolemak-theme`) jest anulowalne: aplikacje z własnym stanem motywu (ta, `ThemeContext`) anulują je i same stosują motyw, co zachowuje animację radialną. Gdy storage jest wyłączony, wybór trwa do przeładowania.
- `usePrices` odpytuje co 15 s i ma 60 s cooldown ręcznego odświeżenia (odliczanie jest zaokrąglane w górę, więc rozpoczęta sekunda pokazuje się jako pełna). Efekt wywołuje asynchroniczne `load()` bezpośrednio; nic nie jest ustawiane przed pierwszym `await`, czego reguła lint `react/set-state-in-effect` nie widzi przez wywołanie, stąd `oxlint-disable-next-line`.
- Kropka pulsu miga raz przy każdym nowym komplecie cen; gdy API jest niedostępne, ostatnie ceny zostają, a tablica przygasa jak panel bez zasilania. Wygląd to tablica kursów walut: panel LCD w jasnym motywie, czerwona tablica LED w ciemnym.

Po zielonych testach na `main` CI pakuje zbudowany `dist/` jako `ghcr.io/tolemak/cryptopulse-frontend-static:<sha commita>` (obraz `FROM scratch` z plikami w `/site`) z podpisanym poświadczeniem pochodzenia builda. Serwer sam go pobiera, weryfikuje poświadczenie i podmienia stronę jednym ruchem; CI nigdy się z nim nie łączy.
