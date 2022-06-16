import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
import {
  useEnvironment,
  EnvironmentProvider,
  NetworkSwitcherDialog,
} from '@vegaprotocol/environment';
import { Connectors } from '../lib/vega-connectors';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { AppLoader } from '../components/app-loader';
import { VegaWalletConnectButton } from '../components/vega-wallet-connect-button';
import './styles.css';
import { useGlobalStore } from '../stores';

function AppBody({ Component, pageProps }: AppProps) {
  const { push } = useRouter();
  const store = useGlobalStore();
  const { VEGA_NETWORKS } = useEnvironment();
  const [, toggleTheme] = useThemeSwitcher();

  return (
    <div className="h-full dark:bg-black dark:text-white-60 bg-white relative z-0 text-black-60 grid grid-rows-[min-content,1fr]">
      <AppLoader>
        <div className="flex items-stretch border-b-[7px] border-vega-yellow">
          <Navbar />
          <div className="flex items-center gap-4 ml-auto mr-8">
            <VegaWalletConnectButton
              setConnectDialog={(open) => {
                store.setVegaWalletConnectDialog(open);
              }}
              setManageDialog={(open) => {
                store.setVegaWalletManageDialog(open);
              }}
            />
            <ThemeSwitcher onToggle={toggleTheme} className="-my-4" />
          </div>
        </div>
        <main data-testid={pageProps.page}>
          {/* @ts-ignore conflict between @types/react and nextjs internal types */}
          <Component {...pageProps} />
        </main>
        <VegaConnectDialog
          connectors={Connectors}
          dialogOpen={store.vegaWalletConnectDialog}
          setDialogOpen={(open) => store.setVegaWalletConnectDialog(open)}
        />
        <VegaManageDialog
          dialogOpen={store.vegaWalletManageDialog}
          setDialogOpen={(open) => store.setVegaWalletManageDialog(open)}
        />
        <NetworkSwitcherDialog
          dialogOpen={store.vegaNetworkSwitcherDialog}
          setDialogOpen={(open) => store.setVegaNetworkSwitcherDialog(open)}
          onConnect={({ network }) => {
            if (VEGA_NETWORKS[network]) {
              push(VEGA_NETWORKS[network] ?? '');
            }
          }}
        />
      </AppLoader>
    </div>
  );
}

function VegaTradingApp(props: AppProps) {
  const [theme] = useThemeSwitcher();

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <VegaWalletProvider>
          <Head>
            <link
              rel="preload"
              href="https://static.vega.xyz/AlphaLyrae-Medium.woff2"
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
            <title>{t('Welcome to Vega trading!')}</title>
            <link
              rel="icon"
              type="image/x-icon"
              href="https://static.vega.xyz/favicon.ico"
            />
            <link rel="stylesheet" href="https://static.vega.xyz/fonts.css" />
            {['1', 'true'].includes(
              process.env['NX_USE_ENV_OVERRIDES'] || ''
            ) ? (
              /* eslint-disable-next-line @next/next/no-sync-scripts */
              <script src="./env-config.js" type="text/javascript" />
            ) : null}
          </Head>
          <AppBody {...props} />
        </VegaWalletProvider>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default VegaTradingApp;
