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
  envTriggerMapping,
  NetworkLoader,
  Networks,
  NodeGuard,
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
} from '@vegaprotocol/environment';
import { Web3Provider } from '../components/app-loader';
import './styles.css';
import './gen-styles.scss';
import { useGlobalStore, usePageTitleStore } from '../stores';
import { Footer } from '../components/footer';
import { useMemo, useState } from 'react';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import { HashRouter, useLocation, useSearchParams } from 'react-router-dom';
import { Connectors } from '../lib/vega-connectors';
import { ViewingBanner } from '../components/viewing-banner';
import { Banner } from '../components/banner';
import type { InMemoryCacheConfig } from '@apollo/client';
import classNames from 'classnames';
import { AppFailure } from '../components/app-loader/app-failure';
import { MaintenancePage } from '@vegaprotocol/ui-toolkit';

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

  const gridClasses = classNames(
    'h-full relative z-0 grid',
    'grid-rows-[repeat(3,min-content),1fr,min-content]'
  );

  return (
    <div className="h-full dark:bg-black dark:text-white">
      <Head>
        {/* Cannot use meta tags in _document.page.tsx see https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Title />
      <div className={gridClasses}>
        <Navbar
          navbarTheme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'dark'}
        />
        <Banner />
        <ViewingBanner />
        <main data-testid={location.pathname}>
          <Component />
        </main>
        <Footer />
      </div>
      <DialogsContainer />
      <ToastsManager />
      <TransactionsHandler />
      <MaybeConnectEagerly />
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
  const { status, error, VEGA_URL, MAINTENANCE_PAGE } = useEnvironment(
    (store) => ({
      status: store.status,
      error: store.error,
      VEGA_URL: store.VEGA_URL,
      MAINTENANCE_PAGE: store.MAINTENANCE_PAGE,
    })
  );
  const { nodeSwitcherOpen, setNodeSwitcher } = useGlobalStore((store) => ({
    nodeSwitcherOpen: store.nodeSwitcherDialog,
    setNodeSwitcher: (open: boolean) =>
      store.update({ nodeSwitcherDialog: open }),
  }));

  useInitializeEnv();

  if (MAINTENANCE_PAGE) {
    return <MaintenancePage />;
  }

  // Prevent HashRouter from being server side rendered as it
  // relies on presence of document object
  if (status === 'default') {
    return null;
  }

  return (
    <HashRouter>
      <NetworkLoader
        cache={cacheConfig}
        skeleton={<DynamicLoader />}
        failure={
          <AppFailure title={t('Could not initialize app')} error={error} />
        }
      >
        <NodeGuard
          skeleton={<DynamicLoader />}
          failure={<AppFailure title={t(`Node: ${VEGA_URL} is unsuitable`)} />}
        >
          <Web3Provider>
            <VegaWalletProvider>
              <AppBody {...props} />
            </VegaWalletProvider>
          </Web3Provider>
        </NodeGuard>
      </NetworkLoader>
      <NodeSwitcherDialog open={nodeSwitcherOpen} setOpen={setNodeSwitcher} />
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

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Account: {
      keyFields: false,
      fields: {
        balanceFormatted: {},
      },
    },
    Instrument: {
      keyFields: false,
    },
    TradableInstrument: {
      keyFields: ['instrument'],
    },
    Product: {
      keyFields: ['settlementAsset', ['id']],
    },
    MarketData: {
      keyFields: ['market', ['id']],
    },
    Node: {
      keyFields: false,
    },
    Withdrawal: {
      fields: {
        pendingOnForeignChain: {
          read: (isPending = false) => isPending,
        },
      },
    },
    ERC20: {
      keyFields: ['contractAddress'],
    },
    PositionUpdate: {
      keyFields: false,
    },
    AccountUpdate: {
      keyFields: false,
    },
    Party: {
      keyFields: false,
    },
    Fees: {
      keyFields: false,
    },
  },
};
