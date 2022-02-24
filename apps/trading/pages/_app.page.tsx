import { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import {
  useVegaWallet,
  VegaConnectDialog,
  VegaWalletProvider,
} from '@vegaprotocol/react-helpers';
import { Connectors } from '../lib/connectors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocalStorage } from '@vegaprotocol/storage';
import { createClient } from '../lib/apollo-client';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import './styles.css';
import { ApolloProvider } from '@apollo/client';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  const [dialogOpen, setDialogOpen] = useState(false);

  const setConnectDialog = useCallback((isOpen?: boolean) => {
    setDialogOpen((curr) => {
      if (isOpen === undefined) return !curr;
      return isOpen;
    });
  }, []);

  useCallback(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const setTheme = () => {
    localStorage.theme = document.documentElement.classList.toggle('dark')
      ? 'dark'
      : undefined;
  };
  return (
    <ApolloProvider client={client}>
      <VegaWalletProvider>
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
            <VegaWalletButton setConnectDialog={setConnectDialog} />
            <ThemeSwitcher onToggle={setTheme} className="ml-auto mr-8 -my-2" />
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
        <VegaWalletManager />
      </VegaWalletProvider>
    </ApolloProvider>
  );
}

interface VegaWalletButtonProps {
  setConnectDialog: (isOpen: boolean) => void;
}

const VegaWalletButton = ({ setConnectDialog }: VegaWalletButtonProps) => {
  const { disconnect, keypairs } = useVegaWallet();
  const isConnected = keypairs !== null;

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      setConnectDialog(true);
    }
  };

  return (
    <button onClick={handleClick} className="inline-block p-8">
      {isConnected ? 'Disconnect' : 'Connect Vega wallet'}
    </button>
  );
};

export default VegaTradingApp;

/**
 * Wrapper to interact with the vega wallet out side of the provider itself.
 */
function VegaWalletManager() {
  // Get keys from vega wallet immediately
  useEagerConnect();

  // Do other global stuff with vega wallet here

  return null;
}

function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    const cfg = LocalStorage.getItem('vega_wallet');
    const cfgObj = JSON.parse(cfg);

    // No stored config, user has never connected or manually cleared storage
    if (!cfgObj || !cfgObj.connector) {
      return;
    }

    const connector = Connectors[cfgObj.connector];

    // Developer hasn't provided this connector
    if (!connector) {
      throw new Error(`Connector ${cfgObj?.connector} not configured`);
    }

    connect(Connectors[cfgObj.connector]);
  }, [connect]);
}
