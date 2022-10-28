import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import {
  EnvironmentProvider,
  envTriggerMapping,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AppLoader } from '../components/app-loader';
import './styles.css';
import { usePageTitleStore } from '../stores';
import { Footer } from '../components/footer';
import { useMemo } from 'react';
import DialogsContainer from './dialogs-container';

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
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

function AppBody({ Component, pageProps }: AppProps) {
  const [theme, toggleTheme] = useThemeSwitcher();
  return (
    <ThemeContext.Provider value={theme}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Title />
      <div className="h-full relative dark:bg-black dark:text-white z-0 grid grid-rows-[min-content,1fr,min-content]">
        <AppLoader>
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main data-testid={pageProps.page}>
            <Component {...pageProps} />
          </main>
          <Footer />
          <DialogsContainer />
        </AppLoader>
      </div>
    </ThemeContext.Provider>
  );
}

function VegaTradingApp(props: AppProps) {
  return (
    <EnvironmentProvider>
      <VegaWalletProvider>
        <AppBody {...props} />
      </VegaWalletProvider>
    </EnvironmentProvider>
  );
}

export default VegaTradingApp;
