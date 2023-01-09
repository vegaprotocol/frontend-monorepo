import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import { Navbar } from '../components/navbar';
import { t } from '@vegaprotocol/react-helpers';
import {
  useEagerConnect as useVegaEagerConnect,
  VegaWalletProvider,
  useVegaTransactionManager,
  useVegaTransactionUpdater,
  useVegaWallet,
} from '@vegaprotocol/wallet';
import {
  useEagerConnect as useEthereumEagerConnect,
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
} from '@vegaprotocol/web3';
import {
  EnvironmentProvider,
  envTriggerMapping,
  Networks,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AppLoader, Web3Provider } from '../components/app-loader';
import './styles.css';
import './gen-styles.scss';
import { usePageTitleStore } from '../stores';
import { Footer } from '../components/footer';
import { useEffect, useMemo, useState } from 'react';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import { HashRouter, useLocation, useSearchParams } from 'react-router-dom';
import { Connectors } from '../lib/vega-connectors';

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

const TransactionsHandler = () => {
  useVegaTransactionManager();
  useVegaTransactionUpdater();
  useEthTransactionManager();
  useEthTransactionUpdater();
  useEthWithdrawApprovalsManager();
  return null;
};

function AppBody({ Component }: AppProps) {
  const location = useLocation();
  const { VEGA_ENV } = useEnvironment();

  return (
    <div className="h-full dark:bg-black dark:text-white">
      <Head>
        {/* Cannot use meta tags in _document.page.tsx see https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Title />
      <VegaWalletProvider>
        <AppLoader>
          <Web3Provider>
            <div className="h-full relative z-0 grid grid-rows-[min-content,1fr,min-content]">
              <Navbar
                navbarTheme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'dark'}
              />
              <main data-testid={location.pathname}>
                <Component />
              </main>
              <Footer />
              <DialogsContainer />
              <ToastsManager />
              <TransactionsHandler />
              <MaybeConnectEagerly />
            </div>
          </Web3Provider>
        </AppLoader>
      </VegaWalletProvider>
    </div>
  );
}

const DynamicLoader = dynamic(
  () => import('../components/preloader/preloader'),
  {
    loading: () => <>Loading...</>,
  }
);

function VegaTradingApp(props: AppProps) {
  const [mounted, setMounted] = useState(false);

  // Hash router requires access to the document object. At compile time that doesn't exist
  // so we need to ensure client side rendering only from this point onwards in
  // the component tree
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DynamicLoader />;
  }

  return (
    <HashRouter>
      <EnvironmentProvider>
        <AppBody {...props} />
      </EnvironmentProvider>
    </HashRouter>
  );
}

export default VegaTradingApp;

const MaybeConnectEagerly = () => {
  useVegaEagerConnect(Connectors);
  useEthereumEagerConnect();

  const { pubKey, connect } = useVegaWallet();
  const [searchParams] = useSearchParams();
  const [query] = useState(searchParams.get('address'));
  if (query && !pubKey) {
    connect(Connectors['view']);
  }
  return null;
};
