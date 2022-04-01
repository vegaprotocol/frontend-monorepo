import { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (
  contractAddress?: string
): ERC20Token | null => {
  const { provider } = useWeb3React();
  const contract = useMemo(() => {
    if (!provider || !contractAddress) {
      return null;
    }

    return new ERC20Token(contractAddress, provider, provider.getSigner());
  }, [provider, contractAddress]);

  return contract;
};
