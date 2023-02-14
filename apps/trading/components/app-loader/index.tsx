import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { NetworkLoader, useEnvironment } from '@vegaprotocol/environment';
import type { InMemoryCacheConfig } from '@apollo/client';
import {
  useEthereumConfig,
  createConnectors,
  Web3Provider as Web3ProviderInternal,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';
import { AsyncRenderer, Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

interface AppLoaderProps {
  children: ReactNode;
}

/**
 * Component to handle any app initialization, startup queries and other things
 * that must happen for it can be used
 */
export function AppLoader({ children }: AppLoaderProps) {
  return (
    <NetworkLoader skeleton={<Loader />} cache={cacheConfig}>
      {children}
    </NetworkLoader>
  );
}

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

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Account: {
      keyFields: false,
      fields: {
        balanceFormatted: {},
      },
    },
    Instrument: {
      keyFields: false,
    },
    TradableInstrument: {
      keyFields: ['instrument'],
    },
    Product: {
      keyFields: ['settlementAsset', ['id']],
    },
    MarketData: {
      keyFields: ['market', ['id']],
    },
    Node: {
      keyFields: false,
    },
    Withdrawal: {
      fields: {
        pendingOnForeignChain: {
          read: (isPending = false) => isPending,
        },
      },
    },
    ERC20: {
      keyFields: ['contractAddress'],
    },
    PositionUpdate: {
      keyFields: false,
    },
    AccountUpdate: {
      keyFields: false,
    },
    Party: {
      keyFields: false,
    },
    Fees: {
      keyFields: false,
    },
  },
};
