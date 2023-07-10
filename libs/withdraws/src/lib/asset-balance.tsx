import { useAccountBalance } from '@vegaprotocol/accounts';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useBalancesStore } from '@vegaprotocol/assets';
import { Balance } from '@vegaprotocol/assets';
import { addDecimal, formatNumber } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

export const AssetBalance = ({ asset }: { asset: AssetFieldsFragment }) => {
  const [setBalance, getBalance] = useBalancesStore((state) => [
    state.setBalance,
    state.getBalance,
  ]);
  const { accountBalance, accountDecimals } = useAccountBalance(asset?.id);

  useEffect(() => {
    const balance =
      accountBalance && accountDecimals
        ? new BigNumber(addDecimal(accountBalance, accountDecimals))
        : undefined;
    setBalance({ asset, balanceOnVega: balance });
  }, [accountBalance, accountDecimals, asset, setBalance]);

  return (
    <Balance
      balance={formatNumber(
        getBalance(asset.id)?.balanceOnVega || 0,
        accountDecimals || 0
      )}
      symbol={asset.symbol}
    />
  );
};
