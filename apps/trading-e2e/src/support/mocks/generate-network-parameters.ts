import merge from 'lodash/merge';
import type { NetworkParamsQuery } from '@vegaprotocol/web3';
import type { PartialDeep } from 'type-fest';

export const generateNetworkParameters = (
  override?: PartialDeep<NetworkParamsQuery>
): NetworkParamsQuery => {
  const defaultResult: NetworkParamsQuery = {
    networkParameters: [
      {
        __typename: 'NetworkParameter',
        key: 'blockchains.ethereumConfig',
        value: JSON.stringify({
          network_id: '3',
          chain_id: '3',
          collateral_bridge_contract: {
            address: '0x947893AaA0A7b55f66990b3B4781514b691Fdd4a',
          },
          multisig_control_contract: {
            address: '0xaE15126d2d1fAbF7cfA7cAD3cbD4921DfC87F620',
            deployment_block_height: 12341882,
          },
          staking_bridge_contract: {
            address: '0x7896C9491962D5839783CB6e0492ECebd34Bb35F',
            deployment_block_height: 11177313,
          },
          token_vesting_contract: {
            address: '0x9F10cBeEf03A564Fb914c2010c0Cd55E9BB11406',
            deployment_block_height: 11177353,
          },
          confirmations: 3,
        }),
      },
    ],
  };
  return merge(defaultResult, override);
};
