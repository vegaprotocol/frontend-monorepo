import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useCallback } from 'react';
import { useRefereesQuery } from './__generated__/Referees';
import compact from 'lodash/compact';
import type { ReferralSetsQueryVariables } from './__generated__/ReferralSets';
import { useReferralSetsQuery } from './__generated__/ReferralSets';
import { useStakeAvailable } from './use-stake-available';

export const DEFAULT_AGGREGATION_DAYS = 30;

export type Role = 'referrer' | 'referee';
type UseReferralArgs = (
  | { code: string }
  | { pubKey: string | null; role: Role }
) & {
  aggregationEpochs?: number;
};

const prepareVariables = (
  args: UseReferralArgs
): [ReferralSetsQueryVariables, boolean] => {
  const byCode = 'code' in args;
  const byRole = 'pubKey' in args && 'role' in args;
  let variables = {};
  let skip = true;
  if (byCode) {
    variables = {
      id: args.code,
    };
    skip = !args.code;
  }
  if (byRole) {
    if (args.role === 'referee') {
      variables = { referee: args.pubKey };
    }
    if (args.role === 'referrer') {
      variables = { referrer: args.pubKey };
    }
    skip = !args.pubKey;
  }

  return [variables, skip];
};

export const useReferral = (args: UseReferralArgs) => {
  const [variables, skip] = prepareVariables(args);

  const {
    data: referralData,
    loading: referralLoading,
    error: referralError,
    refetch: referralRefetch,
  } = useReferralSetsQuery({
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
  });

  // A user can only have 1 active referral program at a time
  const referralSet =
    referralData?.referralSets.edges &&
    referralData.referralSets.edges.length > 0
      ? referralData.referralSets.edges[0]?.node
      : undefined;

  const { isEligible } = useStakeAvailable(referralSet?.referrer);

  const {
    data: refereesData,
    loading: refereesLoading,
    error: refereesError,
    refetch: refereesRefetch,
  } = useRefereesQuery({
    variables: {
      code: referralSet?.id as string,
      aggregationEpochs:
        args.aggregationEpochs !== null
          ? args.aggregationEpochs
          : DEFAULT_AGGREGATION_DAYS,
    },
    skip: !referralSet?.id,
    fetchPolicy: 'cache-and-network',
    context: { isEnlargedTimeout: true },
  });

  const referees = compact(
    removePaginationWrapper(refereesData?.referralSetReferees.edges)
  );

  const refetch = useCallback(() => {
    referralRefetch();
    refereesRefetch();
  }, [refereesRefetch, referralRefetch]);

  const byReferee =
    'role' in args && 'pubKey' in args && args.role === 'referee';
  const referee = byReferee
    ? referees.find((r) => r.refereeId === args.pubKey) || null
    : null;

  const data =
    referralSet && refereesData
      ? {
          code: referralSet.id,
          role: 'role' in args ? args.role : null,
          referee: referee,
          referrerId: referralSet.referrer,
          createdAt: referralSet.createdAt,
          isEligible,
          referees,
        }
      : undefined;

  return {
    data,
    loading: referralLoading || refereesLoading,
    error: referralError || refereesError,
    refetch,
  };
};
