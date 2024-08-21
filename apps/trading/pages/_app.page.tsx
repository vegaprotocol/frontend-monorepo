import React, { useMemo, Suspense, useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import {
  useEnvTriggerMapping,
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
  useNodeSwitcherStore,
  AppLoader,
} from '@vegaprotocol/environment';
import './styles.css';
import { usePageTitleStore } from '../stores';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import { HashRouter, useLocation } from 'react-router-dom';
import { Bootstrapper } from '../components/bootstrapper';
import { AnnouncementBanner } from '../components/banner';
import { Navbar } from '../components/navbar';
import { cn } from '@vegaprotocol/ui-toolkit';
import {
  ProtocolUpgradeCountdownMode,
  ProtocolUpgradeInProgressNotification,
  ProtocolUpgradeProposalNotification,
} from '@vegaprotocol/proposals';
import { Telemetry } from '../components/telemetry';
import { SSRLoader } from './ssr-loader';
import { PartyActiveOrdersHandler } from './party-active-orders-handler';
import { MaybeConnectEagerly } from './maybe-connect-eagerly';
import { TransactionHandlers } from './transaction-handlers';
import { useT } from '../lib/use-t';
import { NodeHealthContainer } from '../components/node-health';
import dynamic from 'next/dynamic';
import type { createWalletBackend as createWalletBackendType } from '@vegaprotocol/browser-wallet-backend';

const createBrowserWalletBackendLoader = (
  createWalletBackend: typeof createWalletBackendType
) => {
  return function BrowserWalletBackendLoader({
    children,
  }: {
    children: React.ReactNode;
  }) {
    useEffect(() => {
      createWalletBackend({
        node: new URL('https://api.n06.testnet.vega.rocks/graphql'),
      });
    }, []);
    return <>{children}</>;
  };
};

export const BrowserWalletBackend = dynamic(
  () =>
    import('@vegaprotocol/browser-wallet-backend').then(
      ({ createWalletBackend }) => {
        return createBrowserWalletBackendLoader(createWalletBackend);
      }
    ),
  {
    ssr: false,
  }
);

const Title = () => {
  const t = useT();
  const DEFAULT_TITLE = t('Welcome to Vega trading!');
  const { pageTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
  }));
  const envTriggerMapping = useEnvTriggerMapping();
  const { VEGA_ENV } = useEnvironment();
  const networkName = envTriggerMapping[VEGA_ENV];
  const title = useMemo(() => {
    if (!pageTitle) return DEFAULT_TITLE;
    if (networkName) return `${pageTitle} [${networkName}]`;
    return pageTitle;
  }, [pageTitle, networkName, DEFAULT_TITLE]);
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

function AppBody({ Component }: AppProps) {
  const location = useLocation();
  const gridClasses = cn(
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
        <Navbar />
        <div data-testid="banners">
          <ProtocolUpgradeProposalNotification
            mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
          />
          <ProtocolUpgradeInProgressNotification />
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
      <div className="hidden lg:block absolute bottom-1.5 pb-px right-2 z-10">
        <NodeHealthContainer />
      </div>
    </div>
  );
}

function VegaTradingApp(props: AppProps) {
  const status = useEnvironment((store) => store.status);
  const [nodeSwitcherOpen, setNodeSwitcher] = useNodeSwitcherStore((store) => [
    store.dialogOpen,
    store.setDialogOpen,
  ]);

  // Start validation of env vars and determine API_NODE
  useInitializeEnv();

  // Prevent HashRouter from being server side rendered as it
  // relies on presence of document object
  //
  // This is the last point at which we get pre-generated
  // HTML so render a ssr friendly loader component
  if (status === 'default') {
    return <SSRLoader />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <BrowserWalletBackend>
        <HashRouter>
          <Bootstrapper>
            <AppBody {...props} />
          </Bootstrapper>
          <NodeSwitcherDialog
            open={nodeSwitcherOpen}
            setOpen={setNodeSwitcher}
          />
        </HashRouter>
      </BrowserWalletBackend>
    </Suspense>
  );
}

export default VegaTradingApp;
