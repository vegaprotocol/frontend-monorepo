import { useWeb3React } from '@web3-react/core';
import type BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTokenContract } from '../../../hooks/use-token-contract';

export const useBalanceOfERC20Token = (contractAddress?: string) => {
  const { account } = useWeb3React();
  const contract = useTokenContract(contractAddress);
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
