import './i18n';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { BrowserRouter as Router } from 'react-router-dom';
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
import {
  createConnectors,
  useEthTransactionManager,
  useEthWithdrawApprovalsManager,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';
import { Web3Provider } from '@vegaprotocol/web3';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import {
  useEnvironment,
  NetworkLoader,
  useInitializeEnv,
} from '@vegaprotocol/environment';
import { ENV } from './config';
import type { InMemoryCacheConfig } from '@apollo/client';
import { WithdrawalDialog } from '@vegaprotocol/withdraws';
import { SplashLoader } from './components/splash-loader';

const cache: InMemoryCacheConfig = {
  typePolicies: {
    Account: {
      keyFields: false,
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
  chainId: number;
  providerUrl: string;
}) => {
  const InitializeHandlers = () => {
    useEthTransactionManager();
    useEthWithdrawApprovalsManager();
    return null;
  };
  const [connectors, initializeConnectors] = useWeb3ConnectStore((store) => [
    store.connectors,
    store.initialize,
  ]);
  const { ETHEREUM_PROVIDER_URL, ETH_LOCAL_PROVIDER_URL, ETH_WALLET_MNEMONIC } =
    useEnvironment();
  useEffect(() => {
    if (chainId) {
      return initializeConnectors(
        createConnectors(
          ETHEREUM_PROVIDER_URL,
          Number(chainId),
          ETH_LOCAL_PROVIDER_URL,
          ETH_WALLET_MNEMONIC
        ),
        Number(chainId)
      );
    }
  }, [
    chainId,
    ETHEREUM_PROVIDER_URL,
    initializeConnectors,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  ]);
  const sideBar = React.useMemo(() => {
    return [<EthWallet />, <VegaWallet />];
  }, []);

  if (connectors.length === 0 && !('Cypress' in window)) {
    // Prevent loading when the connectors are not initialized
    return <SplashLoader />;
  }

  return (
    <Web3Provider connectors={connectors}>
      <Web3Connector connectors={connectors} chainId={Number(chainId)}>
        <VegaWalletProvider>
          <ContractsProvider>
            <AppLoader>
              <BalanceManager>
                <>
                  <AppLayout>
                    <TemplateSidebar sidebar={sideBar}>
                      <AppRouter />
                    </TemplateSidebar>
                    <footer className="p-4 border-t border-neutral-700">
                      <NetworkInfo />
                    </footer>
                  </AppLayout>
                  <InitializeHandlers />
                  <VegaWalletDialogs />
                  <TransactionModal />
                  <WithdrawalDialog />
                </>
              </BalanceManager>
            </AppLoader>
          </ContractsProvider>
        </VegaWalletProvider>
      </Web3Connector>
    </Web3Provider>
  );
};

const AppContainer = () => {
  const { config, loading, error } = useEthereumConfig();
  const { VEGA_ENV, GIT_COMMIT_HASH, GIT_BRANCH, ETHEREUM_PROVIDER_URL } =
    useEnvironment();

  useEffect(() => {
    if (ENV.dsn) {
      Sentry.init({
        dsn: ENV.dsn,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 0.1,
        enabled: true,
        environment: VEGA_ENV,
        release: GIT_COMMIT_HASH,
        beforeSend(event) {
          if (event.request?.url?.includes('/claim?')) {
            return {
              ...event,
              request: {
                ...event.request,
                url: event.request?.url.split('?')[0],
              },
            };
          }
          return event;
        },
      });
      Sentry.setTag('branch', GIT_BRANCH);
      Sentry.setTag('commit', GIT_COMMIT_HASH);
    }
  }, [GIT_COMMIT_HASH, GIT_BRANCH, VEGA_ENV]);

  return (
    <Router>
      <AppStateProvider>
        <div className="grid min-h-full text-white">
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
        </div>
      </AppStateProvider>
    </Router>
  );
};

function App() {
  useInitializeEnv();

  return (
    <NetworkLoader cache={cache}>
      <AppContainer />
    </NetworkLoader>
  );
}

export default App;
