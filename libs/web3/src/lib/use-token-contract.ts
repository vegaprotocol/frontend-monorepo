import { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (address?: string) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !address) {
      return null;
    }

    const signer = provider.getSigner();
    return new Token(address, signer || provider);
  }, [provider, address]);

  return contract;
};
