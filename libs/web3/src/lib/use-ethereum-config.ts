import { useNetworkParamsQuery } from '@vegaprotocol/react-helpers';
import compact from 'lodash/compact';
import { useMemo } from 'react';

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

export const useEthereumConfig = () => {
  const { data, loading, error } = useNetworkParamsQuery();

  const config = useMemo(() => {
    if (!data) {
      return null;
    }

    const param = compact(data.networkParametersConnection.edges)
      .map(({ node }) => node)
      ?.find((node) => node.key === 'blockchains.ethereumConfig');

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
