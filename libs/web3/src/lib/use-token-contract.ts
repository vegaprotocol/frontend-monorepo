import { Token, TokenFaucetable } from '@vegaprotocol/smart-contracts';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (asset?: AssetFieldsFragment, faucetable = false) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !asset) {
      return null;
    }

    const signer = provider.getSigner();

    if (asset.source.__typename === 'ERC20') {
      const address = asset.source.contractAddress;

      if (faucetable) {
        return new TokenFaucetable(address, signer || provider);
      } else {
        return new Token(address, signer || provider);
      }
    }

    return null;
  }, [provider, asset, faucetable]);

  return contract;
};
