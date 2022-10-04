import { AccountType, AssetStatus } from '@vegaprotocol/types';
import type {
  WithdrawFormQuery,
  WithdrawFormQuery_assetsConnection_edges,
  WithdrawFormQuery_party_accounts,
  WithdrawFormQuery_party_withdrawals,
} from '@vegaprotocol/withdraws';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateWithdrawFormQuery = (
  override?: PartialDeep<WithdrawFormQuery>
): WithdrawFormQuery => {
  const withdrawal: WithdrawFormQuery_party_withdrawals = {
    id: 'withdrawal-0',
    txHash: null,
    __typename: 'Withdrawal',
  };

  // NOTE: These assets ids and contract addresses are real assets on Sepolia, this is needed
  // because we don't currently mock our seplia infura provider. If we change network these will
  // need to be updated
  const assetEdge1: WithdrawFormQuery_assetsConnection_edges = {
    node: {
      id: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
      symbol: 'tBTC',
      name: 'Sepolia tBTC',
      decimals: 5,
      status: AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20',
        contractAddress: '0x1d525fB145Af5c51766a89706C09fE07E6058D1D',
      },
      __typename: 'Asset',
    },
    __typename: 'AssetEdge',
  };
  const assetEdge2: WithdrawFormQuery_assetsConnection_edges = {
    node: {
      id: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
      symbol: 'tUSDC',
      name: 'Sepolia tUSDC',
      decimals: 5,
      status: AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20',
        contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
      },
      __typename: 'Asset',
    },
    __typename: 'AssetEdge',
  };
  const account: WithdrawFormQuery_party_accounts = {
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000000',
    asset: {
      __typename: 'Asset',
      id: assetEdge1.node.id,
      symbol: 'AST0',
    },
    __typename: 'Account',
  };

  const defaultResult = {
    party: {
      id: 'party-0',
      withdrawals: [withdrawal],
      accounts: [account],
      __typename: 'Party',
    },
    assetsConnection: {
      __typename: 'AssetsConnection',
      edges: [assetEdge1, assetEdge2],
    },
  };
  return merge(defaultResult, override);
};
