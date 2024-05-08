import { useNetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useMemo } from 'react';
import { ARBITRUM_CHAIN_ID } from './constants';

export type EthereumContractConfig = {
  /**
   * Address of the contract for this EVM compatible network. The address should
   * start with "0x".
   */
  address: string;
  /**
   * Block height at which the stacking contract has been deployed for this
   * Ethereum network.
   */
  deployment_block_height: number;
};

export type EVMBridgeConfig = {
  /**
   * Network ID of this EVM compatible network.
   */
  network_id: string;
  /**
   * Chain ID of this EVM compatible network.
   */
  chain_id: string;
  /**
   * Contract configuration of the collateral bridge contract for this EVM
   * compatible network.
   */
  collateral_bridge_contract: EthereumContractConfig;
  /**
   * Number of block confirmations to wait to consider an EVM compatible chain
   * transaction trusted. An EVM compatible chain block is trusted when there
   * are at least "n" blocks confirmed by the network, "n" being the number of
   * `confirmations` required. If `confirmations` was set to `3`, and the
   * current block to be forged (or mined) on the EVM compatible chain is block
   * 14, block 10 would be considered as trusted, but not block 11.
   */
  confirmations: number;
  /**
   * Contract configuration of the multisig control contract for this EVM
   * compatible network.
   */
  multisig_control_contract: EthereumContractConfig;
  /**
   * Approximate block time of the EVM chain as a duration e.g. 12s, 250ms.
   */
  block_time: string;
  /**
   * Display name of this network.
   */
  name: string;
};

type EVMBridgeConfigs = {
  configs: EVMBridgeConfig[];
};

export const useEVMBridgeConfigs = () => {
  const { data, loading, error } = useNetworkParamsQuery();

  const configs = useMemo(() => {
    if (!data) return null;
    const param = removePaginationWrapper(
      data.networkParametersConnection.edges
    )?.find(({ key }) => key === 'blockchains.evmBridgeConfigs');
    if (!param) return null;

    let parsedConfigs: EVMBridgeConfigs;
    try {
      parsedConfigs = JSON.parse(param.value);
    } catch {
      return null;
    }

    return parsedConfigs.configs;
  }, [data]);

  return { configs, loading, error };
};

/**
 * FIXME: Remove this stub once the configuration is on the network
 */
export const ARBITRUM_BRIDGE_CONFIG: EVMBridgeConfig = {
  network_id: '42161',
  chain_id: '42161',
  collateral_bridge_contract: {
    address: '0xd459fac6647059100ebe45543e1da73b3b70ffba',
    deployment_block_height: 0,
  },
  confirmations: 3,
  multisig_control_contract: {
    address: '',
    deployment_block_height: 0,
  },
  block_time: '',
  name: 'Arbitrum',
};

export const useArbitrumConfig = (desiredChainId?: string) => {
  const { configs, loading, error } = useEVMBridgeConfigs();

  const chainId = desiredChainId || String(ARBITRUM_CHAIN_ID);

  const config = useMemo(() => {
    const arb = configs?.find((c) => c.chain_id === String(chainId));
    return arb;
  }, [chainId, configs]);

  return { config, loading, error };
};
