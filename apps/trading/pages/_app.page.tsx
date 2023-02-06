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
  clients,
  envTriggerMapping,
  Networks,
  useEnvironment,
  useEnvironment2,
  useInitializeEnv,
  useNodeHealth,
  useStatisticsQuery,
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
import { ViewingBanner } from '../components/viewing-banner';
import { Banner } from '../components/banner';
import classNames from 'classnames';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import type { InMemoryCacheConfig } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { createClient, useHeaderStore } from '@vegaprotocol/apollo-client';
import classNames from 'classnames';

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
      <VegaWalletProvider>
        <AppLoader>
          <Web3Provider>
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
  const [open, setOpen] = useState(false);
  const { status, url } = useEnvironment2((store) => ({
    status: store.status,
    url: store.url,
  }));

  useInitializeEnv();

  const client = useMemo(() => {
    if (url) {
      return createClient({
        url,
        cacheConfig,
      });
    }
    return undefined;
  }, [url]);

  if (status === 'default' || status === 'pending' || !client) {
    return <DynamicLoader />;
  }

  return (
    <HashRouter>
      <ApolloProvider client={client}>
        <Test />
        <button onClick={() => setOpen(true)}>Status</button>
        <NodeSwitcher open={open} setOpen={setOpen} />
      </ApolloProvider>
    </HashRouter>
  );
}

const NodeSwitcher = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const { nodes, setUrl } = useEnvironment2((store) => ({
    status: store.status,
    nodes: store.nodes,
    setUrl: store.setUrl,
  }));

  return (
    <Dialog open={open} onChange={setOpen}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">node</th>
            <th className="text-right">response time</th>
            <th className="text-right">core block height</th>
            <th className="text-right">datanode block height</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const client = clients[node];

            if (!client) return null;

            return (
              <tr key={node} onClick={() => setUrl(node)}>
                <ApolloProvider client={client}>
                  <Row url={node} />
                </ApolloProvider>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        Custom
        <input
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
        />
        {/* <button onClick={}>Check</button> */}
      </div>
    </Dialog>
  );
};

const Row = ({ url }: { url: string }) => {
  const [time, setTime] = useState<number>();
  const { data } = useStatisticsQuery({
    pollInterval: 3000,
    fetchPolicy: 'no-cache',
  });
  const headerStore = useHeaderStore();
  const headers = headerStore[url];

  useEffect(() => {
    const requestUrl = new URL(url);
    const requests = window.performance.getEntriesByName(requestUrl.href);
    const { duration } =
      (requests.length && requests[requests.length - 1]) || {};
    setTime(duration);
  }, [url]);

  const headerBlockHeightClass = classNames('text-right', {
    'text-vega-pink':
      headers &&
      data &&
      headers.blockHeight < Number(data.statistics.blockHeight) - 3,
  });

  return (
    <>
      <td>{url}</td>
      <td className="text-right">{time ? time.toFixed(2) + 'ms' : 'n/a'}</td>
      <td className="text-right">{data?.statistics.blockHeight || '-'}</td>
      <td className={headerBlockHeightClass}>{headers?.blockHeight || '-'}</td>
    </>
  );
};

const Test = () => {
  const env = useEnvironment2((store) => ({
    url: store.url,
    configUrl: store.configUrl,
    nodes: store.nodes,
    status: store.status,
  }));
  const headers = useHeaderStore();
  const {
    coreBlockHeight,
    coreVegaTime,
    datanodeBlockHeight,
    datanodeVegaTime,
  } = useNodeHealth();
  return (
    <div>
      <pre>{JSON.stringify(env, null, 2)}</pre>
      <pre>{JSON.stringify(headers, null, 2)}</pre>
      <div>Core BH {coreBlockHeight}</div>
      <div>Core time {coreVegaTime.toISOString()}</div>
      <div>Datanode BH {datanodeBlockHeight}</div>
      <div>Datanode time {datanodeVegaTime?.toISOString()}</div>
    </div>
  );
};

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
