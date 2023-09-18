import { gql, useQuery } from '@apollo/client';

const REFERRAL_QUERY = gql`
  query ReferralSets($partyId: ID!) {
    referralSets(referrer: $partyId) {
      edges {
        node {
          id
          referrer
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const REFEREES_QUERY = gql`
  query ReferralSets($code: ID!) {
    referralSetReferees(id: $code) {
      edges {
        node {
          referralSetId
          refereeId
          joinedAt
          atEpoch
        }
      }
    }
  }
`;

// Fetches the current user's referral and then fetches all referees using
// the referral code
export const useReferral = (pubKey: string) => {
  const {
    data: referralData,
    loading: referralLoading,
    error: referralError,
  } = useQuery(REFERRAL_QUERY, {
    variables: {
      partyId: pubKey,
    },
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
  } = useQuery(REFEREES_QUERY, {
    variables: {
      code: referral?.id,
    },
    skip: !referral?.id,
    fetchPolicy: 'cache-and-network',
  });

  const referees = refereesData?.referralSetReferees.edges?.map(
    // TODO: generate types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => e.node
  );

  const data =
    referral && refereesData
      ? {
          code: referral.id,
          referees,
        }
      : undefined;

  return {
    // TODO: generate types after perps work is merged
    data: data as
      | {
          code: string;
          referees: Array<{
            refereeId: string;
            joinedAt: string;
            atEpoch: number;
          }>;
        }
      | undefined,
    loading: referralLoading || refereesLoading,
    error: referralError || refereesError,
  };
};
