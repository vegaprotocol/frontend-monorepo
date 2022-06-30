import { useState, useEffect } from 'react';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from './lib/apollo-client';
import {
  VegaConnectDialog,
  VegaManageDialog,
  VegaWalletProvider,
} from '@vegaprotocol/wallet';
import { Connectors } from './lib/vega-connectors';
import '../styles.scss';
import { AppLoader } from './components/app-loader';
import Header from './components/header';
import { Main } from './components/main';
import { useLocation } from 'react-router-dom';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const [vegaWallet, setVegaWallet] = useState({
    connect: false,
    manage: false,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const onToggle = () => setMenuOpen(!menuOpen);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <NetworkLoader createClient={createClient}>
          <VegaWalletProvider>
            <AppLoader>
              <div className="max-h-full min-h-full dark:bg-black dark:text-white-60 bg-white text-black-60 grid grid-rows-[min-content,1fr]">
                <Header
                  setVegaWallet={setVegaWallet}
                  toggleTheme={toggleTheme}
                />
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
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
