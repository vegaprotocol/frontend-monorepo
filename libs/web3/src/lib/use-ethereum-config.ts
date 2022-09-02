import { gql, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import type { NetworkParamsQuery } from './__generated__/NetworkParamsQuery';

export interface EthereumConfig {
  network_id: string;
  chain_id: string;
  confirmations: number;
  collateral_bridge_contract: {
    address: string;
  };
  multisig_control_contract: {
    address: string;
    deployment_block_height: number;
  };
  staking_bridge_contract: {
    address: string;
    deployment_block_height: number;
  };
  token_vesting_contract: {
    address: string;
    deployment_block_height: number;
  };
}

export const NETWORK_PARAMS_QUERY = gql`
  query NetworkParamsQuery {
    networkParameters {
      key
      value
    }
  }
`;

export const useNetworkParam = (param: string) => {
  const { data, loading, error } = useQuery<NetworkParamsQuery, never>(
    NETWORK_PARAMS_QUERY
  );
  const foundParams = data?.networkParameters?.filter((p) => param === p.key);
  return {
    data: foundParams ? foundParams.map((f) => f.value) : null,
    loading,
    error,
  };
};

export const useNetworkParams = (params: string[]) => {
  const { data, loading, error } = useQuery<NetworkParamsQuery, never>(
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
};

export const useEthereumConfig = () => {
  const { data, loading, error } =
    useQuery<NetworkParamsQuery>(NETWORK_PARAMS_QUERY);

  const config = useMemo(() => {
    if (!data) {
      return null;
    }

    const param = data.networkParameters?.find(
      (np) => np.key === 'blockchains.ethereumConfig'
    );

    if (!param) {
      return null;
    }

    let parsedConfig: EthereumConfig;

    try {
      parsedConfig = JSON.parse(param.value);
    } catch {
      return null;
    }

    return parsedConfig;
  }, [data]);

  return { config, loading, error };
};
