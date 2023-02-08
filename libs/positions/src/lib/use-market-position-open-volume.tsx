import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { positionsDataProvider } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { PositionFieldsFragment } from './__generated__/Positions';

export const useMarketPositionOpenVolume = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [openVolume, setOpenVolume] = useState<string>('');
  const update = useCallback(
    ({ data }: { data: PositionFieldsFragment[] | null }) => {
      const position = data?.find((node) => node.market.id === marketId);
      if (position?.openVolume) {
        setOpenVolume(position?.openVolume || '');
      }
      return true;
    },
    [setOpenVolume, marketId]
  );

  useDataProvider({
    dataProvider: positionsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return openVolume;
};
