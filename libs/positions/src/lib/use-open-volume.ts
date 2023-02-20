import { useState, useCallback } from 'react';
import type { PositionFieldsFragment } from './__generated__/Positions';
import { positionsDataProvider } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/react-helpers';

export const useOpenVolume = (
  partyId: string | null | undefined,
  marketId: string
) => {
  const [openVolume, setOpenVolume] = useState<string | undefined>(undefined);
  const update = useCallback(
    ({ data }: { data: PositionFieldsFragment[] | null }) => {
      setOpenVolume(
        data?.find((position) => position.market.id === marketId)?.openVolume
      );
      return true;
    },
    [marketId]
  );
  useDataProvider({
    dataProvider: positionsDataProvider,
    update,
    variables: { partyId: partyId || '' },
    skip: !partyId,
  });
  return openVolume;
};
