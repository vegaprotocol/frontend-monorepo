import { useQuery } from '@tanstack/react-query';
import {
  OracleSpecDocument,
  type OracleSpecQuery,
  type OracleSpecQueryVariables,
} from './__generated__/OracleSpec';
import { useApolloClient } from '@apollo/client';

export const useOracleSpec = ({
  oracleSpecId,
  enabled,
}: {
  oracleSpecId: string;
  enabled: boolean;
}) => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['oracleSpec', oracleSpecId],
    queryFn: async () => {
      const result = await client.query<
        OracleSpecQuery,
        OracleSpecQueryVariables
      >({
        query: OracleSpecDocument,
        variables: {
          oracleSpecId,
        },
        fetchPolicy: 'no-cache',
      });

      return result.data.oracleSpec?.dataSourceSpec.spec;
    },
    staleTime: Infinity,
    enabled: Boolean(oracleSpecId) && enabled,
  });

  return queryResult;
};
