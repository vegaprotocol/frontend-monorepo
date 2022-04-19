import './i18n';
import './app.scss';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppLoader } from './app-loader';
import { AppBanner } from './components/app-banner';
import { AppFooter } from './components/app-footer';
import { BalanceManager } from './components/balance-manager';
import { EthWallet } from './components/eth-wallet';
import { GraphQlProvider } from './components/graphql-provider';
import { TemplateSidebar } from './components/page-templates/template-sidebar';
import { TransactionModal } from './components/transactions-modal';
import { VegaWallet } from './components/vega-wallet';
import { Web3Connector } from './components/web3-connector';
import { AppStateProvider } from './contexts/app-state/app-state-provider';
import { ContractsProvider } from './contexts/contracts/contracts-provider';
import { AppRouter } from './routes';
import { Web3Provider } from '@vegaprotocol/web3';
import { Connectors } from './lib/web3-connectors';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { VegaWalletProvider } from '@vegaprotocol/wallet';

function App() {
  const sideBar = React.useMemo(() => [<EthWallet />, <VegaWallet />], []);
  return (
    <GraphQlProvider>
      <Router>
        <Web3Provider connectors={Connectors}>
          <Web3Connector>
            <VegaWalletProvider>
              <ContractsProvider>
                <AppStateProvider>
                  <AppLoader>
                    <BalanceManager>
                      <div className="app dark">
                        <AppBanner />
                        <TemplateSidebar sidebar={sideBar}>
                          <AppRouter />
                        </TemplateSidebar>
                        <AppFooter />
                      </div>
                      <VegaWalletDialogs />
                      <TransactionModal />
                    </BalanceManager>
                  </AppLoader>
                </AppStateProvider>
              </ContractsProvider>
            </VegaWalletProvider>
          </Web3Connector>
        </Web3Provider>
      </Router>
    </GraphQlProvider>
  );
}

export default App;
