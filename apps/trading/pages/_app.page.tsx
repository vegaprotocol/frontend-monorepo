import { useMemo, useState } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { t } from '@vegaprotocol/i18n';
import {
  useEagerConnect as useVegaEagerConnect,
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
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import './styles.css';
import { usePageTitleStore } from '../stores';
import DialogsContainer from './dialogs-container';
import ToastsManager from './toasts-manager';
import { HashRouter, useSearchParams } from 'react-router-dom';
import { Connectors } from '../lib/vega-connectors';
import { AppLoader, DynamicLoader } from '../components/app-loader';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { useTelemetryApproval } from '../lib/hooks/use-telemetry-approval';

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
  return (
    <div className="font-alpha h-full bg-white dark:bg-vega-cdark-900 text-default">
      <Head>
        {/* Cannot use meta tags in _document.page.tsx see https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Title />
      <Component />
      <DialogsContainer />
      <ToastsManager />
      <InitializeHandlers />
      <MaybeConnectEagerly />
      <PartyData />
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
    return <DynamicLoader />;
  }

  return (
    <HashRouter>
      <AppLoader>
        <AppBody {...props} />
      </AppLoader>
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
  useVegaEagerConnect(Connectors);
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
  return null;
};
