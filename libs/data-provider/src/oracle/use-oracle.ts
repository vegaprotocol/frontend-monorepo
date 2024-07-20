import { useApolloClient } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import {
  OracleSpecDocument,
  type OracleSpecQuery,
  type OracleSpecQueryVariables,
} from './__generated__/OracleSpec';

export const useOracle = ({
  oracleSpecId,
}: {
  oracleSpecId: string | undefined;
}) => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['oracle', oracleSpecId],
    queryFn: async () => {
      if (!oracleSpecId) return null;

      const result = await client.query<
        OracleSpecQuery,
        OracleSpecQueryVariables
      >({
        query: OracleSpecDocument,
        variables: {
          id: oracleSpecId,
        },
        fetchPolicy: 'no-cache',
      });

      return result.data.oracleSpec?.dataSourceSpec.spec;
    },
    staleTime: Infinity,
    enabled: Boolean(oracleSpecId),
  });

  return queryResult;
};
