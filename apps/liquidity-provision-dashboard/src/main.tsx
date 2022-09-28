import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { createClient } from './app/lib/apollo-client';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';

import App from './app/app';

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(
  <StrictMode>
    <EnvironmentProvider>
      <ThemeContext.Provider value="light">
        <NetworkLoader createClient={createClient}>
          <App />
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  </StrictMode>
);
