import { useMemo } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { t } from '@vegaprotocol/i18n';
import {
  envTriggerMapping,
  Networks,
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import './styles.css';
import { usePageTitleStore } from '../stores';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import { HashRouter, useLocation, Route, Routes } from 'react-router-dom';
import { Bootstrapper } from '../components/bootstrapper';
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
import { PartyActiveOrdersHandler } from './party-active-orders-handler';
import { MaybeConnectEagerly } from './maybe-connect-eagerly';
import { TransactionHandlers } from './transaction-handlers';
import '../lib/i18n';

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

function AppBody({ Component }: AppProps) {
  const location = useLocation();
  const { VEGA_ENV } = useEnvironment();
  const gridClasses = classNames(
    'grid relative h-full z-0',
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
      <TransactionHandlers />
      <MaybeConnectEagerly />
      <PartyActiveOrdersHandler />
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

  // Start validation of env vars and determine VEGA_URL
  useInitializeEnv();

  // Prevent HashRouter from being server side rendered as it
  // relies on presence of document object
  //
  // This is the last point at which we get pregenerated
  // HTML so render a ssr friendly loader component
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
