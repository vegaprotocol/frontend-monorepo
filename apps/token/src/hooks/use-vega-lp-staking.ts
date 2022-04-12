import { VegaLPStaking } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

/**
 * I think this is actually going to need to export 1x ABI per bridge, i.e. around 4
 */
export const useVegaLPStaking = ({ address }: { address: string }) => {
  const { provider } = useWeb3React();
  return useMemo(() => {
    if (!provider) {
      return null;
    }
    return new VegaLPStaking(provider, provider.getSigner(), address);
  }, [provider, address]);
};
