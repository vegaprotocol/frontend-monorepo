import { VegaErc20Bridge } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';

export const useBridgeContract = () => {
  const { VEGA_ENV } = useEnvironment();
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!provider) {
      return null;
    }
    return new VegaErc20Bridge(VEGA_ENV, provider, provider?.getSigner());
  }, [provider, VEGA_ENV]);

  return contract;
};
