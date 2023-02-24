import { useAccountBalance } from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/utils';

export const useHasNoBalance = (assetId: string) => {
  const { accountBalance, accountDecimals } = useAccountBalance(assetId);
  const balance =
    accountBalance && accountDecimals !== null
      ? toBigNum(accountBalance, accountDecimals)
      : toBigNum('0', 0);
  return balance.isZero();
};
