import type * as Schema from '@vegaprotocol/types';
import type { Asset } from './asset-data-provider';

export const generateERC20Asset = (
  i: number,
  status: Schema.AssetStatus
): Asset => ({
  id: `E-0${i}`,
  name: `ERC20 0${i}`,
  symbol: `EA0${i}`,
  decimals: 3,
  quantum: '1',
  source: {
    contractAddress: '0x123',
    lifetimeLimit: '123000000',
    withdrawThreshold: '50',
    chainId: '1',
    __typename: 'ERC20',
    chainId: '11',
  },
  status: status,
  __typename: 'Asset',
});

export const generateBuiltinAsset = (
  i: number,
  status: Schema.AssetStatus
): Asset => ({
  id: `B-0${i}`,
  name: `Builtin 0${i}`,
  symbol: `BIA0${i}`,
  decimals: 5,
  quantum: '1',
  source: {
    maxFaucetAmountMint: '5000000000',
    __typename: 'BuiltinAsset',
  },
  status: status,
  __typename: 'Asset',
});
