import type { Networks } from '@vegaprotocol/smart-contracts';
import { VegaErc20Bridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useBridgeContract = () => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider) {
      return null;
    }
    return new VegaErc20Bridge(
      process.env['NX_VEGA_ENV'] as Networks,
      provider,
      provider?.getSigner()
    );
  }, [provider]);

  return contract;
};
