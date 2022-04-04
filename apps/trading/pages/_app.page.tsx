import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { useMemo, useState } from 'react';
import { createClient } from '../lib/apollo-client';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { ApolloProvider } from '@apollo/client';
import { AppLoader } from '../components/app-loader';
import { VegaWalletConnectButton } from '../components/vega-wallet-connect-button';
import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  const [vegaWallet, setVegaWallet] = useState({
    connect: false,
    manage: false,
  });
  const [theme, toggleTheme] = useThemeSwitcher();

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
                <div className="flex items-center gap-4 ml-auto mr-8">
                  <VegaWalletConnectButton
                    setConnectDialog={(open) =>
                      setVegaWallet((x) => ({ ...x, connect: open }))
                    }
                    setManageDialog={(open) =>
                      setVegaWallet((x) => ({ ...x, manage: open }))
                    }
                  />
                  <ThemeSwitcher onToggle={toggleTheme} className="-my-4" />
                </div>
              </div>
              <main>
                <Component {...pageProps} />
              </main>
              <VegaConnectDialog
                connectors={Connectors}
                dialogOpen={vegaWallet.connect}
                setDialogOpen={(open) =>
                  setVegaWallet((x) => ({ ...x, connect: open }))
                }
              />
              <VegaManageDialog
                dialogOpen={vegaWallet.manage}
                setDialogOpen={(open) =>
                  setVegaWallet((x) => ({ ...x, manage: open }))
                }
              />
            </div>
          </AppLoader>
        </VegaWalletProvider>
      </ApolloProvider>
    </ThemeContext.Provider>
  );
}

export default VegaTradingApp;
