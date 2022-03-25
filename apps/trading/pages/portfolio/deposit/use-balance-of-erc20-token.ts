import { DepositPage_assets } from '@vegaprotocol/graphql';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTokenContract } from './use-token-contract';

export const useBalanceOfERC20Token = (asset?: DepositPage_assets) => {
  const { account } = useWeb3React();
  const contract = useTokenContract(asset);
  const [balanceOf, setBalanceOf] = useState(new BigNumber(0));

  useEffect(() => {
    const getBalance = async () => {
      if (!contract || !account || !asset) {
        return;
      }

      const res = await contract.balanceOf(account);
      setBalanceOf(res);
    };

    getBalance();
  }, [contract, account, asset]);

  return balanceOf;
};
