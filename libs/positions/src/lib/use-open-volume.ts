import { openVolumeDataProvider } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const useOpenVolume = (
  partyId: string | null | undefined,
  marketId: string
) =>
  useDataProvider({
    dataProvider: openVolumeDataProvider,
    variables: { partyIds: partyId ? [partyId] : [], marketId },
    skip: !partyId,
  }).data || null;
