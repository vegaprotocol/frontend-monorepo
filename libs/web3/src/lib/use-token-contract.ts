import { Token, TokenFaucetable } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (address?: string, faucetable = false) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !address) {
      return null;
    }

    const signer = provider.getSigner();

    if (faucetable) {
      return new TokenFaucetable(address, signer || provider);
    } else {
      return new Token(address, signer || provider);
    }
  }, [provider, address, faucetable]);

  return contract;
};
