import * as Sentry from '@sentry/react';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { BrowserTracing } from '@sentry/tracing';
import {
  NetworkLoader,
  useEnvironment,
  useInitializeEnv,
} from '@vegaprotocol/environment';
import { AsyncRenderer, Button, Lozenge } from '@vegaprotocol/ui-toolkit';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useWeb3Disconnect } from '@vegaprotocol/web3';
import { useEthereumConfig, Web3Provider } from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/i18n';
import { ENV } from './config/env';
import { ContractsProvider } from './config/contracts/contracts-provider';
import {
  AddSignerForm,
  RemoveSignerForm,
  Header,
  ContractDetails,
} from './components';
import { Web3Connector } from './components/web3-connector';
import { EthWalletContainer } from './components/eth-wallet-container';
import { useWeb3React } from '@web3-react/core';
import type { InMemoryCacheConfig } from '@apollo/client';
import { connectors } from './config/web3-connectors';

const pageWrapperClasses = classnames(
  'min-h-screen w-screen',
  'grid grid-rows-[auto,1fr]',
  'bg-white dark:bg-black',
  'text-neutral-900 dark:text-neutral-100'
);

const ConnectedApp = ({ config }: { config: EthereumConfig | null }) => {
  const { account } = useWeb3React();
  const disconnect = useWeb3Disconnect();
  return (
    <main className="w-full max-w-3xl px-5 justify-self-center">
      <h1>{t('Multisig signer')}</h1>
      <div className="mb-8">
        <p>
          Connected to Eth wallet: <Lozenge>{account}</Lozenge>
        </p>
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </div>
      <ContractDetails config={config} />
      <h2>{t('Add or remove signer')}</h2>
      <AddSignerForm />
      <RemoveSignerForm />
    </main>
  );
};

function App() {
  const { VEGA_ENV } = useEnvironment();
  const { config, loading, error } = useEthereumConfig();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    Sentry.init({
      dsn: ENV.dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: VEGA_ENV,
    });
  }, [VEGA_ENV]);

  return (
    <AsyncRenderer loading={loading} data={config} error={error}>
      <Web3Provider connectors={connectors}>
        <Web3Connector dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}>
          <EthWalletContainer
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
          >
            <ContractsProvider>
              <div className={pageWrapperClasses}>
                <Header />
                <ConnectedApp config={config} />
              </div>
            </ContractsProvider>
          </EthWalletContainer>
        </Web3Connector>
      </Web3Provider>
    </AsyncRenderer>
  );
}

const Wrapper = () => {
  const cache: InMemoryCacheConfig = {
    typePolicies: {
      Query: {},
      Account: {
        keyFields: false,
        fields: {
          balanceFormatted: {},
        },
      },
      Node: {
        keyFields: false,
      },
    },
  };
  useInitializeEnv();
  return (
    <NetworkLoader cache={cache}>
      <App />
    </NetworkLoader>
  );
};

export default Wrapper;
