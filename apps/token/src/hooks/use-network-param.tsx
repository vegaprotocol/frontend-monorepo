import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

import type { NetworkParams } from "./__generated__/NetworkParams";

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
