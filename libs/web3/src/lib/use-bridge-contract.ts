import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useEthereumConfig } from './use-ethereum-config';
import { useDefaultWeb3Provider } from './default-web3-provider';
import { localLoggerFactory } from '@vegaprotocol/logger';

export const useBridgeContract = (allowDefaultProvider = false) => {
  const { provider: activeProvider } = useWeb3React();
  const { provider: defaultProvider } = useDefaultWeb3Provider();
  const { config } = useEthereumConfig();
  const logger = localLoggerFactory({ application: 'web3' });

  const provider = useMemo(() => {
    if (!activeProvider && allowDefaultProvider) {
      logger.info('will use default web3 provider');
      return defaultProvider;
    }
    return activeProvider;
  }, [activeProvider, allowDefaultProvider, defaultProvider, logger]);

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
