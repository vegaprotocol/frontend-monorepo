import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { createClient } from './lib/apollo-client';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <TendermintWebsocketProvider>
          <NetworkLoader createClient={createClient}>
            <div
              className={`${
                menuOpen && 'h-[100vh] overflow-hidden'
              } antialiased m-0 bg-white dark:bg-black text-black dark:text-white`}
            >
              <div className="min-h-[100vh] max-w-[1300px] grid grid-rows-[repeat(2,_auto)_1fr] grid-cols-[1fr] md:grid-rows-[auto_minmax(700px,_1fr)] md:grid-cols-[300px_1fr] border-black dark:border-white lg:border-l-1 lg:border-r-1 mx-auto">
                <Header
                  toggleTheme={toggleTheme}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                />
                <Nav menuOpen={menuOpen} />
                <Main />
                <footer className="grid grid-rows-2 grid-cols-[1fr_auto] md:flex md:col-span-2 p-16 gap-12 border-t-1">
                  <NetworkInfo />
                </footer>
              </div>
            </div>
          </NetworkLoader>
        </TendermintWebsocketProvider>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
