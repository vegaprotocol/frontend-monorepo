import { gql, useQuery } from '@apollo/client';
import { removePaginationWrapper } from '@vegaprotocol/utils';

const REFERRER_QUERY = gql`
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

const REFEREE_QUERY = gql`
  query ReferralSets($partyId: ID!) {
    referralSets(referee: $partyId) {
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

// TODO: generate types after perps work is merged
export type ReferralData = {
  code: string;
  referees: Array<{
    refereeId: string;
    joinedAt: string;
    atEpoch: number;
  }>;
};

export const useReferral = (
  pubKey: string | null,
  role: 'referrer' | 'referee'
) => {
  const query = {
    referrer: REFERRER_QUERY,
    referee: REFEREE_QUERY,
  };

  const {
    data: referralData,
    loading: referralLoading,
    error: referralError,
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
  } = useQuery(REFEREES_QUERY, {
    variables: {
      code: referral?.id,
    },
    skip: !referral?.id,
    fetchPolicy: 'cache-and-network',
  });

  const referees = removePaginationWrapper(
    refereesData?.referralSetReferees.edges
  );

  const data =
    referral && refereesData
      ? {
          code: referral.id,
          referees,
        }
      : undefined;

  return {
    data: data as ReferralData | undefined,
    loading: referralLoading || refereesLoading,
    error: referralError || refereesError,
  };
};
