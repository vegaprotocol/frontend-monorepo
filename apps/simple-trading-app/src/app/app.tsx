import React, { useState, useMemo, useEffect } from 'react';
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
import { EnvironmentProvider } from '@vegaprotocol/network-switcher';
import { VegaWalletConnectButton } from './components/vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Connectors } from './lib/vega-connectors';
import '../styles.scss';
import { AppLoader } from './components/app-loader';
import { Main } from './components/main';
import { DrawerToggle, DRAWER_TOGGLE_VARIANTS } from './components/drawer';
import { useLocation } from 'react-router-dom';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const [vegaWallet, setVegaWallet] = useState({
    connect: false,
    manage: false,
  });

  const client = useMemo(() => createClient(DATA_SOURCES.dataNodeUrl), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const onToggle = () => setMenuOpen(!menuOpen);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <ApolloProvider client={client}>
          <VegaWalletProvider>
            <AppLoader>
              <div className="max-h-full min-h-full dark:bg-black dark:text-white-60 bg-white text-black-60 grid grid-rows-[min-content,1fr]">
                <div className="flex items-stretch border-b-[7px] border-vega-yellow">
                  <DrawerToggle
                    onToggle={onToggle}
                    variant={DRAWER_TOGGLE_VARIANTS.OPEN}
                    className="xs:py-32 xs:px-16"
                  />

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

                <Main isMenuOpen={menuOpen} onToggle={onToggle} />

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
    </EnvironmentProvider>
  );
}

export default App;
