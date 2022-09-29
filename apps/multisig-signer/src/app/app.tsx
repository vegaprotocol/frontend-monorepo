import * as Sentry from '@sentry/react';
import classnames from 'classnames';
import { useEffect, useMemo } from 'react';
import { BrowserTracing } from '@sentry/tracing';
import {
  EnvironmentProvider,
  NetworkLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig, Web3Provider } from '@vegaprotocol/web3';
import { ThemeContext, useThemeSwitcher, t } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';
import { ENV } from './config/env';
import { ContractsProvider } from './config/contracts/contracts-provider';
import {
  AddSignerForm,
  RemoveSignerForm,
  Header,
  ContractDetails,
} from './components';
import { createConnectors } from './lib/web3-connectors';
import { Web3Connector } from './components/web3-connector';

const pageWrapperClasses = classnames(
  'min-h-screen w-screen',
  'grid grid-rows-[auto,1fr]',
  'bg-white dark:bg-black',
  'text-neutral-900 dark:text-neutral-100'
);

function App() {
  const { VEGA_ENV, ETHEREUM_PROVIDER_URL } = useEnvironment();
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
  const Connectors = useMemo(() => {
    if (config?.chain_id) {
      return createConnectors(ETHEREUM_PROVIDER_URL, Number(config.chain_id));
    }
    return [];
  }, [config?.chain_id, ETHEREUM_PROVIDER_URL]);

  return (
    <ThemeContext.Provider value={theme}>
      <Web3Provider connectors={Connectors}>
        <Web3Connector>
          <div className={pageWrapperClasses}>
            <AsyncRenderer loading={loading} data={config} error={error}>
              <Header theme={theme} toggleTheme={toggleTheme} />
              <main className="w-full max-w-3xl px-5 justify-self-center">
                <h1>{t('Multisig signer')}</h1>
                <ContractDetails config={config} />
                <h2>{t('Add or remove signer')}</h2>
                <AddSignerForm />
                <RemoveSignerForm />
              </main>
            </AsyncRenderer>
          </div>
        </Web3Connector>
      </Web3Provider>
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
