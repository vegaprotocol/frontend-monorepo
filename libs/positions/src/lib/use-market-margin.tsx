import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marginsDataProvider } from './margin-data-provider';
import type {
  MarginsQuery,
  MarginsSubscriptionSubscription,
} from './__generated__/Positions';

const getMarketMarginPosition = ({
  data,
  marketId,
}: {
  data: MarginsQuery['party'] | null;
  marketId: string;
}) => {
  const positions =
    data?.marginsConnection?.edges?.map((item) => item.node) ?? [];
  return positions.find((item) => item.market.id === marketId);
};

export const useMarketMargin = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [marginLevel, setMarginLevel] = useState<string>('');

  const update = useCallback(
    ({ data }: { data: MarginsQuery['party'] | null }) => {
      const marginMarketPosition = getMarketMarginPosition({ data, marketId });
      if (marginMarketPosition?.maintenanceLevel) {
        setMarginLevel(marginMarketPosition?.maintenanceLevel || '');
      }
      return true;
    },
    [setMarginLevel, marketId]
  );

  useDataProvider<
    MarginsQuery['party'],
    MarginsSubscriptionSubscription['margins']
  >({
    dataProvider: marginsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return marginLevel;
};
