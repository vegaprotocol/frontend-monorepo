import { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import {
  VegaConnectDialog,
  VegaWalletProvider,
} from '@vegaprotocol/react-helpers';
import { Connectors } from '../lib/connectors';
import { useCallback, useMemo, useState } from 'react';
import { createClient } from '../lib/apollo-client';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import './styles.css';
import { ApolloProvider } from '@apollo/client';
import './styles.css';
import { AppLoader } from '../components/app-loader';
import { VegaWalletButton } from '../components/vega-wallet-connect-button';
import { useThemeSwitcher } from '../hooks/use-theme-switcher';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const setTheme = useThemeSwitcher();

  const setConnectDialog = useCallback((isOpen?: boolean) => {
    setDialogOpen((curr) => {
      if (isOpen === undefined) return !curr;
      return isOpen;
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      <VegaWalletProvider>
        <AppLoader>
          <Head>
            <title>Welcome to trading!</title>
            <link
              rel="icon"
              href="https://vega.xyz/favicon-32x32.png"
              type="image/png"
            />
          </Head>
          <div className="h-full dark:bg-black dark:text-white-60 bg-white text-black-60">
            <div className="flex items-center border-b-[7px] border-vega-yellow">
              <Navbar />
              <div className="flex items-center ml-auto mr-8">
                <VegaWalletButton setConnectDialog={setConnectDialog} />
                <ThemeSwitcher onToggle={setTheme} />
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
  );
}

export default VegaTradingApp;
