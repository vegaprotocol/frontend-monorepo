import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import produce from 'immer';
import { AccountType } from '@vegaprotocol/types';
import { LiquidityProviderFeeShareUpdateDocument } from './__generated___/MarketLiquidity';
import {
  LiquidityProviderFeeShareDocument,
  MarketLpDocument,
} from './__generated___/MarketLiquidity';
import type {
  MarketLpQuery,
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProviderFeeShareQuery,
  LiquidityProviderFeeShareUpdateSubscription,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsQuery,
  LiquidityProvisionsUpdateSubscription,
} from './__generated___/MarketLiquidity';
import { LiquidityProvisionsUpdateDocument } from './__generated___/MarketLiquidity';
import { LiquidityProvisionsDocument } from './__generated___/MarketLiquidity';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';

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
  ): LiquidityProvisionsUpdateSubscription['liquidityProvisions'] =>
    subscriptionData.liquidityProvisions,
});

export const marketLiquidityDataProvider = makeDataProvider<
  MarketLpQuery,
  MarketLpQuery,
  never,
  never
>({
  query: MarketLpDocument,
  getData: (responseData: MarketLpQuery) => responseData,
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
  getData: (data) => data.market?.data?.liquidityProviderFeeShare || [],
  getDelta: (subscriptionData: LiquidityProviderFeeShareUpdateSubscription) =>
    subscriptionData.marketsData[0].liquidityProviderFeeShare,
});

export const lpAggregatedDataProvider = makeDerivedDataProvider(
  [
    liquidityProvisionsDataProvider,
    marketLiquidityDataProvider,
    liquidityFeeShareDataProvider,
    accountsDataProvider,
  ],
  ([
    liquidityProvisions,
    marketLiquidity,
    liquidityFeeShare,
    accounts,
  ]): LiquidityProvisionData[] => {
    return getLiquidityProvision(
      liquidityProvisions,
      marketLiquidity,
      liquidityFeeShare,
      accounts
    );
  }
);

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  marketLiquidity: MarketLpQuery,
  liquidityFeeShare: LiquidityProviderFeeShareFieldsFragment[],
  accounts: Account[]
): LiquidityProvisionData[] => {
  // liquidityProvisions and liquidityFeeShare are two arrays that need to be merged based on the party id
  // liquidityProvisions comes from a subscription or a query
  // liquidityFeeShare comes from a query
  // accounts come from subscription or query
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
          ?.filter(
            (a) => a?.type === AccountType.ACCOUNT_TYPE_BOND
            // && a?.party.id === lp.party.id
          )
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
