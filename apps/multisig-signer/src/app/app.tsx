import * as Sentry from '@sentry/react';
import classnames from 'classnames';
import { useEffect } from 'react';
import { BrowserTracing } from '@sentry/tracing';
import {
  EnvironmentProvider,
  NetworkLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';
import { ENV } from './config/env';
import { ContractsProvider } from './config/contracts/contracts-provider';
import {
  AddSignerForm,
  RemoveSignerForm,
  Header,
  ContractDetails,
} from './components';

const pageWrapperClasses = classnames(
  'min-h-screen w-screen',
  'grid grid-rows-[auto,1fr]',
  'bg-white dark:bg-black',
  'text-neutral-900 dark:text-neutral-100'
);

function App() {
  const { VEGA_ENV } = useEnvironment();
  const { config, loading, error } = useEthereumConfig();
  const [theme, toggleTheme] = useThemeSwitcher();

  useEffect(() => {
    Sentry.init({
      dsn: ENV.dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: VEGA_ENV,
    });
  }, [VEGA_ENV]);

  return (
    <ThemeContext.Provider value={theme}>
      <div className={pageWrapperClasses}>
        <AsyncRenderer loading={loading} data={config} error={error}>
          <Header theme={theme} toggleTheme={toggleTheme} />
          <main className="w-full max-w-3xl px-5 justify-self-center">
            <h1>Multisig signer</h1>
            <ContractDetails config={config} />
            <h2>Add or remove signer</h2>
            <AddSignerForm />
            <RemoveSignerForm />
          </main>
        </AsyncRenderer>
      </div>
    </ThemeContext.Provider>
  );
}

const Wrapper = () => {
  return (
    <EnvironmentProvider>
      <NetworkLoader createClient={createClient}>
        <ContractsProvider>
          <App />
        </ContractsProvider>
      </NetworkLoader>
    </EnvironmentProvider>
  );
};

export default Wrapper;
