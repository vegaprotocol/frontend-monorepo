import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  LiquidityProviderFeeShareQuery,
  LiquidityProvisionsQuery,
} from './__generated__/MarketLiquidity';
import type { LiquidityProvisionFieldsFragment } from './__generated__/MarketLiquidity';

export const liquidityProvisionsQuery = (
  override?: PartialDeep<LiquidityProvisionsQuery>
): LiquidityProvisionsQuery => {
  const defaultResult: LiquidityProvisionsQuery = {
    market: {
      liquidityProvisionsConnection: {
        __typename: 'LiquidityProvisionsConnection',
        edges: liquidityFields.map((node) => {
          return {
            __typename: 'LiquidityProvisionsEdge',
            node,
          };
        }),
      },
    },
  };
  return merge(defaultResult, override);
};

export const liquidityProviderFeeShareQuery = (
  override?: PartialDeep<LiquidityProviderFeeShareQuery>
): LiquidityProviderFeeShareQuery => {
  const defaultResult: LiquidityProviderFeeShareQuery = {
    market: {
      id: 'market-0',
      data: {
        market: {
          id: 'market-0',
          __typename: 'Market',
        },
        liquidityProviderFeeShare: [
          {
            party: {
              id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
              __typename: 'Party',
            },
            equityLikeShare: '1',
            averageEntryValuation: '68585293691.5598054356207737',
            __typename: 'LiquidityProviderFeeShare',
          },
          {
            party: {
              id: 'cc464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
              __typename: 'Party',
            },
            equityLikeShare: '1',
            averageEntryValuation: '68585293691.5598054356207737',
            __typename: 'LiquidityProviderFeeShare',
          },
        ],
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};

export const liquidityFields: LiquidityProvisionFieldsFragment[] = [
  {
    party: {
      id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
      accountsConnection: {
        edges: [
          {
            node: {
              type: Schema.AccountType.ACCOUNT_TYPE_BOND,
              balance: '400000000',
              __typename: 'AccountBalance',
            },
            __typename: 'AccountEdge',
          },
        ],
        __typename: 'AccountsConnection',
      },
      __typename: 'Party',
    },
    createdAt: '2023-05-15T11:47:15.132571Z',
    updatedAt: '2023-05-15T11:47:15.132571Z',
    commitmentAmount: '400000000',
    fee: '0.0009',
    status: Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
    __typename: 'LiquidityProvision',
  },
  {
    party: {
      id: 'cc464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
      accountsConnection: {
        edges: [
          {
            node: {
              type: Schema.AccountType.ACCOUNT_TYPE_BOND,
              balance: '200000000',
              __typename: 'AccountBalance',
            },
            __typename: 'AccountEdge',
          },
        ],
        __typename: 'AccountsConnection',
      },
      __typename: 'Party',
    },
    createdAt: '2023-05-15T11:47:15.132571Z',
    updatedAt: '2023-05-15T11:47:15.132571Z',
    commitmentAmount: '400000000',
    fee: '0.004',
    status: Schema.LiquidityProvisionStatus.STATUS_PENDING,
    __typename: 'LiquidityProvision',
  },
];
