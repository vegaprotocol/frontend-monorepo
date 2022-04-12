import { VegaLPStaking } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { NetworkConnector } from '@web3-react/network-connector';
import React from 'react';

/**
 * I think this is actually going to need to export 1x ABI per bridge, i.e. around 4
 */
export const useVegaLPStaking = ({ address }: { address: string }) => {
  const { provider, connector } = useWeb3React();
  return React.useMemo(() => {
    return new VegaLPStaking(
      // @ts-ignore TODO: TFE import, check this
      provider,
      // @ts-ignore TODO: TFE import, check this
      connector instanceof NetworkConnector ? undefined : provider.getSigner(),
      address
    );
  }, [provider, address, connector]);
};
