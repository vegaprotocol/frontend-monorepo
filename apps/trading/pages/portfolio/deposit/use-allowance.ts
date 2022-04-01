import { useWeb3React } from '@web3-react/core';
import type BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTokenContract } from '../../../hooks/use-token-contract';

export const useAllowance = (
  bridgeAddress: string,
  assetContractAddress?: string
) => {
  const { account } = useWeb3React();
  const contract = useTokenContract(assetContractAddress);
  const [allowance, setAllowance] = useState<BigNumber | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!contract || !account) {
        return;
      }

      const res = await contract.allowance(account, bridgeAddress);

      setAllowance(res);
    };

    run();
  }, [contract, account, bridgeAddress]);

  return allowance;
};
