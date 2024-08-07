import { useEffect } from 'react';
import { MemoryRouter as Router } from 'react-router-dom';

import { GlobalErrorBoundary } from '@/components/global-error-boundary';
import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
// import { NetworkProvider } from '@/contexts/network/network-provider';
// import { useListenForActiveTab } from '@/hooks/listen-for-active-tab';
// import { useListenForPopups } from '@/hooks/listen-for-popups';
// import { usePing } from '@/hooks/ping';
import { usePreventWindowResize } from '@/hooks/prevent-window-resize';
import { useGlobalsStore } from '@/stores/globals';

import { CONSTANTS } from './lib/constants';
import { Routing } from './routes';

export const locators = {
  appWrapper: 'app-wrapper',
};

function App() {
  // useListenForActiveTab();
  // useListenForPopups();
  // usePing();
  usePreventWindowResize();
  const isDesktop = useGlobalsStore((state) => !state.isMobile);
  // Firefox android, firefox and chrome all have different ways of handling the viewport height.
  // this allows us to set the min-height of the body to the correct value for desktop
  // in mobile the height is the available screen height by default, so we cannot set min height
  // for smaller screen would end up with scroll.
  useEffect(() => {
    const minHeight = document.body.style.minHeight;
    if (isDesktop) {
      document.body.style.minHeight = `${CONSTANTS.defaultHeight}px`;
      document.body.style.width = `100vw`;
    }
    return () => {
      document.body.style.minHeight = minHeight;
    };
  }, [isDesktop]);
  return (
    <Router>
      <GlobalErrorBoundary>
        <JsonRPCProvider>
          {/* <NetworkProvider> */}
          <main
            data-testid={locators.appWrapper}
            className="w-full h-full bg-black font-alpha text-vega-dark-400 overflow-hidden"
          >
            <Routing />
          </main>
          {/* </NetworkProvider> */}
        </JsonRPCProvider>
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;
