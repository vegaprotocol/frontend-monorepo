import { useState, useCallback } from 'react';
import {
  OpenVolumeData,
  openVolumeDataProvider,
} from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const useOpenVolume = (
  partyId: string | null | undefined,
  marketId: string
) => {
  const [openVolume, setOpenVolume] = useState<OpenVolumeData | null>(null);
  const update = useCallback(({ data }: { data: OpenVolumeData | null }) => {
    setOpenVolume(data);
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
