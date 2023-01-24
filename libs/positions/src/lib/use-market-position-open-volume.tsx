import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { positionsDataProvider } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type {
  PositionsQuery,
  PositionsSubscriptionSubscription,
} from './__generated__/Positions';

const getMarketPosition = ({
  data,
  marketId,
}: {
  data: PositionsQuery['party'];
  marketId: string;
}) => {
  const positions =
    data?.positionsConnection?.edges?.map((item) => item.node) ?? [];
  return positions.find((item) => item.market.id === marketId);
};

export const useMarketPositionOpenVolume = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [openVolume, setOpenVolume] = useState<string>('');
  const update = useCallback(
    ({ data }: { data: PositionsQuery['party'] | undefined }) => {
      const position = getMarketPosition({ data, marketId });
      if (position?.openVolume) {
        setOpenVolume(position?.openVolume || '');
      }
      return true;
    },
    [setOpenVolume, marketId]
  );

  useDataProvider<
    PositionsQuery['party'],
    PositionsSubscriptionSubscription['positions']
  >({
    dataProvider: positionsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return openVolume;
};
