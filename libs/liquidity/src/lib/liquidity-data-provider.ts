import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import produce from 'immer';
import type { IterableElement } from 'type-fest';
import type {
  LiquidityProviderFeeShareFieldsFragment,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsSubscription,
  MarketLiquidityQuery,
} from './__generated___/MarketLiquidity';
import { LiquidityProvisionsDocument } from './__generated___/MarketLiquidity';
import { MarketLiquidityDocument } from './__generated___/MarketLiquidity';

export function isLpFragment(
  lp:
    | LiquidityProvisionFieldsFragment
    | IterableElement<LiquidityProvisionsSubscription['liquidityProvisions']>
): lp is LiquidityProvisionFieldsFragment {
  return (lp as LiquidityProvisionFieldsFragment).party !== undefined;
}

export const getId = (
  lp:
    | LiquidityProvisionFieldsFragment
    | IterableElement<LiquidityProvisionsSubscription['liquidityProvisions']>
) => (isLpFragment(lp) ? lp.party.id : lp.partyID);

export const update = (
  data: LiquidityProvisionFieldsFragment[],
  deltas: LiquidityProvisionsSubscription['liquidityProvisions']
) => {
  return produce(data, (draft) => {
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
};

const getData = (responseData: MarketLiquidityQuery) => {
  return (
    responseData.market?.liquidityProvisionsConnection?.edges?.map(
      (e) => e?.node
    ) ?? []
  ).filter((e) => !!e) as LiquidityProvisionFieldsFragment[];
};

const getDelta = (
  subscriptionData: LiquidityProvisionsSubscription
): LiquidityProvisionsSubscription['liquidityProvisions'] =>
  subscriptionData.liquidityProvisions;

export const liquidityProvisionsDataProvider = makeDataProvider<
  MarketLiquidityQuery,
  LiquidityProvisionFieldsFragment[],
  LiquidityProvisionsSubscription,
  LiquidityProvisionsSubscription['liquidityProvisions']
>({
  query: MarketLiquidityDocument,
  subscriptionQuery: LiquidityProvisionsDocument,
  update,
  getData,
  getDelta,
});

export const marketLiquidityDataProvider = makeDataProvider<
  MarketLiquidityQuery,
  MarketLiquidityQuery,
  never,
  never
>({
  query: MarketLiquidityDocument,
  getData: (responseData: MarketLiquidityQuery) => responseData,
});

export const liquidityFeeShareDataProvider = makeDataProvider<
  MarketLiquidityQuery,
  LiquidityProviderFeeShareFieldsFragment[],
  never,
  never
>({
  query: MarketLiquidityDocument,
  getData: (data) => {
    return data.market?.data?.liquidityProviderFeeShare || [];
  },
});

export const lpAggregatedDataProvider = makeDerivedDataProvider<
  LiquidityProvisionFieldsFragment[],
  never
>(
  [
    liquidityProvisionsDataProvider,
    marketLiquidityDataProvider,
    liquidityFeeShareDataProvider,
  ],
  ([liquidityProvisions, marketLiquidity, liquidityFeeShare]) => {
    return getLiquidityProvision(
      liquidityProvisions,
      marketLiquidity,
      liquidityFeeShare
    );
  }
);

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  marketLiquidity: MarketLiquidityQuery,
  liquidityFeeShare: LiquidityProviderFeeShareFieldsFragment[]
) => {
  // liquidityProvisions and liquidityFeeShare are two arrays that need to be merged based on the party id
  // liquidityProvisions comes from a subscription or a query
  // liquidityFeeShare comes from a query
  return liquidityProvisions.map((lp) => {
    const market = marketLiquidity?.market;
    const feeShare = liquidityFeeShare.find((f) => f.party.id === lp.party.id);
    if (!feeShare) return lp;
    return {
      ...lp,
      tradableInstrument: market?.tradableInstrument,
      averageEntryValuation: feeShare?.averageEntryValuation,
      equityLikeShare: feeShare?.equityLikeShare,
      pubKey: lp.party.id,
      assetDecimalPlaces:
        market?.tradableInstrument.instrument.product.settlementAsset.decimals,
    };
  });
};
