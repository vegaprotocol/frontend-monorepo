import compact from 'lodash/compact';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import produce from 'immer';

import {
  LiquidityProviderFeeShareDocument,
  LiquidityProvisionsDocument,
  LiquidityProvisionsUpdateDocument,
} from './__generated__/MarketLiquidity';

import type {
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareQueryVariables,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsQuery,
  LiquidityProvisionsQueryVariables,
  LiquidityProvisionsUpdateSubscription,
} from './__generated__/MarketLiquidity';

export const liquidityProvisionsDataProvider = makeDataProvider<
  LiquidityProvisionsQuery,
  LiquidityProvisionFieldsFragment[],
  LiquidityProvisionsUpdateSubscription,
  LiquidityProvisionsUpdateSubscription['liquidityProvisions'],
  LiquidityProvisionsQueryVariables
>({
  query: LiquidityProvisionsDocument,
  subscriptionQuery: LiquidityProvisionsUpdateDocument,
  update: (
    data: LiquidityProvisionFieldsFragment[] | null,
    deltas: LiquidityProvisionsUpdateSubscription['liquidityProvisions']
  ) => {
    return produce(data || [], (draft) => {
      deltas?.forEach((delta) => {
        const index = draft.findIndex((a) => delta.id === a.id);
        if (index !== -1) {
          draft[index].commitmentAmount = delta.commitmentAmount;
          draft[index].fee = delta.fee;
          draft[index].updatedAt = delta.updatedAt;
          draft[index].status = delta.status;
        } else {
          draft.unshift({
            id: delta.id,
            commitmentAmount: delta.commitmentAmount,
            fee: delta.fee,
            status: delta.status,
            updatedAt: delta.updatedAt,
            createdAt: delta.createdAt,
            party: {
              id: delta.partyID,
            },
            // TODO add accounts connection to the subscription
          });
        }
      });
    });
  },
  getData: (responseData: LiquidityProvisionsQuery | null) => {
    return (
      responseData?.market?.liquidityProvisionsConnection?.edges?.map(
        (e) => e?.node
      ) ?? []
    ).filter((e) => !!e) as LiquidityProvisionFieldsFragment[];
  },
  getDelta: (
    subscriptionData: LiquidityProvisionsUpdateSubscription
  ): LiquidityProvisionsUpdateSubscription['liquidityProvisions'] => {
    return subscriptionData.liquidityProvisions;
  },
});

export const liquidityFeeShareDataProvider = makeDataProvider<
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareFieldsFragment[],
  never,
  never,
  LiquidityProviderFeeShareQueryVariables
>({
  query: LiquidityProviderFeeShareDocument,
  getData: (data) => {
    return data?.market?.data?.liquidityProviderFeeShare || [];
  },
});

export type Filter = { partyId?: string; active?: boolean };

export const lpAggregatedDataProvider = makeDerivedDataProvider<
  LiquidityProvisionData[],
  never,
  LiquidityProvisionsQueryVariables & { filter?: Filter }
>(
  [
    (callback, client, variables) =>
      liquidityProvisionsDataProvider(callback, client, {
        marketId: variables.marketId,
      }),
    (callback, client, variables) =>
      liquidityFeeShareDataProvider(callback, client, {
        marketId: variables.marketId,
      }),
  ],
  (
    [liquidityProvisions, liquidityFeeShare],
    { filter }
  ): LiquidityProvisionData[] => {
    return getLiquidityProvision(
      liquidityProvisions,
      liquidityFeeShare,
      filter
    );
  }
);

export const matchFilter = (
  filter: Filter,
  lp: LiquidityProvisionFieldsFragment
) => {
  if (filter.partyId && lp.party.id !== filter.partyId) {
    return false;
  }
  if (
    filter.active === true &&
    lp.status !== Schema.LiquidityProvisionStatus.STATUS_ACTIVE
  ) {
    return false;
  }
  if (
    filter.active === false &&
    lp.status === Schema.LiquidityProvisionStatus.STATUS_ACTIVE
  ) {
    return false;
  }
  return true;
};

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  liquidityFeeShare: LiquidityProviderFeeShareFieldsFragment[],
  filter?: Filter
): LiquidityProvisionData[] => {
  return liquidityProvisions
    .filter((lp) => {
      if (
        ![
          Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
          Schema.LiquidityProvisionStatus.STATUS_UNDEPLOYED,
          Schema.LiquidityProvisionStatus.STATUS_PENDING,
        ].includes(lp.status)
      ) {
        return false;
      }
      if (filter && !matchFilter(filter, lp)) {
        return false;
      }
      return true;
    })
    .map((lp) => {
      const feeShare = liquidityFeeShare.find(
        (f) => f.party.id === lp.party.id
      );
      if (!feeShare) return lp;
      const accounts = compact(lp.party.accountsConnection?.edges).map(
        (e) => e.node
      );
      const bondAccounts = accounts?.filter(
        (a) => a?.type === Schema.AccountType.ACCOUNT_TYPE_BOND
      );
      const balance =
        bondAccounts
          ?.reduce(
            (acc, a) => acc.plus(new BigNumber(a.balance ?? 0)),
            new BigNumber(0)
          )
          .toString() || '0';
      return {
        ...lp,
        averageEntryValuation: feeShare?.averageEntryValuation,
        equityLikeShare: feeShare?.equityLikeShare,
        balance,
      };
    });
};

export interface LiquidityProvisionData
  extends LiquidityProvisionFieldsFragment {
  assetDecimalPlaces?: number;
  balance?: string;
  averageEntryValuation?: string;
  equityLikeShare?: string;
}
