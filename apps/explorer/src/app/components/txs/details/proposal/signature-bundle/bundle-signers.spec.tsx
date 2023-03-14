import type { EncodeListAssetParameters } from '../../../../../lib/encoders/abis/list-asset';
import type { BridgeFunction } from './bundle-signers';
import {
  getBridgeAddressFromNetworkParameter,
  getSigners,
} from './bundle-signers';

describe('Bundle Signers helpers', () => {
  it('getBridgeAddressFromNetworkParameter handles invalid json', () => {
    expect(getBridgeAddressFromNetworkParameter('hi')).toEqual(null);
    expect(getBridgeAddressFromNetworkParameter('{hi]')).toEqual(null);
    expect(getBridgeAddressFromNetworkParameter('{"hi"}')).toEqual(null);
    expect(
      getBridgeAddressFromNetworkParameter(false as unknown as string)
    ).toEqual(null);
  });

  it('getBridgeAddressFromNetworkParameter returns null if bridge adderss is not in expected place', () => {
    expect(
      getBridgeAddressFromNetworkParameter(`{
            "NetworkParamter": false
        }`)
    ).toEqual(null);

    expect(
      getBridgeAddressFromNetworkParameter(`{
            "network_id": "11155111",
            "chain_id": "11155111",
            "confirmations": 3,
            "staking_bridge_contract": {
                "address": "0xFFb0A0d4806502ceF491aF1141f66669A1Bd0D03",
                "deployment_block_height": 2011705
            },
            "token_vesting_contract": {
                "address": "0x680fF88252FA7071CAce7398e77872d54D781d0B",
                "deployment_block_height": 2011709
            },
            "multisig_control_contract": {
                "address": "0x6eBc32d66277D94DB8FF2ccF86E36f37F29a52D3",
                "deployment_block_height": 2011699
            }
        }`)
    ).toEqual(null);
  });

  it('getBridgeAddressFromNetworkParameter returns address if the collateral_bridge_contract has an address', () => {
    expect(
      getBridgeAddressFromNetworkParameter(`{
             "network_id": "11155111",
             "chain_id": "11155111",
             "confirmations": 3,
             "collateral_bridge_contract": {
                 "address": "0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799"
             },
             "staking_bridge_contract": {
                 "address": "0xFFb0A0d4806502ceF491aF1141f66669A1Bd0D03",
                 "deployment_block_height": 2011705
             },
             "token_vesting_contract": {
                 "address": "0x680fF88252FA7071CAce7398e77872d54D781d0B",
                 "deployment_block_height": 2011709
             },
             "multisig_control_contract": {
                 "address": "0x6eBc32d66277D94DB8FF2ccF86E36f37F29a52D3",
                 "deployment_block_height": 2011699
             }
         }`)
    ).toEqual('0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799');
  });

  it('getSigners to return [] in the case of bad inputs', () => {
    expect(
      getSigners('list_asset', '123', '', {
        assetERC20: '123',
        assetId: '456',
        limit: 'bad',
        threshold: 'data',
        nonce: 'here',
      })
    ).toEqual([]);

    expect(
      getSigners('nothing' as unknown as BridgeFunction, '123', '', {
        nonce: 'here',
      } as unknown as EncodeListAssetParameters)
    ).toEqual([]);

    expect(
      getSigners('set_asset_limits', '0x123', '0x456', {
        nonce: 'here',
      } as unknown as EncodeListAssetParameters)
    ).toEqual([]);
  });
});
