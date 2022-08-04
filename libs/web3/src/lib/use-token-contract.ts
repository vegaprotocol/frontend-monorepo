import type { ERC20Asset } from '@vegaprotocol/react-helpers';
import { Token, TokenFaucetable } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (asset?: ERC20Asset, faucetable = false) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !asset) {
      return null;
    }

    const signer = provider.getSigner();
    const address = asset.source.contractAddress;

    if (faucetable) {
      return new TokenFaucetable(address, signer || provider);
    } else {
      return new Token(address, signer || provider);
    }
  }, [provider, asset, faucetable]);

  return contract;
};
