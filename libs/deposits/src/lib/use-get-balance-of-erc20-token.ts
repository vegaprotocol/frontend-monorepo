import type { Token } from '@vegaprotocol/smart-contracts';
import * as Sentry from '@sentry/react';
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';

export const useGetBalanceOfERC20Token = (
  /** A token (asset) contract */
  contract?: Token,
  /** An account address */
  account?: string
) => {
  const getBalance = useCallback(async () => {
    if (!contract || !account) {
      return;
    }

    try {
      const res = await contract.balanceOf(account);
      return new BigNumber(res.toString());
    } catch (err) {
      Sentry.captureException(err);
      return;
    }
  }, [contract, account]);

  return getBalance;
};
