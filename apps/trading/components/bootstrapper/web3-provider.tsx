import type { DefaultWeb3ProviderContextShape } from '@vegaprotocol/web3';
import {
  useEthereumConfig,
  Web3Provider as Web3ProviderInternal,
  useWeb3ConnectStore,
  createDefaultProvider,
  useEVMBridgeConfigs,
  TRANSPORTS,
  isSupportedChainId,
  createMultiChainConnectors,
} from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import compact from 'lodash/compact';

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
  const {
    configs,
    loading: evmLoading,
    error: evmError,
  } = useEVMBridgeConfigs();

  const { ETH_LOCAL_PROVIDER_URL, ETH_WALLET_MNEMONIC } = useEnvironment();

  /** A per chain id list of rpc providers */
  const transports = useMemo(() => {
    const ethereumChainId = config?.chain_id;
    const evmChains = compact(configs?.map((c) => c.chain_id));
    const chains = compact([ethereumChainId, ...evmChains])
      .map((ch) => Number(ch))
      .filter(isSupportedChainId);
    const map: { [chainId: number]: string } = {};
    for (const chain of chains) {
      const rpc = TRANSPORTS[chain];
      if (rpc) {
        map[chain] = rpc;
      }
    }
    return map;
  }, [config?.chain_id, configs]);

  const connectors = useWeb3ConnectStore((store) => store.connectors);
  const initializeConnectors = useWeb3ConnectStore((store) => store.initialize);
  const [defaultProviders, setDefaultProviders] = useState<
    DefaultWeb3ProviderContextShape['providers'] | undefined
  >(undefined);

  useEffect(() => {
    const chains = Object.keys(transports).map((c) => Number(c));
    if (chains.length > 0) {
      // initialise and create the wallet connectors
      initializeConnectors(
        createMultiChainConnectors(
          transports,
          ETH_LOCAL_PROVIDER_URL,
          ETH_WALLET_MNEMONIC
        ),
        chains
      );
      // create default json rpc providers per chain
      const defaultProviders: DefaultWeb3ProviderContextShape['providers'] = {};
      for (const [chainId, rpcUrl] of Object.entries(transports)) {
        defaultProviders[Number(chainId)] = createDefaultProvider(
          rpcUrl,
          Number(chainId)
        );
      }
      setDefaultProviders(defaultProviders);
    }
  }, [
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
    initializeConnectors,
    transports,
  ]);

  if (error || evmError) {
    return <>{failure}</>;
  }

  if (loading || evmLoading || !connectors.length) {
    return <>{skeleton}</>;
  }

  return (
    <Web3ProviderInternal
      connectors={connectors}
      defaultProviders={defaultProviders}
    >
      <>{children}</>
    </Web3ProviderInternal>
  );
};
