import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marginsDataProvider } from './margin-data-provider';
import type { MarginFieldsFragment } from './__generated__/Positions';

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
