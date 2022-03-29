import { ApolloProvider } from '@apollo/client';
import { createClient } from './lib/apollo-client';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import React from 'react';
import { DATA_SOURCES } from './config';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';

function App() {
  const client = React.useMemo(
    () => createClient(DATA_SOURCES.dataNodeUrl),
    []
  );
  return (
    <TendermintWebsocketProvider>
      <ApolloProvider client={client}>
        <div className="antialiased m-0 min-h-[100vh] max-w-[1300px] grid grid-rows-[1fr_min-content] bg-black text-white border-white lg:border-l-1 lg:border-r-1">
          <div className="grid grid-rows-[auto_minmax(700px,_1fr)] grid-cols-[300px_minmax(auto,_1fr)] border-b-1">
            <Nav />
            <Header />
            <Main />
          </div>
        </div>
      </ApolloProvider>
    </TendermintWebsocketProvider>
  );
}

export default App;
