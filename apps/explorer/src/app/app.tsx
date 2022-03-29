import './App.scss';

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
        <div className="app">
          <div className="template-sidebar">
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
