import { useQuery } from '@apollo/client';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useCallback } from 'react';
import { ReferrerDocument } from './__generated__/Referrer';
import { RefereeDocument } from './__generated__/Referee';
import { useRefereesQuery } from './__generated__/Referees';
import compact from 'lodash/compact';

export type Role = 'referrer' | 'referee';
export type ReferralData = {
  pubKey: string;
  role: Role;
  code: string;
  createdAt: string;
  referees: Array<{
    refereeId: string;
    joinedAt: string;
    atEpoch: number;
  }>;
};

export const useReferral = (pubKey: string | null, role: Role) => {
  const query = {
    referrer: ReferrerDocument,
    referee: RefereeDocument,
  };

  const {
    data: referralData,
    loading: referralLoading,
    error: referralError,
    refetch: referralRefetch,
  } = useQuery(query[role], {
    variables: {
      partyId: pubKey,
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
  });

  // A user can only have 1 active referral program at a time
  const referral = referralData?.referralSets.edges.length
    ? referralData.referralSets.edges[0].node
    : undefined;

  const {
    data: refereesData,
    loading: refereesLoading,
    error: refereesError,
    refetch: refereesRefetch,
  } = useRefereesQuery({
    variables: {
      code: referral?.id,
    },
    skip: !referral?.id,
    fetchPolicy: 'cache-and-network',
  });

  const referees = compact(
    removePaginationWrapper(refereesData?.referralSetReferees.edges)
  );

  const refetch = useCallback(() => {
    referralRefetch();
    refereesRefetch();
  }, [refereesRefetch, referralRefetch]);

  const data =
    referral && refereesData
      ? {
          pubKey,
          role,
          code: referral.id,
          createdAt: referral.createdAt,
          referees,
        }
      : undefined;

  return {
    data: data as ReferralData | undefined,
    loading: referralLoading || refereesLoading,
    error: referralError || refereesError,
    refetch,
  };
};
