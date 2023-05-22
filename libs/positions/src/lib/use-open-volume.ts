import { useState, useCallback } from 'react';
import { openVolumeDataProvider } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const useOpenVolume = (
  partyId: string | null | undefined,
  marketId: string
) => {
  const [openVolume, setOpenVolume] = useState<string | undefined>(undefined);
  const update = useCallback(({ data }: { data: string | null }) => {
    setOpenVolume(data ?? undefined);
    return true;
  }, []);
  useDataProvider({
    dataProvider: openVolumeDataProvider,
    update,
    variables: { partyIds: partyId ? [partyId] : [], marketId },
    skip: !partyId,
  });
  return openVolume;
};
