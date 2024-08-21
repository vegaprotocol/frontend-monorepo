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

function App({
  explorer,
  docs,
  governance,
  console,
  chainId,
}: {
  explorer: string;
  docs: string;
  governance: string;
  console: string;
  chainId: string;
}) {
  return (
    // @ts-ignore -- https://github.com/remix-run/react-router/issues/7375#issuecomment-975431736
    // eslint-disable-next-line react/jsx-pascal-case
    <UNSAFE_LocationContext.Provider value={null}>
      <Router>
        <GlobalErrorBoundary>
          <JsonRPCProvider>
            <NetworkProvider
              explorer={explorer}
              docs={docs}
              governance={governance}
              console={console}
              chainId={chainId}
            >
              <main
                data-testid={locators.appWrapper}
                className="w-full h-full bg-surface-0 text-surface-0-fg font-sans overflow-hidden"
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
