import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import type BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

export const useGetAllowance = (
  contract: ERC20Token | null,
  bridgeAddress: string
) => {
  const { account } = useWeb3React();
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
