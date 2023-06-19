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

  let provider: typeof activeProvider | typeof defaultProvider = activeProvider;
  let signer = activeProvider?.getSigner();
  if (!activeProvider && allowDefaultProvider) {
    logger.info('bridge contract will use default provider');
    provider = defaultProvider;
    signer = undefined;
  }

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
