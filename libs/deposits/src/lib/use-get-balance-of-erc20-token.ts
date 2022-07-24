import type { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { Asset } from './deposit-manager';

export const useGetBalanceOfERC20Token = (
  contract: Token | null,
  asset: Asset | undefined
) => {
  const { account } = useWeb3React();
  const getBalance = useCallback(async () => {
    if (!contract || !asset || !account) {
      return;
    }

    const res = await contract.balanceOf(account);
    return new BigNumber(addDecimal(res.toString(), asset.decimals));
  }, [contract, asset, account]);

  return getBalance;
};
