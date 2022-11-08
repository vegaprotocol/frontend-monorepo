import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useRoutes } from 'react-router-dom';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from './lib/apollo-client';

import '../styles.scss';
import { Navbar } from './components/navbar';

import { routerConfig } from './routes/router-config';

const AppRouter = () => useRoutes(routerConfig);

export function App() {
  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value="light">
        <NetworkLoader createClient={createClient}>
          <div className="max-h-full min-h-full bg-white">
            <Navbar />
            <AppRouter />
          </div>
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
