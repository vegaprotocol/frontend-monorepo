import './i18n';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppLoader } from './app-loader';
import { AppBanner } from './components/app-banner';
import { AppFooter } from './components/app-footer';
import { BalanceManager } from './components/balance-manager';
import { EthWallet } from './components/eth-wallet';
import { GraphQlProvider } from './components/graphql-provider';
import { TemplateSidebar } from './components/page-templates/template-sidebar';
import { VegaWallet } from './components/vega-wallet';
import { Web3Connector } from './components/web3-connector';
import { AppStateProvider } from './contexts/app-state/app-state-provider';
import { ContractsProvider } from './contexts/contracts/contracts-provider';
import { AppRouter } from './routes';
import { Web3Provider } from '@vegaprotocol/web3';
import { Connectors } from './lib/web3-connectors';
import { VegaWalletDialogs } from './components/vega-wallet-dialogs';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import { EnvironmentProvider } from '@vegaprotocol/react-helpers';

function App() {
  const sideBar = React.useMemo(() => [<EthWallet />, <VegaWallet />], []);
  return (
    <GraphQlProvider>
      <Router>
        <EnvironmentProvider>
          <AppStateProvider>
            <Web3Provider connectors={Connectors}>
              <Web3Connector>
                <VegaWalletProvider>
                  <ContractsProvider>
                    <AppLoader>
                      <BalanceManager>
                        <>
                          <div className="app dark max-w-[1300px] mx-auto my-0 grid grid-rows-[min-content_1fr_min-content] min-h-full lg:border-l-1 lg:border-r-1 lg:border-white font-sans text-body lg:text-body-large text-white-80">
                            <AppBanner />
                            <TemplateSidebar sidebar={sideBar}>
                              <AppRouter />
                            </TemplateSidebar>
                            <AppFooter />
                          </div>
                          <VegaWalletDialogs />
                        </>
                      </BalanceManager>
                    </AppLoader>
                  </ContractsProvider>
                </VegaWalletProvider>
              </Web3Connector>
            </Web3Provider>
          </AppStateProvider>
        </EnvironmentProvider>
      </Router>
    </GraphQlProvider>
  );
}

export default App;
