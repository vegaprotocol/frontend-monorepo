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
