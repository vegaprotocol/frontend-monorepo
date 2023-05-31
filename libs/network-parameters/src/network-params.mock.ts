import merge from 'lodash/merge';
import type {
  NetworkParamQuery,
  NetworkParamQueryVariables,
  NetworkParamsQuery,
} from './__generated__/NetworkParams';
import type { PartialDeep } from 'type-fest';

export const networkParamsQuery = (
  override?: PartialDeep<NetworkParamsQuery>
): NetworkParamsQuery => {
  const defaultResult: NetworkParamsQuery = {
    networkParametersConnection: {
      edges: networkParams.map((node) => ({
        __typename: 'NetworkParameterEdge',
        node,
      })),
    },
  };
  return merge(defaultResult, override);
};

export const networkParamQuery = (
  variables: NetworkParamQueryVariables
): NetworkParamQuery => {
  const param = networkParams.find((p) => p.key === variables.key);
  return {
    networkParameter: param || null,
  };
};

const networkParams = [
  {
    __typename: 'NetworkParameter' as const,
    key: 'governance.proposal.market.requiredMajority',
    value: '0.66',
  },
  {
    __typename: 'NetworkParameter' as const,
    key: 'transfer.fee.factor',
    value: '0.01',
  },
  {
    __typename: 'NetworkParameter' as const,
    key: 'spam.protection.minimumWithdrawalQuantumMultiple',
    value: '10',
  },
  {
    __typename: 'NetworkParameter' as const,
    key: 'blockchains.ethereumConfig',
    value: JSON.stringify({
      network_id: '3',
      chain_id: '3',
      collateral_bridge_contract: {
        address: '0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799',
      },
      multisig_control_contract: {
        address: '0x6eBc32d66277D94DB8FF2ccF86E36f37F29a52D3',
        deployment_block_height: 12341882,
      },
      staking_bridge_contract: {
        address: '0xFFb0A0d4806502ceF491aF1141f66669A1Bd0D03',
        deployment_block_height: 11177313,
      },
      token_vesting_contract: {
        address: '0x680fF88252FA7071CAce7398e77872d54D781d0B',
        deployment_block_height: 11177353,
      },
      confirmations: 3,
    }),
  },
];
