import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { accountsDataProvider } from './accounts-data-provider';

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
    const totalBalance = data.reduce((a, c) => {
      if (c.asset.symbol === assetSymbol) {
        return a + BigInt(c.balance);
      }
      return a;
    }, BigInt(0));
    return (
      <span>
        {addDecimalsFormatNumber(
          totalBalance.toString(),
          data[0].asset.decimals
        )}
      </span>
    );
  }
  return null;
};
