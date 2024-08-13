import { createWalletBackend } from '@vegaprotocol/browser-wallet-backend';
import { MemoryRouter as Router } from 'react-router-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';
import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { NetworkProvider } from '@/contexts/network/network-provider';
import { Routing } from './routes';

export const locators = {
  appWrapper: 'app-wrapper',
};
createWalletBackend();
TimeAgo.addDefaultLocale(en);

function App() {
  return (
    <Router>
      <GlobalErrorBoundary>
        <JsonRPCProvider>
          <NetworkProvider>
            <main
              data-testid={locators.appWrapper}
              className="w-full h-full bg-black font-alpha text-vega-dark-400 overflow-hidden"
            >
              <Routing />
            </main>
          </NetworkProvider>
        </JsonRPCProvider>
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;
