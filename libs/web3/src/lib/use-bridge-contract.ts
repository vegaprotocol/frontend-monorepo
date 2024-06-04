import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEthereumConfig } from './use-ethereum-config';
import { useDefaultWeb3Providers } from './default-web3-provider';
import { localLoggerFactory } from '@vegaprotocol/logger';
import {
  ERR_CHAIN_NOT_SUPPORTED,
  ERR_WRONG_CHAIN,
  isSupportedChainId,
} from './constants';
import { useEVMBridgeConfigs } from './use-evm-bridge-configs';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';

export const useBridgeContract = (allowDefaultProvider = false) => {
  const { provider: activeProvider, chainId } = useWeb3React();
  const { providers: defaultProviders } = useDefaultWeb3Providers();
  const { config } = useEthereumConfig();
  const logger = localLoggerFactory({ application: 'web3' });

  const provider = useMemo(() => {
    if (
      !activeProvider &&
      allowDefaultProvider &&
      chainId &&
      defaultProviders
    ) {
      logger.info('will use default web3 provider for chain:' + chainId);
      return defaultProviders[chainId];
    }
    return activeProvider;
  }, [activeProvider, allowDefaultProvider, chainId, defaultProviders, logger]);

  // this has to be memoized, otherwise it ticks like crazy
  const signer = useMemo(() => {
    return !activeProvider && allowDefaultProvider
      ? undefined
      : activeProvider?.getSigner();
  }, [activeProvider, allowDefaultProvider]);

  const contract = useMemo(() => {
    if (!provider || !config) {
      return null;
    }

    return new CollateralBridge(
      config.collateral_bridge_contract.address,
      signer || provider
    );
  }, [provider, signer, config]);

  return contract;
};

type CollateralBridgeConfig = {
  chainId: number;
  address: string;
  confirmations: number;
};

const useCollateralBridgeConfigs = () => {
  const {
    config: ethConfig,
    loading: ethLoading,
    error: ethError,
  } = useEthereumConfig();
  const {
    configs: evmConfigs,
    loading: evmLoading,
    error: evmError,
  } = useEVMBridgeConfigs();

  const configs = useMemo(() => {
    const configs: CollateralBridgeConfig[] = [];
    if (ethConfig) {
      configs.push({
        chainId: Number(ethConfig.chain_id),
        address: ethConfig.collateral_bridge_contract.address,
        confirmations: ethConfig.confirmations,
      });
    }
    if (evmConfigs) {
      for (const evm of evmConfigs) {
        configs.push({
          chainId: Number(evm.chain_id),
          address: evm.collateral_bridge_contract.address,
          confirmations: evm.confirmations,
        });
      }
    }
    return compact(uniq(configs));
  }, [ethConfig, evmConfigs]);

  return {
    configs,
    loading: ethLoading || evmLoading,
    error: ethError || evmError,
  };
};

export const useCollateralBridge = (
  chainId?: number,
  allowDefaultProvider = false
) => {
  const { configs, error: configsError } = useCollateralBridgeConfigs();

  const { provider, error: providerError } = useProvider(
    chainId,
    allowDefaultProvider
  );

  const config = useMemo(() => {
    if (configsError || !chainId) return undefined;
    return configs.find((c) => c.chainId === chainId);
  }, [chainId, configs, configsError]);

  const signer = useMemo(() => {
    return provider?.getSigner();
  }, [provider]);

  const contract = useMemo(() => {
    if (!provider || !config) return undefined;
    return new CollateralBridge(config.address, signer || provider);
  }, [config, provider, signer]);

  return {
    contract,
    chainId,
    address: config?.address,
    config,
    error: configsError || providerError,
  };
};

export const useProvider = (chainId?: number, allowDefaultProvider = false) => {
  const { provider: activeProvider, chainId: activeChainId } = useWeb3React();
  const { providers: defaultProviders } = useDefaultWeb3Providers();

  const [error, setError] = useState<Error | undefined>(undefined);

  const defaultProvider = useMemo(() => {
    if (chainId && defaultProviders) {
      return defaultProviders[chainId];
    }
    return undefined;
  }, [chainId, defaultProviders]);

  const provider = useMemo(() => {
    if (chainId && (activeProvider || defaultProvider)) {
      if (chainId === activeChainId) {
        return activeProvider;
      } else if (allowDefaultProvider) {
        return defaultProvider;
      }
    }
    return undefined;
  }, [
    activeChainId,
    activeProvider,
    allowDefaultProvider,
    chainId,
    defaultProvider,
  ]);

  useEffect(() => {
    if (!chainId) return;
    if (!isSupportedChainId(chainId)) {
      setError(ERR_CHAIN_NOT_SUPPORTED);
      return;
    }
    if (activeChainId !== chainId) {
      setError(ERR_WRONG_CHAIN);
      return;
    }
    setError(undefined);
  }, [activeChainId, chainId]);

  return { provider, error };
};

export const useGetProvider = () => {
  const { provider: activeProvider, chainId: activeChainId } = useWeb3React();
  const { providers: defaultProviders } = useDefaultWeb3Providers();

  const getProvider = useCallback(
    (chainId: number) => {
      if (activeChainId === chainId) {
        return activeProvider;
      }
      if (defaultProviders) {
        return defaultProviders[chainId];
      }
      return undefined;
    },
    [activeChainId, activeProvider, defaultProviders]
  );

  return getProvider;
};

export const useGetCollateralBridge = () => {
  const getProvider = useGetProvider();
  const { configs } = useCollateralBridgeConfigs();

  const getCollateralBridge = useCallback(
    (chainId: number) => {
      const config = configs.find((c) => c.chainId === chainId);
      if (!config) return undefined;

      const provider = getProvider(chainId);
      if (!provider) return undefined;

      return new CollateralBridge(
        config.address,
        provider.getSigner() || provider
      );
    },
    [configs, getProvider]
  );

  return getCollateralBridge;
};
