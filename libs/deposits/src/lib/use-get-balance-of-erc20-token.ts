import type { Token } from '@vegaprotocol/smart-contracts';
import * as Sentry from '@sentry/react';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/react-helpers';
import { addDecimal } from '@vegaprotocol/react-helpers';

export const useGetBalanceOfERC20Token = (
  contract: Token | null,
  asset: Asset | undefined
) => {
  const { account } = useWeb3React();
  const getBalance = useCallback(async () => {
    if (!contract || !asset || !account) {
      return;
    }

    try {
      const res = await contract.balanceOf(account);
      return new BigNumber(addDecimal(res.toString(), asset.decimals));
    } catch (err) {
      Sentry.captureException(err);
      return;
    }
  }, [contract, asset, account]);

  return getBalance;
};
