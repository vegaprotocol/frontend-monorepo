import type { AssetStatus } from '@vegaprotocol/types';
import type { Asset } from './asset-data-provider';

export const generateERC20Asset = (i: number, status: AssetStatus): Asset => ({
  id: `E-0${i}`,
  name: `ERC20 0${i}`,
  symbol: `EA0${i}`,
  decimals: 3,
  quantum: '1',
  source: {
    contractAddress: '0x123',
    lifetimeLimit: '123000000',
    withdrawThreshold: '50',
    __typename: 'ERC20',
  },
  status: status,
  infrastructureFeeAccount: {
    balance: '1',
    __typename: 'Account',
  },
  globalRewardPoolAccount: {
    balance: '2',
    __typename: 'Account',
  },
  takerFeeRewardAccount: {
    balance: '3',
    __typename: 'Account',
  },
  makerFeeRewardAccount: {
    balance: '4',
    __typename: 'Account',
  },
  lpFeeRewardAccount: {
    balance: '5',
    __typename: 'Account',
  },
  marketProposerRewardAccount: {
    balance: '6',
    __typename: 'Account',
  },
  __typename: 'Asset',
});

export const generateBuiltinAsset = (
  i: number,
  status: AssetStatus
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
  infrastructureFeeAccount: {
    balance: '0',
    __typename: 'Account',
  },
  globalRewardPoolAccount: null,
  takerFeeRewardAccount: null,
  makerFeeRewardAccount: null,
  lpFeeRewardAccount: null,
  marketProposerRewardAccount: null,
  __typename: 'Asset',
});
