import { VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useBridgeContract = () => {
  const { provider } = useWeb3React();
  const contract = useMemo(() => {
    // @ts-ignore TODO: Setup env
    return new VegaErc20Bridge('TESTNET', provider, provider.getSigner());
  }, [provider]);

  return contract;
};
