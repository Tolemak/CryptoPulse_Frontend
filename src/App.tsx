import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { PriceTicker } from './components/PriceTicker';
import { usePrices } from './hooks/usePrices';
import { LangContext, useLang, useT, type Lang, type LangContextType } from './i18n';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { radialViewTransition } from './utils/viewTransition';

function Dashboard() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const {
    prices,
    loading,
    error,
    refresh,
    refreshing,
    refreshBlocked,
    canManuallyRefresh,
    manualRefreshCooldownSeconds,
  } = usePrices();

  let refreshLabel = t.prices.refresh;
  if (refreshing) {
    refreshLabel = t.prices.refreshing;
  } else if (!canManuallyRefresh) {
    refreshLabel = t.prices.refreshCooldown.replace('{seconds}', String(manualRefreshCooldownSeconds));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>{t.app.title}</h1>
          <div className="app-header-actions">
            <button
              type="button"
              className="lang-btn"
              onClick={(e) => radialViewTransition(e.clientX, e.clientY, toggleTheme)}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button type="button" className="lang-btn" onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')}>
              {lang === 'pl' ? 'EN' : 'PL'}
            </button>
          </div>
        </div>
        <p>{t.app.subtitle}</p>
      </header>

      <section>
        <div className="section-header">
          <h2>{t.prices.title}</h2>
          <button type="button" onClick={refresh} disabled={!canManuallyRefresh} className="refresh-btn">
            {refreshLabel}
          </button>
        </div>
        {refreshBlocked && <p className="status refresh-notice">{t.prices.refreshNotice}</p>}
        <PriceTicker prices={prices} loading={loading} error={error} />
      </section>

      <footer className="app-footer">
        <a href="https://github.com/Tolemak/CryptoPulse_BackendDemo" target="_blank" rel="noopener noreferrer">
          {t.app.sourceLink}
        </a>
      </footer>
    </div>
  );
}

function App() {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang');
    return stored === 'pl' ? 'pl' : 'en';
  });

  const setLang = useCallback<LangContextType['setLang']>((next) => {
    localStorage.setItem('lang', next);
    setLangState(next);
  }, []);

  const contextValue = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <ThemeProvider>
      <LangContext.Provider value={contextValue}>
        <Dashboard />
      </LangContext.Provider>
    </ThemeProvider>
  );
}

export default App;
