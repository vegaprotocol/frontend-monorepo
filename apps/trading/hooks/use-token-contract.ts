import { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { FAUCETABLE } from '../pages/portfolio/deposit/config';

export const useTokenContract = (
  contractAddress?: string
): ERC20Token | null => {
  const { provider } = useWeb3React();
  const contract = useMemo(() => {
    if (!provider || !contractAddress) {
      return null;
    }
    return new ERC20Token(
      contractAddress,
      provider,
      provider.getSigner(),
      FAUCETABLE
    );
  }, [provider, contractAddress]);

  return contract;
};
