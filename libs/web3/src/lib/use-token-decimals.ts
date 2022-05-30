import type { createTokenContract } from '@vegaprotocol/smart-contracts';
import { useCallback } from 'react';
import { useEthereumReadContract } from './use-ethereum-read-contract';

export const useTokenDecimals = (
  contract: ReturnType<typeof createTokenContract> | null
) => {
  const getDecimals = useCallback(async () => {
    if (!contract) {
      return;
    }

    const value = await contract.decimals();
    const decimals = Number(value);

    return decimals;
  }, [contract]);

  const { state } = useEthereumReadContract(getDecimals);

  return state.data;
};
