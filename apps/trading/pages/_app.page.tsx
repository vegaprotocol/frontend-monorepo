import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { VegaConnectDialog, VegaWalletProvider } from '@vegaprotocol/wallet';
import { EnvironmentProvider } from '@vegaprotocol/environment';
import { Connectors } from '../lib/vega-connectors';
import { AppLoader } from '../components/app-loader';
import { RiskNoticeDialog } from '../components/risk-notice-dialog';
import './styles.css';
import { useGlobalStore } from '../stores';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { Footer } from '../components/footer';

function AppBody({ Component, pageProps }: AppProps) {
  const { connectDialog, update } = useGlobalStore((store) => ({
    connectDialog: store.connectDialog,
    update: store.update,
  }));
  const {
    isAssetDetailsDialogOpen,
    assetDetailsDialogSymbol,
    assetDetailsDialogTrigger,
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
          <Footer />
          <VegaConnectDialog
            connectors={Connectors}
            dialogOpen={connectDialog}
            setDialogOpen={(open) => update({ connectDialog: open })}
          />
          <AssetDetailsDialog
            assetSymbol={assetDetailsDialogSymbol}
            trigger={assetDetailsDialogTrigger || null}
            open={isAssetDetailsDialogOpen}
            onChange={(open) => setAssetDetailsDialogOpen(open)}
          />
          <RiskNoticeDialog />
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
