import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

import type { NetworkParams } from './__generated__/NetworkParams';

export const NETWORK_PARAMS_QUERY = gql`
  query NetworkParams {
    networkParameters {
      key
      value
    }
  }
`;

export function useNetworkParam(params: string[]) {
  const { data, loading, error } = useQuery<NetworkParams, never>(
    NETWORK_PARAMS_QUERY
  );

  const foundParams = data?.networkParameters
    ?.filter((p) => params.includes(p.key))
    .sort((a, b) => params.indexOf(a.key) - params.indexOf(b.key));

  return {
    data: foundParams ? foundParams.map((f) => f.value) : null,
    loading,
    error,
  };
}

export function useNetworkParamWithKeys(params: string[]) {
  const { data, loading, error } = useQuery<NetworkParams, never>(
    NETWORK_PARAMS_QUERY
  );

  const foundParams =
    params.length === 0
      ? data?.networkParameters
      : data?.networkParameters?.filter((p) => params.includes(p.key));

  // if foundParams length is greater than 0, sort params by key property
  const sortedParams =
    foundParams && foundParams.length > 0
      ? [...foundParams].sort((a, b) => {
          if (a.key < b.key) {
            return -1;
          }
          if (a.key > b.key) {
            return 1;
          }
          return 0;
        })
      : null;

  return {
    data: sortedParams,
    loading,
    error,
  };
}
