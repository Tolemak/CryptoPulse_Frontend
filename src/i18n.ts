import { createContext, useContext } from 'react';

export type Lang = 'pl' | 'en';

const translations = {
  pl: {
    app: {
      title: 'CryptoPulse',
      subtitle: 'Ceny na żywo z kilku giełd, z alertami webhookowymi.',
    },
    footer: {
      portfolio: 'Kamil Gałkowski · portfolio',
      source: 'Kod na GitHubie:',
    },
    theme: {
      switchToLight: 'Przełącz na jasny motyw',
      switchToDark: 'Przełącz na ciemny motyw',
      light: 'Jasny motyw',
      dark: 'Ciemny motyw',
    },
    prices: {
      title: 'Ceny',
      loading: 'Ładowanie cen…',
      error: 'Nie udało się połączyć z API: {error}',
      stale: 'Brak połączenia z API — ceny z {time}, ponawiam automatycznie.',
      staleUnknown: 'Brak połączenia z API — ceny mogą być nieaktualne, ponawiam automatycznie.',
      empty: 'Brak jeszcze danych — backend odpytuje giełdy cyklicznie (app:poll-prices). Uruchom raz, dalej odświeży się samo.',
      updated: 'Zaktualizowano {time}',
      ath: 'Szczyt: {price} ({date})',
      pctFromAth: '{pct} od szczytu',
      athUnavailable: 'Brak danych o szczycie',
      refresh: 'Odśwież',
      refreshing: 'Odświeżanie…',
      refreshCooldown: 'Odśwież ({seconds}s)',
      refreshNotice: 'Ktoś już niedawno odświeżył — spróbuj ponownie za chwilę.',
      showMore: 'Pokaż pozostałe ({count})',
      showLess: 'Pokaż mniej',
    },
    board: {
      coin: 'Krypto',
      median: 'Mediana',
      spread: 'Rozrzut',
      fromAth: 'Od szczytu',
      legend: 'Ceny w USD. Najtańsza giełda w wierszu świeci na zielono.',
      cheapest: 'najtaniej',
    },
    bar: {
      exchanges: 'giełdy',
      refreshed: 'odświeżono',
      pairs: 'pary',
      api: 'API',
      offline: 'brak połączenia',
    },
  },
  en: {
    app: {
      title: 'CryptoPulse',
      subtitle: 'Live multi-exchange price aggregation, with webhook alerts.',
    },
    footer: {
      portfolio: 'Kamil Gałkowski · portfolio',
      source: 'Source on GitHub:',
    },
    theme: {
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      light: 'Light mode',
      dark: 'Dark mode',
    },
    prices: {
      title: 'Prices',
      loading: 'Loading prices…',
      error: 'Could not reach the API: {error}',
      stale: 'Cannot reach the API — showing prices from {time}, retrying automatically.',
      staleUnknown: 'Cannot reach the API — prices may be out of date, retrying automatically.',
      empty: 'No price data yet — the backend polls exchanges on a schedule (app:poll-prices). Run it once, then this refreshes automatically.',
      updated: 'Updated {time}',
      ath: 'ATH: {price} ({date})',
      pctFromAth: '{pct} from ATH',
      athUnavailable: 'No ATH data yet',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      refreshCooldown: 'Refresh ({seconds}s)',
      refreshNotice: 'A refresh was already requested recently — try again shortly.',
      showMore: 'Show the rest ({count})',
      showLess: 'Show less',
    },
    board: {
      coin: 'Coin',
      median: 'Median',
      spread: 'Spread',
      fromAth: 'From ATH',
      legend: 'Prices in USD. The cheapest exchange in each row lights up green.',
      cheapest: 'cheapest',
    },
    bar: {
      exchanges: 'exchanges',
      refreshed: 'refreshed',
      pairs: 'pairs',
      api: 'API',
      offline: 'offline',
    },
  },
};

export type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
});

const useLang = () => useContext(LangContext);

export const useT = () => {
  const { lang } = useLang();
  return translations[lang];
};
