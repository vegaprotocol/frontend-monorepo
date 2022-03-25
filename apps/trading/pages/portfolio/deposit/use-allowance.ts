import { DepositPage_assets } from '@vegaprotocol/graphql';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTokenContract } from './use-token-contract';

export const useAllowance = (
  bridgeAddress: string,
  asset?: DepositPage_assets
) => {
  const { account } = useWeb3React();
  const contract = useTokenContract(asset);
  const [allowance, setAllowance] = useState<BigNumber | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!contract || !account) {
        return;
      }

      setAllowance(null);

      const res = await contract.allowance(account, bridgeAddress);

      setAllowance(res);
    };

    run();
  }, [contract, account, bridgeAddress]);

  return allowance;
};
