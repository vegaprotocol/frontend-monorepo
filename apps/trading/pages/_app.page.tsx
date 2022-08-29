import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
import { EnvironmentProvider } from '@vegaprotocol/environment';
import { Connectors } from '../lib/vega-connectors';
import { AppLoader } from '../components/app-loader';
import './styles.css';
import { useGlobalStore } from '../stores';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { Footer } from '../components/footer';

function AppBody({ Component, pageProps }: AppProps) {
  const store = useGlobalStore();
  const {
    isAssetDetailsDialogOpen,
    assetDetailsDialogSymbol,
    setAssetDetailsDialogOpen,
  } = useAssetDetailsDialogStore();
  const [theme, toggleTheme] = useThemeSwitcher();

  return (
    <ThemeContext.Provider value={theme}>
      <div className="h-full relative dark:bg-black dark:text-white z-0 grid grid-rows-[min-content,1fr,min-content]">
        <AppLoader>
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main data-testid={pageProps.page}>
            {/* @ts-ignore conflict between @types/react and nextjs internal types */}
            <Component {...pageProps} />
          </main>
          <Footer />
          <VegaConnectDialog
            connectors={Connectors}
            dialogOpen={store.vegaWalletConnectDialog}
            setDialogOpen={(open) => store.setVegaWalletConnectDialog(open)}
          />
          <VegaManageDialog
            dialogOpen={store.vegaWalletManageDialog}
            setDialogOpen={(open) => store.setVegaWalletManageDialog(open)}
          />
          <AssetDetailsDialog
            assetSymbol={assetDetailsDialogSymbol}
            open={isAssetDetailsDialogOpen}
            onChange={(open) => setAssetDetailsDialogOpen(open)}
          />
        </AppLoader>
      </div>
    </ThemeContext.Provider>
  );
}

function VegaTradingApp(props: AppProps) {
  return (
    <EnvironmentProvider>
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
          {['1', 'true'].includes(process.env['NX_USE_ENV_OVERRIDES'] || '') ? (
            /* eslint-disable-next-line @next/next/no-sync-scripts */
            <script src="/assets/env-config.js" type="text/javascript" />
          ) : null}
        </Head>
        <AppBody {...props} />
      </VegaWalletProvider>
    </EnvironmentProvider>
  );
}

export default VegaTradingApp;
