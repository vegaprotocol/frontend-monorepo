import { useCallback } from 'react';
import {
  type ReferralSetsQueryVariables,
  useReferralSetsQuery,
} from './__generated__/ReferralSets';
import { useStakeAvailable } from '../../../lib/hooks/use-stake-available';

export type Role = 'referrer' | 'referee';
type Args = (
  | { setId: string | undefined }
  | { pubKey: string | undefined; role: Role }
) & {
  aggregationEpochs?: number;
};

export const prepareVariables = (
  args: Args
): [ReferralSetsQueryVariables, boolean] => {
  const byId = 'setId' in args;
  const byRole = 'pubKey' in args && 'role' in args;
  let variables = {};
  let skip = true;
  if (byId) {
    variables = {
      id: args.setId,
    };
    skip = !args.setId;
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

export const useFindReferralSet = (pubKey?: string) => {
  const [referrerVariables, referrerSkip] = prepareVariables({
    pubKey,
    role: 'referrer',
  });
  const [refereeVariables, refereeSkip] = prepareVariables({
    pubKey,
    role: 'referee',
  });

  const {
    data: referrerData,
    loading: referrerLoading,
    error: referrerError,
    refetch: referrerRefetch,
  } = useReferralSetsQuery({
    variables: referrerVariables,
    skip: referrerSkip,
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: refereeData,
    loading: refereeLoading,
    error: refereeError,
    refetch: refereeRefetch,
  } = useReferralSetsQuery({
    variables: refereeVariables,
    skip: refereeSkip,
    fetchPolicy: 'cache-and-network',
  });

  const set =
    referrerData?.referralSets.edges[0]?.node ||
    refereeData?.referralSets.edges[0]?.node;
  const role: Role | undefined = set
    ? set?.referrer === pubKey
      ? 'referrer'
      : 'referee'
    : undefined;

  const { isEligible } = useStakeAvailable(set?.referrer);

  const refetch = useCallback(() => {
    referrerRefetch();
    refereeRefetch();
  }, [refereeRefetch, referrerRefetch]);

  return {
    data: set,
    role,
    loading: referrerLoading || refereeLoading,
    error: referrerError || refereeError,
    refetch,
    isEligible: set ? isEligible : undefined,
  };
};

export const useReferralSet = (setId?: string) => {
  const [variables, skip] = prepareVariables({ setId });
  const { data, loading, error, refetch } = useReferralSetsQuery({
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const set = data?.referralSets.edges[0]?.node;
  const { isEligible } = useStakeAvailable(set?.referrer);

  return {
    data: set,
    loading,
    error,
    refetch,
    isEligible: set ? isEligible : undefined,
  };
};

export const useIsInReferralSet = (pubKey: string | undefined) => {
  const { data } = useFindReferralSet(pubKey);
  return Boolean(data);
};
