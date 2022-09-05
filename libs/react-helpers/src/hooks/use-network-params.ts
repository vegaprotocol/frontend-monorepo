import { gql, useQuery } from '@apollo/client';
import type { NetworkParams } from './__generated__/NetworkParams';

export const NETWORK_PARAMETERS_QUERY = gql`
  query NetworkParams {
    networkParameters {
      key
      value
    }
  }
`;

export const useNetworkParam = (param: string) => {
  const { data, loading, error } = useQuery<NetworkParams, never>(
    NETWORK_PARAMETERS_QUERY
  );
  const foundParams = data?.networkParameters?.filter((p) => param === p.key);
  return {
    data: foundParams ? foundParams.map((f) => f.value) : null,
    loading,
    error,
  };
};

export const useNetworkParams = (params: string[]) => {
  const { data, loading, error } = useQuery<NetworkParams, never>(
    NETWORK_PARAMETERS_QUERY
  );
  const foundParams = data?.networkParameters
    ?.filter((p) => params.includes(p.key))
    .sort((a, b) => params.indexOf(a.key) - params.indexOf(b.key));
  return {
    data: foundParams ? foundParams.map((f) => f.value) : null,
    loading,
    error,
  };
};
