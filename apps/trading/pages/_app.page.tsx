import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext } from '@vegaprotocol/react-helpers';
import { VegaConnectDialog, VegaWalletProvider } from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { useCallback, useMemo, useState } from 'react';
import { createClient } from '../lib/apollo-client';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { ApolloProvider } from '@apollo/client';
import { AppLoader } from '../components/app-loader';
import { VegaWalletButton } from '../components/vega-wallet-connect-button';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [theme, toggleTheme] = useThemeSwitcher();

  const setConnectDialog = useCallback((isOpen?: boolean) => {
    setDialogOpen((curr) => {
      if (isOpen === undefined) return !curr;
      return isOpen;
    });
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      <ApolloProvider client={client}>
        <VegaWalletProvider>
          <AppLoader>
            <Head>
              <title>{t('Welcome to Vega trading!')}</title>
              <link
                rel="icon"
                href="https://vega.xyz/favicon-32x32.png"
                type="image/png"
              />
            </Head>
            <div className="h-full dark:bg-black dark:text-white-60 bg-white text-black-60 grid grid-rows-[min-content,1fr]">
              <div className="flex items-stretch border-b-[7px] border-vega-yellow">
                <Navbar />
                <div className="flex items-center ml-auto mr-8">
                  <VegaWalletButton setConnectDialog={setConnectDialog} />
                  <ThemeSwitcher onToggle={toggleTheme} className="-my-4" />
                </div>
              </div>
              <main>
                <Component {...pageProps} />
              </main>
              <VegaConnectDialog
                connectors={Connectors}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
              />
            </div>
          </AppLoader>
        </VegaWalletProvider>
      </ApolloProvider>
    </ThemeContext.Provider>
  );
}

export default VegaTradingApp;
