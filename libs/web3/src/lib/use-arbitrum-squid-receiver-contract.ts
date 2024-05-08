import { useMemo } from 'react';
import { useArbitrumConfig } from './use-evm-bridge-configs';
import { ArbitrumSquidReceiver } from '@vegaprotocol/smart-contracts';

/**
 * Gets the arbitrum bridge contract.
 */
export const useArbitrumSquidReceiverContract = (
  /**
   * Overwrites the Arbitrum chain id. Use when you want to connect to the
   * Arbitrum Sepolia or other Arbitrum test network.
   */
  desiredChainId?: string
) => {
  const { config } = useArbitrumConfig(desiredChainId);

  const contract = useMemo(() => {
    if (!config) return null;
    return getArbitrumSquidReceiverContract(
      config.collateral_bridge_contract.address
    );
  }, [config]);

  return contract;
};

export const getArbitrumSquidReceiverContract = (address: string) => {
  return new ArbitrumSquidReceiver(address);
};
