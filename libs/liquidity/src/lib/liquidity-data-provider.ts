import compact from 'lodash/compact';
import { makeDataProvider, makeDerivedDataProvider } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import produce from 'immer';

import {
  LiquidityProviderFeeShareDocument,
  LiquidityProviderFeeShareUpdateDocument,
  LiquidityProvisionsDocument,
  LiquidityProvisionsUpdateDocument,
  MarketLpDocument,
} from './__generated__/MarketLiquidity';

import type {
  MarketLpQuery,
  MarketLpQueryVariables,
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareQueryVariables,
  LiquidityProviderFeeShareUpdateSubscription,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsQuery,
  LiquidityProvisionsQueryVariables,
  LiquidityProvisionsUpdateSubscription,
} from './__generated__/MarketLiquidity';
import type { IterableElement } from 'type-fest';

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
        const id = getId(delta);
        const index = draft.findIndex((a) => getId(a) === id);
        if (index !== -1) {
          draft[index].commitmentAmount = delta.commitmentAmount;
          draft[index].fee = delta.fee;
          draft[index].updatedAt = delta.updatedAt;
          draft[index].status = delta.status;
        } else {
          draft.unshift({
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

function isLpFragment(
  entry:
    | LiquidityProvisionFieldsFragment
    | IterableElement<
        LiquidityProvisionsUpdateSubscription['liquidityProvisions']
      >
): entry is LiquidityProvisionFieldsFragment {
  return entry.__typename === 'LiquidityProvision';
}

export const getId = (
  entry:
    | LiquidityProvisionFieldsFragment
    | IterableElement<
        LiquidityProvisionsUpdateSubscription['liquidityProvisions']
      >
) =>
  isLpFragment(entry)
    ? `${entry.party.id}${entry.status}${entry.createdAt}`
    : `${entry.partyID}${entry.status}${entry.createdAt}`;

export const marketLiquidityDataProvider = makeDataProvider<
  MarketLpQuery,
  MarketLpQuery,
  never,
  never,
  MarketLpQueryVariables
>({
  query: MarketLpDocument,
  getData: (responseData: MarketLpQuery | null) => {
    return responseData;
  },
});

export const liquidityFeeShareDataProvider = makeDataProvider<
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareFieldsFragment[],
  LiquidityProviderFeeShareUpdateSubscription,
  LiquidityProviderFeeShareUpdateSubscription['marketsData'][0]['liquidityProviderFeeShare'],
  LiquidityProviderFeeShareQueryVariables
>({
  query: LiquidityProviderFeeShareDocument,
  subscriptionQuery: LiquidityProviderFeeShareUpdateDocument,
  update: (
    data: LiquidityProviderFeeShareFieldsFragment[] | null,
    deltas: LiquidityProviderFeeShareUpdateSubscription['marketsData'][0]['liquidityProviderFeeShare']
  ) => {
    return produce(data || [], (draft) => {
      deltas?.forEach((delta) => {
        const id = delta.partyId;
        const index = draft.findIndex((a) => a.party.id === id);
        if (index !== -1) {
          draft[index].equityLikeShare = delta.equityLikeShare;
          draft[index].averageEntryValuation = delta.averageEntryValuation;
        } else {
          draft.unshift({
            equityLikeShare: delta.equityLikeShare,
            averageEntryValuation: delta.averageEntryValuation,
            party: {
              id: delta.partyId,
            },
            // TODO add accounts connection to the subscription
          });
        }
      });
    });
  },
  getData: (data) => {
    return data?.market?.data?.liquidityProviderFeeShare || [];
  },
  getDelta: (subscriptionData: LiquidityProviderFeeShareUpdateSubscription) => {
    return subscriptionData.marketsData[0].liquidityProviderFeeShare;
  },
});

export const lpAggregatedDataProvider = makeDerivedDataProvider<
  ReturnType<typeof getLiquidityProvision>,
  never,
  MarketLpQueryVariables
>(
  [
    liquidityProvisionsDataProvider,
    marketLiquidityDataProvider,
    liquidityFeeShareDataProvider,
  ],
  ([
    liquidityProvisions,
    marketLiquidity,
    liquidityFeeShare,
  ]): LiquidityProvisionData[] => {
    return getLiquidityProvision(
      liquidityProvisions,
      marketLiquidity,
      liquidityFeeShare
    );
  }
);

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  marketLiquidity: MarketLpQuery,
  liquidityFeeShare: LiquidityProviderFeeShareFieldsFragment[]
): LiquidityProvisionData[] => {
  return liquidityProvisions
    .map((lp) => {
      const market = marketLiquidity?.market;
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
        assetDecimalPlaces:
          market?.tradableInstrument.instrument.product.settlementAsset
            .decimals,
        balance,
      };
    })
    .filter((e) =>
      [
        Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
        Schema.LiquidityProvisionStatus.STATUS_UNDEPLOYED,
        Schema.LiquidityProvisionStatus.STATUS_PENDING,
      ].includes(e.status)
    );
};

export interface LiquidityProvisionData
  extends LiquidityProvisionFieldsFragment {
  assetDecimalPlaces?: number;
  balance?: string;
  averageEntryValuation?: string;
  equityLikeShare?: string;
}
