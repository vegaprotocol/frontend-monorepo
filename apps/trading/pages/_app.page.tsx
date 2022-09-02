import type { AppProps } from 'next/app';
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
import Head from 'next/head';

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
      <Head>
        <title>{t('Welcome to Vega trading!')}</title>
      </Head>
      <div className="h-full relative dark:bg-black dark:text-white z-0 grid grid-rows-[min-content,1fr,min-content]">
        <AppLoader>
          <Navbar theme={theme} toggleTheme={toggleTheme} />
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
        <AppBody {...props} />
      </VegaWalletProvider>
    </EnvironmentProvider>
  );
}

export default VegaTradingApp;
