import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  LiquidityProvidersQuery,
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

export const liquidityProvidersQuery = (
  override?: PartialDeep<LiquidityProvidersQuery>
): LiquidityProvidersQuery => {
  const defaultResult: LiquidityProvidersQuery = {
    liquidityProviders: {
      edges: [
        {
          node: {
            partyId:
              '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            marketId:
              '5ddb6f1570c0ef7aea41ebfef234dbded4ce2c11722cf033954459c45c30c057',
            feeShare: {
              equityLikeShare: '1',
              averageEntryValuation: '3570452966575.2571864668476351',
              averageScore: '0',
              virtualStake: '296386536856.9999884883855020',
            },
            sla: {
              currentEpochFractionOfTimeOnBook: '0',
              lastEpochFractionOfTimeOnBook: '0',
              lastEpochFeePenalty: '1',
              lastEpochBondPenalty: '0.05',
              hysteresisPeriodFeePenalties: ['1'],
              requiredLiquidity: '',
              notionalVolumeBuys: '',
              notionalVolumeSells: '',
            },
          },
        },
        {
          node: {
            partyId:
              'cc464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            marketId:
              '5ddb6f1570c0ef7aea41ebfef234dbded4ce2c11722cf033954459c45c30c057',
            feeShare: {
              equityLikeShare: '1',
              averageEntryValuation: '3570452966575.2571864668476351',
              averageScore: '0',
              virtualStake: '296386536856.9999884883855020',
            },
            sla: {
              currentEpochFractionOfTimeOnBook: '0',
              lastEpochFractionOfTimeOnBook: '0',
              lastEpochFeePenalty: '1',
              lastEpochBondPenalty: '0.05',
              hysteresisPeriodFeePenalties: ['1'],
              requiredLiquidity: '',
              notionalVolumeBuys: '',
              notionalVolumeSells: '',
            },
          },
        },
      ],
    },
  };
  return merge(defaultResult, override);
};

export const liquidityFields: LiquidityProvisionFieldsFragment[] = [
  {
    id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
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
    id: 'cc464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
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
