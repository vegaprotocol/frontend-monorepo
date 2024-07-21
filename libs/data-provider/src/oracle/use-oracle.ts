import { type ApolloClient, useApolloClient } from '@apollo/client';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  OracleSpecDocument,
  type OracleSpecQuery,
  type OracleSpecQueryVariables,
} from './__generated__/OracleSpec';

export type Oracle = NonNullable<
  OracleSpecQuery['oracleSpec']
>['dataSourceSpec']['spec'];

export const useOracle = ({
  oracleSpecId,
}: {
  oracleSpecId: string | undefined;
}) => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['oracleSpec', oracleSpecId],
    queryFn: () => getOracleSpec(client, oracleSpecId),
    staleTime: Infinity,
    enabled: Boolean(oracleSpecId),
  });

  return queryResult;
};

export const useOracles = (oracleSpecIds: string[] = []) => {
  const client = useApolloClient();

  const queryResult = useQueries({
    queries: oracleSpecIds.map((id) => ({
      queryKey: ['oracleSpec', id],
      queryFn: () => getOracleSpec(client, id),
    })),
  });

  return queryResult;
};

export const getOracleSpec = async (
  client: ApolloClient<any>,
  oracleSpecId?: string
) => {
  if (!oracleSpecId) return null;

  const result = await client.query<OracleSpecQuery, OracleSpecQueryVariables>({
    query: OracleSpecDocument,
    variables: {
      id: oracleSpecId,
    },
    fetchPolicy: 'no-cache',
  });

  return result.data.oracleSpec?.dataSourceSpec.spec;
};
