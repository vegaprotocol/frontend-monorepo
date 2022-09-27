import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import {
  EnvironmentProvider,
  NetworkLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { createClient } from './lib/apollo-client';
import { ENV } from './config/env';
import { ContractsProvider } from './config/contracts/contracts-provider';
import { useContracts } from './config/contracts/contracts-context';
import { AddSignerForm, RemoveSignerForm } from './components';

function App() {
  const { VEGA_ENV } = useEnvironment();
  const { config, loading, error } = useEthereumConfig();
  const { multisig } = useContracts();
  const [validSignerCount, setValidSignerCount] = React.useState(undefined);

  useEffect(() => {
    Sentry.init({
      dsn: ENV.dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: VEGA_ENV,
    });
  }, [VEGA_ENV]);

  useEffect(() => {
    (async () => {
      try {
        const res = await multisig.get_valid_signer_count();
        setValidSignerCount(res);
      } catch (err) {
        Sentry.captureException(err);
      }
    })();
  }, [multisig]);

  return (
    <div className="grid min-h-full items-center">
      <AsyncRenderer loading={loading} data={config} error={error}>
        <div className="max-w-6xl">
          <h1>Multisig signer</h1>
          <p>
            Multisig contract address:{' '}
            {config?.multisig_control_contract?.address}
          </p>
          <p>Valid signer count: {validSignerCount}</p>

          <AddSignerForm />
          <RemoveSignerForm />
        </div>
      </AsyncRenderer>
    </div>
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
