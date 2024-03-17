import './i18n';

import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLoader } from './app-loader';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { BalanceManager } from './components/balance-manager';
import { EthWallet } from './components/eth-wallet';
import { AppLayout } from './components/page-templates/app-layout';
import { TemplateSidebar } from './components/page-templates/template-sidebar';
import { TransactionModal } from './components/transactions-modal';
import { VegaWallet } from './components/vega-wallet';
import { ScrollToTop } from './components/scroll-to-top';
import { AppStateProvider } from './contexts/app-state/app-state-provider';
import { ContractsProvider } from './contexts/contracts/contracts-provider';
import { AppRouter } from './routes';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import {
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
} from '@vegaprotocol/web3';
import { Web3Provider } from '@vegaprotocol/web3';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { WalletProvider } from '@vegaprotocol/wallet-react';
import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import {
  useEnvironment,
  NetworkLoader,
  NodeGuard,
  NodeSwitcherDialog,
  useNodeSwitcherStore,
  NodeFailure,
  AppLoader as Loader,
  useInitializeEnv,
} from '@vegaprotocol/environment';
import type { InMemoryCacheConfig } from '@apollo/client';
import { CreateWithdrawalDialog } from '@vegaprotocol/withdraws';
import { SplashLoader } from './components/splash-loader';
import { ToastsManager } from './toasts-manager';
import { TelemetryDialog } from './components/telemetry-dialog/telemetry-dialog';
import { useTranslation } from 'react-i18next';
import { useSentryInit } from './hooks/use-sentry-init';
import { useVegaWalletConfig } from './hooks/use-vega-wallet-config';

const cache: InMemoryCacheConfig = {
  typePolicies: {
    Account: {
      keyFields: false,
    },
    Instrument: {
      keyFields: ['code'],
    },
    Delegation: {
      keyFields: false,
      // Only get full updates
      merge(_, incoming) {
        return incoming;
      },
    },
    Reward: {
      keyFields: false,
    },
    RewardPerAssetDetail: {
      keyFields: false,
    },
    Node: {
      keyFields: false,
    },
    NodeData: {
      merge: (existing = {}, incoming) => {
        return { ...existing, ...incoming };
      },
    },
    Withdrawal: {
      fields: {
        pendingOnForeignChain: {
          read: (isPending = false) => isPending,
        },
      },
    },
  },
};

const Web3Container = () => {
  const vegaWalletConfig = useVegaWalletConfig();

  if (!vegaWalletConfig) {
    // Prevent loading when the connectors are not initialized
    return <SplashLoader />;
  }

  return (
    <Web3Provider>
      <WalletProvider config={vegaWalletConfig}>
        <ContractsProvider>
          <AppLoader>
            <>
              <AppLayout>
                <TemplateSidebar
                  sidebar={
                    <>
                      <EthWallet />
                      <VegaWallet />
                    </>
                  }
                >
                  <AppRouter />
                </TemplateSidebar>
                <footer className="p-4 break-all border-t border-neutral-700">
                  <NetworkInfo />
                </footer>
              </AppLayout>
              <BalanceManager />
              <ToastsManager />
              <InitializeHandlers />
              <VegaWalletDialogs />
              <TransactionModal />
              <CreateWithdrawalDialog />
              <WithdrawalApprovalDialogContainer />
              <TelemetryDialog />
              <Web3ConnectUncontrolledDialog />
            </>
          </AppLoader>
        </ContractsProvider>
      </WalletProvider>
    </Web3Provider>
  );
};

const AppContainer = () => {
  const { VEGA_URL } = useEnvironment();
  const { t } = useTranslation();
  const [nodeSwitcherOpen, setNodeSwitcher] = useNodeSwitcherStore((store) => [
    store.dialogOpen,
    store.setDialogOpen,
  ]);

  // Hacky skip all the loading & web3 init for geo restricted users
  const isRestricted = document?.location?.pathname?.includes('/restricted');

  useSentryInit();

  if (isRestricted) {
    return (
      <Router>
        <AppRouter />
      </Router>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <AppStateProvider>
        <div className="min-h-full text-white grid">
          <NodeGuard
            skeleton={<div>{t('Loading')}</div>}
            failure={
              <NodeFailure title={t('NodeUnsuitable', { url: VEGA_URL })} />
            }
          >
            <Web3Container />
          </NodeGuard>
        </div>
      </AppStateProvider>
      <NodeSwitcherDialog open={nodeSwitcherOpen} setOpen={setNodeSwitcher} />
    </Router>
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

function App() {
  useInitializeEnv();

  return (
    <Suspense fallback={<Loader />}>
      <NetworkLoader cache={cache}>
        <AppContainer />
      </NetworkLoader>
    </Suspense>
  );
}

export default App;
