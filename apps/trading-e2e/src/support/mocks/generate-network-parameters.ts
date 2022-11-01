import merge from 'lodash/merge';
import type { NetworkParamsQuery } from '@vegaprotocol/web3';
import type { PartialDeep } from 'type-fest';

export const generateNetworkParameters = (
  override?: PartialDeep<NetworkParamsQuery>
): NetworkParamsQuery => {
  const defaultResult: NetworkParamsQuery = {
    networkParametersConnection: {
      edges: [
        {
          node: {
            __typename: 'NetworkParameter',
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
        },
      ],
    },
  };
  return merge(defaultResult, override);
};
