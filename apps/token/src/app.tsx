import './i18n';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLoader } from './app-loader';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { BalanceManager } from './components/balance-manager';
import { EthWallet } from './components/eth-wallet';
import { TemplateSidebar } from './components/page-templates/template-sidebar';
import { TransactionModal } from './components/transactions-modal';
import { VegaWallet } from './components/vega-wallet';
import { Web3Connector } from './components/web3-connector';
import { AppStateProvider } from './contexts/app-state/app-state-provider';
import { ContractsProvider } from './contexts/contracts/contracts-provider';
import { AppRouter } from './routes';
import { Web3Provider } from '@vegaprotocol/web3';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import {
  useEnvironment,
  EnvironmentProvider,
  NetworkLoader,
} from '@vegaprotocol/environment';
import { createClient } from './lib/apollo-client';
import { createConnectors } from './lib/web3-connectors';
import type { EthereumConfig } from '@vegaprotocol/web3';

const Web3Container = ({
  chainId,
  providerUrl,
}: {
  chainId: number;
  providerUrl: string;
}) => {
  const sideBar = React.useMemo(() => {
    return [<EthWallet />, <VegaWallet />];
  }, []);
  const Connectors = React.useMemo(() => {
    return createConnectors(providerUrl, Number(chainId));
  }, [chainId, providerUrl]);
  return (
    <Web3Provider connectors={Connectors}>
      <Web3Connector connectors={Connectors} chainId={Number(chainId)}>
        <VegaWalletProvider>
          <ContractsProvider>
            <AppLoader>
              <BalanceManager>
                <>
                  <div className="app w-full max-w-[1300px] mx-auto grid grid-rows-[1fr_min-content] min-h-full border-neutral-700 lg:border-l lg:border-r lg:text-body-large">
                    <TemplateSidebar sidebar={sideBar}>
                      <AppRouter />
                    </TemplateSidebar>
                    <footer className="p-4 border-t border-neutral-700">
                      <NetworkInfo />
                    </footer>
                  </div>
                  <VegaWalletDialogs />
                  <TransactionModal />
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
  const { ETHEREUM_PROVIDER_URL } = useEnvironment();
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
  return (
    <EnvironmentProvider>
      <NetworkLoader createClient={createClient}>
        <AppContainer />
      </NetworkLoader>
    </EnvironmentProvider>
  );
}

export default App;
