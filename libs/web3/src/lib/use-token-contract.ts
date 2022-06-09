import { Token, TokenFaucetable } from '@vegaprotocol/smart-contracts';
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

    const signer = provider.getSigner();

    if (faucetable) {
      return new TokenFaucetable(contractAddress, signer || provider);
    } else {
      return new Token(contractAddress, signer || provider);
    }
  }, [provider, contractAddress, faucetable]);

  return contract;
};
