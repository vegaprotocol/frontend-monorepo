import { removePaginationWrapper } from '@vegaprotocol/utils';
import { usePartyProfilesQuery } from './__generated__/PartyProfiles';

export const usePartyProfile = (partyId?: string) => {
  const queryResult = usePartyProfiles(partyId ? [partyId] : []);
  const profile = queryResult.data.find((p) => p.partyId === partyId);

  return {
    ...queryResult,
    data: profile,
  };
};

export const usePartyProfiles = (partyIds: string[]) => {
  const queryResult = usePartyProfilesQuery({
    variables: {
      partyIds,
    },
    skip: !partyIds.length,
    fetchPolicy: 'cache-and-network',
  });

  const profiles = removePaginationWrapper(
    queryResult.data?.partiesProfilesConnection?.edges
  );

  return {
    ...queryResult,
    data: profiles,
  };
};
