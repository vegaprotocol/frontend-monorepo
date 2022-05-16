import { useState, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';
import { DATA_SOURCES } from './config';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
// import { DealTicketContainer } from './components/deal-ticket';
import { VegaWalletConnectButton } from './components/vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Connectors } from './lib/vega-connectors';
import '../styles.scss';
import { AppLoader } from './components/app-loader';
import SimpleMarketList from './components/simple-market-list';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const [vegaWallet, setVegaWallet] = useState({
    connect: false,
    manage: false,
  });

  const client = useMemo(() => createClient(DATA_SOURCES.dataNodeUrl), []);

  return (
    <ThemeContext.Provider value={theme}>
      <ApolloProvider client={client}>
        <VegaWalletProvider>
          <AppLoader>
            <div className="min-h-full dark:bg-black dark:text-white-60 bg-white text-black-60 flex flex-col flex-1">
              <div className="flex items-stretch border-b-[7px] border-vega-yellow">
                <div className="flex items-center gap-4 ml-auto mr-8">
                  <VegaWalletConnectButton
                    setConnectDialog={(open) =>
                      setVegaWallet((x) => ({ ...x, connect: open }))
                    }
                    setManageDialog={(open) =>
                      setVegaWallet((x) => ({ ...x, manage: open }))
                    }
                  />
                  <ThemeSwitcher onToggle={toggleTheme} className="-my-4" />
                </div>
              </div>
              <main className="flex grow">
                <aside className="md:w-1/5 lg:w-2/5 xl:w-1/5 mx-auto"></aside>
                <div className="md:w-4/5 lg:w-3/5 xl:w-4/5 mx-auto">
                  <SimpleMarketList />
                  {/*<DealTicketContainer
                    marketId={
                      '0e4c4e0ce6626ea5c6bf5b5b510afadb3c91627aa9ff61e4c7e37ef8394f2c6f'
                    }
                  />*/}
                </div>
              </main>
              <footer className="flex flex-shrink">®</footer>
              <VegaConnectDialog
                connectors={Connectors}
                dialogOpen={vegaWallet.connect}
                setDialogOpen={(open) =>
                  setVegaWallet((x) => ({ ...x, connect: open }))
                }
              />
              <VegaManageDialog
                dialogOpen={vegaWallet.manage}
                setDialogOpen={(open) =>
                  setVegaWallet((x) => ({ ...x, manage: open }))
                }
              />
            </div>
          </AppLoader>
        </VegaWalletProvider>
      </ApolloProvider>
    </ThemeContext.Provider>
  );
}

export default App;
