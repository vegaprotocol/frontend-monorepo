import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import {
  EnvironmentProvider,
  envTriggerMapping,
  Networks,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AppLoader } from '../components/app-loader';
import './styles.css';
import { usePageTitleStore } from '../stores';
import { Footer } from '../components/footer';
import { useEffect, useMemo, useState } from 'react';
import DialogsContainer from './dialogs-container';
import { HashRouter, useLocation } from 'react-router-dom';
import { Router } from './router';

const DEFAULT_TITLE = t('Welcome to Vega trading!');

const Title = () => {
  const { pageTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
  }));

  const { VEGA_ENV } = useEnvironment();
  const networkName = envTriggerMapping[VEGA_ENV];

  const title = useMemo(() => {
    if (!pageTitle) return DEFAULT_TITLE;
    if (networkName) return `${pageTitle} [${networkName}]`;
    return pageTitle;
  }, [pageTitle, networkName]);
  return <title>{title}</title>;
};

function AppBody() {
  const location = useLocation();
  const { VEGA_ENV } = useEnvironment();
  const [theme, toggleTheme] = useThemeSwitcher();

  return (
    <ThemeContext.Provider value={theme}>
      <Head>
        <Title />
      </Head>
      <div className="h-full relative dark:bg-black dark:text-white z-0 grid grid-rows-[min-content,1fr,min-content]">
        <AppLoader>
          <Navbar
            theme={theme}
            toggleTheme={toggleTheme}
            navbarTheme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'dark'}
          />
          <main data-testid={location.pathname}>
            <Router />
          </main>
          <Footer />
          <DialogsContainer />
        </AppLoader>
      </div>
    </ThemeContext.Provider>
  );
}

function VegaTradingApp() {
  const [mounted, setMounted] = useState(false);

  // Hash router requires access to the document object. At compile time that doesn't exist
  // so we need to ensure client side rendering only from this point onwards in
  // the component tree
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <HashRouter>
      <EnvironmentProvider>
        <VegaWalletProvider>
          <AppBody />
        </VegaWalletProvider>
      </EnvironmentProvider>
    </HashRouter>
  );
}

export default VegaTradingApp;
