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
import { VegaWalletConnectButton } from './components/vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Connectors } from './lib/vega-connectors';
import '../styles.scss';
import { AppLoader } from './components/app-loader';
import Logo from './components/icons/logo';
import Video from './components/video';
import Comet from './components/icons/comet';
import { Main } from './components/main';
import { DrawerToggle, DRAWER_TOGGLE_VARIANTS } from './components/drawer';
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
                <div className="flex items-stretch p-16 bg-black dark:bg-white text-white-60">
                  <div className="absolute top-0 right-[200px] w-[500px] h-[100px] z-0 hidden md:block">
                    <Video />
                    <div
                      id="swarm"
                      className="absolute w-[500px] h-[100px] bg-black dark:bg-white"
                    />
                  </div>
                  <Logo theme={theme} />
                  <Comet />
                  <div className="flex items-center gap-4 ml-auto mr-8">
                    <VegaWalletConnectButton
                      setConnectDialog={(open) =>
                        setVegaWallet((x) => ({ ...x, connect: open }))
                      }
                      setManageDialog={(open) =>
                        setVegaWallet((x) => ({ ...x, manage: open }))
                      }
                    />
                    <ThemeSwitcher
                      onToggle={toggleTheme}
                      className="-my-4"
                      sunClassName="text-white"
                    />
                  </div>
                  <DrawerToggle
                    onToggle={onToggle}
                    variant={DRAWER_TOGGLE_VARIANTS.OPEN}
                    className="xs:py-32 xs:px-16 xs:text-white xs:hover:text-blue"
                  />
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
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
