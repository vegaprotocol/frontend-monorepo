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
import { t } from '@vegaprotocol/react-helpers';
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
            <div className="h-full max-h-full dark:bg-black dark:text-white-60 bg-white text-black-60 grid md:grid-rows-[min-content_1fr_min-content] lg:grid-cols-[375px_1fr] md:grid-cols-[200px_1fr] sm:grid-rows-[min-content_min-content_1fr_min-content]">
              <div className="flex items-stretch border-b-[7px] border-vega-yellow md:col-span-3">
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

              <aside className="md:col-start-1 md:col-end-1 md:row-start-2 md:row-end-2">
                <ul>
                  <li>{t('Markets')}</li>
                  <li>{t('Trade')}</li>
                  <li>{t('Liquid')}</li>
                  <li>{t('Markets')}</li>
                </ul>
              </aside>
              <div className="md:col-start-2 md:col-end-2 md:row-start-2 md:row-end-2 overflow-auto">
                <SimpleMarketList />
                {/*<DealTicketContainer
                    marketId={
                      '0e4c4e0ce6626ea5c6bf5b5b510afadb3c91627aa9ff61e4c7e37ef8394f2c6f'
                    }
                  />*/}
              </div>

              <footer className="md:col-span-3">®</footer>
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
