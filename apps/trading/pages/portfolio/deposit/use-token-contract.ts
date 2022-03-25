import { DepositPage_assets } from '@vegaprotocol/graphql';
import { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useTokenContract = (
  asset?: DepositPage_assets
): ERC20Token | null => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider || !asset || asset.source.__typename !== 'ERC20') {
      return null;
    }

    return new ERC20Token(
      asset.source.contractAddress,
      provider,
      provider.getSigner()
    );
  }, [asset, provider]);

  return contract;
};
