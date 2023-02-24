import {
  useEthereumConfig,
  createConnectors,
  Web3Provider as Web3ProviderInternal,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/utils';
import { useEnvironment } from '@vegaprotocol/environment';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { config, loading, error } = useEthereumConfig();
  const { ETHEREUM_PROVIDER_URL, ETH_LOCAL_PROVIDER_URL, ETH_WALLET_MNEMONIC } =
    useEnvironment();
  const [connectors, initializeConnectors] = useWeb3ConnectStore((store) => [
    store.connectors,
    store.initialize,
  ]);

  useEffect(() => {
    if (config?.chain_id) {
      return initializeConnectors(
        createConnectors(
          ETHEREUM_PROVIDER_URL,
          Number(config?.chain_id),
          ETH_LOCAL_PROVIDER_URL,
          ETH_WALLET_MNEMONIC
        ),
        Number(config.chain_id)
      );
    }
  }, [
    config?.chain_id,
    ETHEREUM_PROVIDER_URL,
    initializeConnectors,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  ]);

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={connectors}
      noDataCondition={(d) => {
        if (!d) return true;
        return d.length < 1;
      }}
      noDataMessage={t('Could not fetch Ethereum configuration')}
    >
      <Web3ProviderInternal connectors={connectors}>
        <>{children}</>
      </Web3ProviderInternal>
    </AsyncRenderer>
  );
};
