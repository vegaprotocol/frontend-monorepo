import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createClient } from './lib/apollo-client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
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
import LocalContext from './context/local-context';
import useLocalValues from './hooks/use-local-values';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const localValues = useLocalValues(toggleTheme);
  const {
    vegaWalletDialog,
    menu: { setMenuOpen },
  } = localValues;
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location, setMenuOpen]);

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <NetworkLoader createClient={createClient}>
          <VegaWalletProvider>
            <LocalContext.Provider value={localValues}>
              <AppLoader>
                <div className="max-h-full min-h-full dark:bg-lite-black dark:text-white-60 bg-white text-black-60 grid grid-rows-[min-content,1fr]">
                  <Header />
                  <Main />
                  <VegaConnectDialog
                    connectors={Connectors}
                    dialogOpen={vegaWalletDialog.connect}
                    setDialogOpen={vegaWalletDialog.setConnect}
                  />
                  <VegaManageDialog
                    dialogOpen={vegaWalletDialog.manage}
                    setDialogOpen={vegaWalletDialog.setManage}
                  />
                </div>
              </AppLoader>
            </LocalContext.Provider>
          </VegaWalletProvider>
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
