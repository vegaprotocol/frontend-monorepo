import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { t } from '@vegaprotocol/i18n';
import {
  useEagerConnect as useVegaEagerConnect,
  useVegaWallet,
} from '@vegaprotocol/wallet';
import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import {
  useEagerConnect as useEthereumEagerConnect,
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
} from '@vegaprotocol/web3';
import {
  envTriggerMapping,
  Networks,
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import './styles.css';
import { useGlobalStore, usePageTitleStore } from '../stores';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import {
  HashRouter,
  useLocation,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
import { Connectors } from '../lib/vega-connectors';
import { Bootstrapper } from '../components/bootstrapper';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { useTelemetryApproval } from '../lib/hooks/use-telemetry-approval';
import { AnnouncementBanner } from '../components/banner';
import { Navbar } from '../components/navbar';
import classNames from 'classnames';
import {
  ProtocolUpgradeCountdownMode,
  ProtocolUpgradeInProgressNotification,
  ProtocolUpgradeProposalNotification,
} from '@vegaprotocol/proposals';
import { ViewingBanner } from '../components/viewing-banner';
import { NavHeader } from '../components/navbar/nav-header';
import { Telemetry } from '../components/telemetry';
import { Routes as AppRoutes } from '../lib/links';
import { SSRLoader } from './ssr-loader';

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

const InitializeHandlers = () => {
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
    'grid-rows-[repeat(3,min-content),minmax(0,1fr)]'
  );
  return (
    <div className="h-full overflow-hidden">
      <Head>
        {/* Cannot use meta tags in _document.page.tsx see https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Title />
      <div className={gridClasses}>
        <AnnouncementBanner />
        <Navbar theme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'system'}>
          <Routes>
            <Route
              path={AppRoutes.MARKETS}
              // render nothing for markets/all, otherwise markets/:marketId will match with markets/all
              element={null}
            />
            <Route path={AppRoutes.MARKET} element={<NavHeader />} />
          </Routes>
        </Navbar>
        <div data-testid="banners">
          <ProtocolUpgradeProposalNotification
            mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
          />
          <ProtocolUpgradeInProgressNotification />
          <ViewingBanner />
        </div>
        <div data-testid={`pathname-${location.pathname}`}>
          <Component />
        </div>
      </div>
      <DialogsContainer />
      <ToastsManager />
      <InitializeHandlers />
      <MaybeConnectEagerly />
      <PartyData />
      <Telemetry />
    </div>
  );
}

function VegaTradingApp(props: AppProps) {
  const status = useEnvironment((store) => store.status);
  const [nodeSwitcherOpen, setNodeSwitcher] = useNodeSwitcherStore((store) => [
    store.dialogOpen,
    store.setDialogOpen,
  ]);

  useInitializeEnv();

  // Prevent HashRouter from being server side rendered as it
  // relies on presence of document object
  if (status === 'default') {
    return <SSRLoader />;
  }

  return (
    <HashRouter>
      <Bootstrapper>
        <AppBody {...props} />
      </Bootstrapper>
      <NodeSwitcherDialog open={nodeSwitcherOpen} setOpen={setNodeSwitcher} />
    </HashRouter>
  );
}

export default VegaTradingApp;

const PartyData = () => {
  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !pubKey;
  useDataProvider({
    dataProvider: activeOrdersProvider,
    variables,
    skip,
  });
  return null;
};

const MaybeConnectEagerly = () => {
  const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  const update = useGlobalStore((store) => store.update);
  const eagerConnecting = useVegaEagerConnect(Connectors);
  const [isTelemetryApproved] = useTelemetryApproval();
  useEthereumEagerConnect(
    isTelemetryApproved ? { dsn: SENTRY_DSN, env: VEGA_ENV } : {}
  );

  const { pubKey, connect } = useVegaWallet();
  const [searchParams] = useSearchParams();
  const [query] = useState(searchParams.get('address'));
  if (query && !pubKey) {
    connect(Connectors['view']);
  }
  useEffect(() => {
    update({ eagerConnecting });
  }, [update, eagerConnecting]);
  return null;
};
