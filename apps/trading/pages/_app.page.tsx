import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import { t, ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
import {
  EnvironmentProvider,
  useEnvironment,
  Networks,
} from '@vegaprotocol/environment';
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
import { LocalStorage } from '@vegaprotocol/react-helpers';


const RISK_ACCEPTED_KEY = 'vega-risk-accepted';

function AppBody({ Component, pageProps }: AppProps) {
  const store = useGlobalStore();
  const { VEGA_ENV } = useEnvironment();
  const {
    isAssetDetailsDialogOpen,
    assetDetailsDialogSymbol,
    setAssetDetailsDialogOpen,
  } = useAssetDetailsDialogStore();
  const [theme, toggleTheme] = useThemeSwitcher();

  useEffect(() => {
    const isRiskAccepted = LocalStorage.getItem(RISK_ACCEPTED_KEY) === 'true';
    if (!isRiskAccepted && VEGA_ENV === Networks.MAINNET) {
      store.setVegaRiskNoticeDialog(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.setVegaRiskNoticeDialog, VEGA_ENV]);

  const handleAcceptRisk = () => {
    store.setVegaRiskNoticeDialog(false);
    LocalStorage.setItem(RISK_ACCEPTED_KEY, 'true');
  };

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
          <RiskNoticeDialog
            dialogOpen={store.vegaRiskNoticeDialog}
            onAcceptRisk={handleAcceptRisk}
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
