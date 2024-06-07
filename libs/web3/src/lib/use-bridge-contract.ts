import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useMemo } from 'react';
import { useEthereumConfig } from './use-ethereum-config';
import { useDefaultWeb3Providers } from './default-web3-provider';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { ERR_WRONG_CHAIN } from './constants';
import { useEVMBridgeConfigs } from './use-evm-bridge-configs';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import { type JsonRpcProvider } from '@ethersproject/providers';

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

export const useCollateralBridgeConfigs = () => {
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

export const useCollateralBridge = (chainId?: number) => {
  const { provider, chainId: activeChainId } = useWeb3React();
  const { configs, error: configsError } = useCollateralBridgeConfigs();

  const config =
    configsError || !chainId
      ? undefined
      : configs.find((c) => c.chainId === chainId);

  const contract =
    !provider || !config || chainId !== activeChainId
      ? undefined
      : new CollateralBridge(config.address, provider.getSigner() || provider);

  return {
    contract,
    chainId,
    address: config?.address,
    config,
    error: chainId && chainId !== activeChainId ? ERR_WRONG_CHAIN : undefined,
  };
};

export const useGetCollateralBridge = () => {
  const { configs } = useCollateralBridgeConfigs();
  const { provider, chainId: activeChainId } = useWeb3React();
  const { providers } = useDefaultWeb3Providers();

  const getCollateralBridge = useCallback(
    (chainId: number) => {
      let usingDefaultProvider = false;
      const config = configs.find((c) => c.chainId === chainId);
      if (!config) return undefined;

      let p: JsonRpcProvider | undefined = provider;
      if (!p || activeChainId !== chainId) {
        usingDefaultProvider = true;
        p = providers?.[chainId];
      }
      if (!p) return undefined;
      const signerOrProvider = usingDefaultProvider ? p : p.getSigner() || p;
      return new CollateralBridge(config.address, signerOrProvider);
    },
    [activeChainId, configs, provider, providers]
  );

  return getCollateralBridge;
};
