import { ApolloProvider } from '@apollo/client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import React from 'react';
import { DATA_SOURCES } from './config';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();

  const client = React.useMemo(
    () => createClient(DATA_SOURCES.dataNodeUrl),
    []
  );

  return (
    <ThemeContext.Provider value={theme}>
      <TendermintWebsocketProvider>
        <ApolloProvider client={client}>
          <div className="antialiased m-0 bg-white dark:bg-black text-black dark:text-white ">
            <div className="min-h-[100vh] max-w-[1300px] grid grid-rows-[auto_minmax(700px,_1fr)] grid-cols-[300px_minmax(auto,_1fr)] border-b-1 border-black dark:border-white lg:border-l-1 lg:border-r-1 mx-auto">
              <Nav />
              <Header toggleTheme={toggleTheme} />
              <Main />
            </div>
          </div>
        </ApolloProvider>
      </TendermintWebsocketProvider>
    </ThemeContext.Provider>
  );
}

export default App;
