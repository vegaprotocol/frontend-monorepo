import { UNSAFE_LocationContext } from 'react-router-dom';
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

TimeAgo.addDefaultLocale(en);

function App() {
  return (
    // @ts-ignore -- https://github.com/remix-run/react-router/issues/7375#issuecomment-975431736
    // eslint-disable-next-line react/jsx-pascal-case
    <UNSAFE_LocationContext.Provider value={null}>
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
    </UNSAFE_LocationContext.Provider>
  );
}

export default App;
