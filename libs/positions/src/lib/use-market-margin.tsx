import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marginsDataProvider } from '@vegaprotocol/accounts';
import type { MarginFieldsFragment } from '@vegaprotocol/accounts';

export const useMarketMargin = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [marginLevel, setMarginLevel] = useState<string>('');

  const update = useCallback(
    ({ data }: { data: MarginFieldsFragment[] | null }) => {
      const marginMarketPosition = data?.find(
        (item) => item.market.id === marketId
      );
      if (marginMarketPosition?.maintenanceLevel) {
        setMarginLevel(marginMarketPosition?.maintenanceLevel || '');
      }
      return true;
    },
    [setMarginLevel, marketId]
  );

  useDataProvider({
    dataProvider: marginsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return marginLevel;
};
