import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { DATA_SOURCES } from './config';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const client = useMemo(() => createClient(DATA_SOURCES.dataNodeUrl), []);

  return (
    <ThemeContext.Provider value={theme}>
      <TendermintWebsocketProvider>
        <ApolloProvider client={client}>
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
            </div>
          </div>
        </ApolloProvider>
      </TendermintWebsocketProvider>
    </ThemeContext.Provider>
  );
}

export default App;
