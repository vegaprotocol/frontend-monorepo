import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import type BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

export const useBalanceOfERC20Token = (contract: ERC20Token | null) => {
  const { account } = useWeb3React();
  const [balanceOf, setBalanceOf] = useState<BigNumber | null>(null);

  useEffect(() => {
    const getBalance = async () => {
      if (!contract || !account) {
        return;
      }

      const res = await contract.balanceOf(account);
      setBalanceOf(res);
    };

    getBalance();
  }, [contract, account]);

  return balanceOf;
};
