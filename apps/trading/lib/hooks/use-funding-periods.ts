import { useApolloClient } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import {
  FundingPeriodsDocument,
  type FundingPeriodsQuery,
  type FundingPeriodsQueryVariables,
} from './__generated__/FundingPeriods';

export const useFundingPeriods = ({
  marketId,
  enabled,
}: {
  marketId: string;
  enabled: boolean;
}) => {
  const client = useApolloClient();

  const queryResult = useQuery({
    queryKey: ['fundingPeriods', marketId],
    queryFn: async () => {
      const result = await client.query<
        FundingPeriodsQuery,
        FundingPeriodsQueryVariables
      >({
        query: FundingPeriodsDocument,
        variables: {
          marketId,
          pagination: { first: 1 },
        },
      });
      return result.data;
    },
    enabled,
    refetchInterval: 5000,
  });

  return queryResult;
};
