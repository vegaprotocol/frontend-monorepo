import { AccountType } from '@vegaprotocol/types';
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
  const account: WithdrawFormQuery_party_accounts = {
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000000',
    asset: {
      __typename: 'Asset',
      id: 'asset-0',
      symbol: 'AST0',
    },
    __typename: 'Account',
  };
  const assetEdge1: WithdrawFormQuery_assetsConnection_edges = {
    node: {
      id: 'asset-0',
      symbol: 'AST0',
      name: 'Asset 0',
      decimals: 5,
      source: {
        __typename: 'ERC20',
        contractAddress: '0x5E4b9aDA947130Fc320a144cd22bC1641e5c9d81',
      },
      __typename: 'Asset',
    },
    __typename: 'AssetEdge',
  };
  const assetEdge2: WithdrawFormQuery_assetsConnection_edges = {
    node: {
      id: 'asset-1',
      symbol: 'AST1',
      name: 'Asset 1',
      decimals: 5,
      source: {
        __typename: 'ERC20',
        contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
      },
      __typename: 'Asset',
    },
    __typename: 'AssetEdge',
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
