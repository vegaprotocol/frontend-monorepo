import { useMemo } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { accountsDataProvider } from './accounts-data-provider';
import { useDataProvider } from '@vegaprotocol/data-provider';

interface AssetBalanceProps {
  partyId: string;
  assetSymbol: string;
}

export const AssetBalance = ({ partyId, assetSymbol }: AssetBalanceProps) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const { data } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables,
  });
  if (data && data.length) {
    let decimals = 0;
    const totalBalance = data.reduce((a, c) => {
      if (c.asset.symbol === assetSymbol) {
        decimals = c.asset.decimals;
        return a + BigInt(c.balance);
      }
      return a;
    }, BigInt(0));
    return (
      <span>{addDecimalsFormatNumber(totalBalance.toString(), decimals)}</span>
    );
  }
  return null;
};
