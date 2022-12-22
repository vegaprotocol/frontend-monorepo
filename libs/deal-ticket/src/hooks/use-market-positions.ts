import { useMemo } from 'react';
import { BigNumber } from 'bignumber.js';
import { useMarketAccountBalance } from '@vegaprotocol/accounts';
import { useMarketPositionOpenVolume } from '@vegaprotocol/positions';

interface Props {
  marketId: string;
}

export type PositionMargin = {
  openVolume: string;
  balance: string;
  balanceDecimals?: number;
} | null;

export const useMarketPositions = ({ marketId }: Props): PositionMargin => {
  const { accountBalance, accountDecimals } = useMarketAccountBalance(marketId);
  const openVolume = useMarketPositionOpenVolume(marketId);

  return useMemo(() => {
    if (accountBalance && accountDecimals) {
      const balance = new BigNumber(accountBalance);
      const volume = new BigNumber(openVolume);
      if (!balance.isZero() && !volume.isZero()) {
        return {
          balance: accountBalance,
          balanceDecimals: accountDecimals,
          openVolume,
        };
      }
    }
    return null;
  }, [accountBalance, accountDecimals, openVolume]);
};
