import { accountsDataProvider } from '@vegaprotocol/accounts';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
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
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareUpdateSubscription,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsQuery,
  LiquidityProvisionsUpdateSubscription,
} from './__generated__/MarketLiquidity';
import type { Account } from '@vegaprotocol/accounts';
export const liquidityProvisionsDataProvider = makeDataProvider<
  LiquidityProvisionsQuery,
  LiquidityProvisionFieldsFragment[],
  LiquidityProvisionsUpdateSubscription,
  LiquidityProvisionsUpdateSubscription['liquidityProvisions']
>({
  query: LiquidityProvisionsDocument,
  subscriptionQuery: LiquidityProvisionsUpdateDocument,
  update: (
    data: LiquidityProvisionFieldsFragment[],
    deltas: LiquidityProvisionsUpdateSubscription['liquidityProvisions']
  ) => {
    return produce(data, (draft) => {
      deltas?.forEach((delta) => {
        const id = delta.partyID;
        const index = draft.findIndex((a) => a.party.id === id);
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
  getData: (responseData: LiquidityProvisionsQuery) => {
    return (
      responseData.market?.liquidityProvisionsConnection?.edges?.map(
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

export const marketLiquidityDataProvider = makeDataProvider<
  MarketLpQuery,
  MarketLpQuery,
  never,
  never
>({
  query: MarketLpDocument,
  getData: (responseData: MarketLpQuery) => {
    return responseData;
  },
});

export const liquidityFeeShareDataProvider = makeDataProvider<
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareFieldsFragment[],
  LiquidityProviderFeeShareUpdateSubscription,
  LiquidityProviderFeeShareUpdateSubscription['marketsData'][0]['liquidityProviderFeeShare']
>({
  query: LiquidityProviderFeeShareDocument,
  subscriptionQuery: LiquidityProviderFeeShareUpdateDocument,
  update: (
    data: LiquidityProviderFeeShareFieldsFragment[],
    deltas: LiquidityProviderFeeShareUpdateSubscription['marketsData'][0]['liquidityProviderFeeShare']
  ) => {
    return produce(data, (draft) => {
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
    return data.market?.data?.liquidityProviderFeeShare || [];
  },
  getDelta: (subscriptionData: LiquidityProviderFeeShareUpdateSubscription) => {
    return subscriptionData.marketsData[0].liquidityProviderFeeShare;
  },
});

export const lpAggregatedDataProvider = makeDerivedDataProvider(
  [
    (callback, client, variables) =>
      liquidityProvisionsDataProvider(callback, client, {
        marketId: variables?.marketId,
      }),
    (callback, client, variables) =>
      accountsDataProvider(callback, client, {
        partyId: variables?.partyId || '', // party Id can not be null
      }),
    marketLiquidityDataProvider,
    liquidityFeeShareDataProvider,
  ],
  ([
    liquidityProvisions,
    accounts,
    marketLiquidity,
    liquidityFeeShare,
  ]): LiquidityProvisionData[] => {
    return getLiquidityProvision(
      liquidityProvisions,
      accounts,
      marketLiquidity,
      liquidityFeeShare
    );
  }
);

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  accounts: Account[],
  marketLiquidity: MarketLpQuery,
  liquidityFeeShare: LiquidityProviderFeeShareFieldsFragment[]
): LiquidityProvisionData[] => {
  return liquidityProvisions.map((lp) => {
    const market = marketLiquidity?.market;
    const feeShare = liquidityFeeShare.find((f) => f.party.id === lp.party.id);
    if (!feeShare) return lp;
    const lpData: LiquidityProvisionData = {
      ...lp,
      averageEntryValuation: feeShare?.averageEntryValuation,
      equityLikeShare: feeShare?.equityLikeShare,
      assetDecimalPlaces:
        market?.tradableInstrument.instrument.product.settlementAsset.decimals,
      balance:
        accounts
          ?.filter((a) => a?.type === AccountType.ACCOUNT_TYPE_BOND)
          ?.reduce(
            (acc, a) => acc.plus(new BigNumber(a.balance ?? 0)),
            new BigNumber(0)
          )
          .toString() ?? '0',
    };
    return lpData;
  });
};

export interface LiquidityProvisionData
  extends LiquidityProvisionFieldsFragment {
  assetDecimalPlaces?: number;
  balance?: string;
  averageEntryValuation?: string;
  equityLikeShare?: string;
}
