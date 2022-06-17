import {
  CollateralBridge,
  CollateralBridgeNew,
} from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useEthereumConfig } from './use-ethereum-config';

export const useBridgeContract = (isNewContract: boolean) => {
  const { provider } = useWeb3React();
  const { config } = useEthereumConfig();

  const contract = useMemo(() => {
    if (!provider || !config) {
      return null;
    }

    const signer = provider.getSigner();

    return isNewContract
      ? new CollateralBridgeNew(
          config.collateral_bridge_contract.address,
          signer || provider
        )
      : new CollateralBridge(
          config.collateral_bridge_contract.address,
          signer || provider
        );
  }, [provider, config, isNewContract]);

  return contract;
};
