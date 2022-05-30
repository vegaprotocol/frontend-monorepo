import { createTokenContract } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (
  contractAddress?: string,
  faucetable = false
) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !contractAddress) {
      return null;
    }

    return createTokenContract(contractAddress, provider, faucetable);
  }, [provider, contractAddress, faucetable]);

  return contract;
};
