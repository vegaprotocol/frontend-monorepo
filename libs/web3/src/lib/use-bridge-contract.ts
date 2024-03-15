import { useMemo } from 'react';
import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useEthereumConfig } from './use-ethereum-config';

export const useBridgeContract = () => {
  const { provider } = useWeb3React();
  const { config } = useEthereumConfig();

  // this has to be memoized, otherwise it ticks like crazy
  const signerOrProvider = useMemo(() => {
    if (!provider) {
      return;
    }

    const signer = provider.getSigner();

    if (signer) return signer;

    return provider;
  }, [provider]);

  const contract = useMemo(() => {
    if (!signerOrProvider || !config) {
      return null;
    }

    return new CollateralBridge(
      config.collateral_bridge_contract.address,
      signerOrProvider
    );
  }, [signerOrProvider, config]);

  return contract;
};
