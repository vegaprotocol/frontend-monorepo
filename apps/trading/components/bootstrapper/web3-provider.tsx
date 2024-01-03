import type { DefaultWeb3ProviderContextShape } from '@vegaprotocol/web3';
import {
  useEthereumConfig,
  createConnectors,
  Web3Provider as Web3ProviderInternal,
  useWeb3ConnectStore,
  createDefaultProvider,
} from '@vegaprotocol/web3';
import {
  AppFailure,
  AppLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { DataLoader } from './data-loader';
import { useT } from '../../lib/use-t';

export const Web3Provider = ({
  children,
  skeleton,
  failure,
}: {
  children: ReactNode;
  skeleton: ReactNode;
  failure: ReactNode;
}) => {
  const { config, loading, error } = useEthereumConfig();
  const { ETHEREUM_PROVIDER_URL, ETH_LOCAL_PROVIDER_URL, ETH_WALLET_MNEMONIC } =
    useEnvironment();

  const connectors = useWeb3ConnectStore((store) => store.connectors);
  const initializeConnectors = useWeb3ConnectStore((store) => store.initialize);
  const [defaultProvider, setDefaultProvider] = useState<
    DefaultWeb3ProviderContextShape['provider'] | undefined
  >(undefined);

  const t = useT();

  useEffect(() => {
    if (config?.chain_id) {
      initializeConnectors(
        createConnectors(
          ETHEREUM_PROVIDER_URL,
          Number(config?.chain_id),
          ETH_LOCAL_PROVIDER_URL,
          ETH_WALLET_MNEMONIC
        ),
        Number(config.chain_id)
      );
      const defaultProvider = createDefaultProvider(
        ETHEREUM_PROVIDER_URL,
        Number(config?.chain_id)
      );
      setDefaultProvider(defaultProvider);
    }
  }, [
    config?.chain_id,
    ETHEREUM_PROVIDER_URL,
    initializeConnectors,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  ]);

  if (error) {
    return <>{failure}</>;
  }

  if (loading || !connectors.length) {
    return <>{skeleton}</>;
  }

  return (
    <DataLoader
      skeleton={<AppLoader />}
      failure={
        <AppFailure
          title={t('Could not load market or asset data')}
          error={error}
        />
      }
    >
      <Web3ProviderInternal
        connectors={connectors}
        defaultProvider={defaultProvider}
      >
        <>{children}</>
      </Web3ProviderInternal>
    </DataLoader>
  );
};
