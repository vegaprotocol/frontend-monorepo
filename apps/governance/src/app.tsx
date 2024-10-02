import './i18n';

import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppLoader } from './app-loader';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { BalanceManager } from './components/balance-manager';
import { EthWallet } from './components/eth-wallet';
import { AppLayout } from './components/page-templates/app-layout';
import { TemplateSidebar } from './components/page-templates/template-sidebar';
import { TransactionModal } from './components/transactions-modal';
import { VegaWallet } from './components/vega-wallet';
import { Web3Connector } from './components/web3-connector';
import { AppStateProvider } from './contexts/app-state/app-state-provider';
import { ContractsProvider } from './contexts/contracts/contracts-provider';
import { AppRouter } from './routes';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { WithdrawalApprovalDialogContainer } from '@vegaprotocol/web3';
import {
  createConnectors,
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';
import { Web3Provider } from '@vegaprotocol/web3';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { WalletProvider } from '@vegaprotocol/wallet-react';
import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import { AsyncRenderer, TooltipProvider } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
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
import { ToastsManager } from './toasts-manager';
import { useTranslation } from 'react-i18next';
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

const Web3Container = ({
  chainId,
}: {
  /** Ethereum chain id */
  chainId: number;
  /** Ethereum provider url */
  providerUrl: string;
}) => {
  const [connectors, initializeConnectors] = useWeb3ConnectStore((store) => [
    store.connectors,
    store.initialize,
  ]);
  const {
    API_NODE,
    ETHEREUM_PROVIDER_URL,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  } = useEnvironment();

  useEffect(() => {
    if (chainId) {
      return initializeConnectors(
        createConnectors(
          ETHEREUM_PROVIDER_URL,
          Number(chainId),
          ETH_LOCAL_PROVIDER_URL,
          ETH_WALLET_MNEMONIC
        ),
        [Number(chainId)]
      );
    }
  }, [
    chainId,
    ETHEREUM_PROVIDER_URL,
    initializeConnectors,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  ]);

  const vegaWalletConfig = useVegaWalletConfig();

  if (!vegaWalletConfig || connectors.length === 0) {
    // Prevent loading when the connectors are not initialized
    return <Loader />;
  }

  return (
    <Web3Provider connectors={connectors}>
      <Web3Connector connectors={connectors} chainId={Number(chainId)}>
        <WalletProvider config={vegaWalletConfig} node={API_NODE?.restApiUrl}>
          <ContractsProvider>
            <AppLoader>
              <BalanceManager>
                <>
                  <AppLayout>
                    <TemplateSidebar sidebar={[<EthWallet />, <VegaWallet />]}>
                      <AppRouter />
                    </TemplateSidebar>
                    <footer className="p-4 break-all text-surface-0-fg-muted border-t border-gs-700">
                      <NetworkInfo />
                    </footer>
                  </AppLayout>
                  <ToastsManager />
                  <InitializeHandlers />
                  <VegaWalletDialogs />
                  <TransactionModal />
                  <CreateWithdrawalDialog />
                  <WithdrawalApprovalDialogContainer />
                </>
              </BalanceManager>
            </AppLoader>
          </ContractsProvider>
        </WalletProvider>
      </Web3Connector>
    </Web3Provider>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the magic for React Router Dom v6
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
    });
  }, [pathname]);

  return null;
};

const AppContainer = () => {
  const { config, loading, error } = useEthereumConfig();
  const { API_NODE, ETHEREUM_PROVIDER_URL } = useEnvironment();
  const { t } = useTranslation();
  const [nodeSwitcherOpen, setNodeSwitcher] = useNodeSwitcherStore((store) => [
    store.dialogOpen,
    store.setDialogOpen,
  ]);

  // Hacky skip all the loading & web3 init for geo restricted users
  const isRestricted = document?.location?.pathname?.includes('/restricted');

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
        <div className="min-h-full grid">
          <NodeGuard
            skeleton={<div>{t('Loading')}</div>}
            failure={
              <NodeFailure
                title={t('NodeUnsuitable', { url: API_NODE?.graphQLApiUrl })}
              />
            }
          >
            <AsyncRenderer<EthereumConfig | null>
              loading={loading}
              data={config}
              error={error}
              render={(cnf) =>
                cnf && (
                  <Web3Container
                    chainId={Number(cnf.chain_id)}
                    providerUrl={ETHEREUM_PROVIDER_URL}
                  />
                )
              }
            />
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
    <React.Suspense fallback={<Loader />}>
      <TooltipProvider>
        <NetworkLoader cache={cache}>
          <AppContainer />
        </NetworkLoader>
      </TooltipProvider>
    </React.Suspense>
  );
}

export default App;
