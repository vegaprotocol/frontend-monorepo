import { makeDataProvider } from '@vegaprotocol/react-helpers';
import produce from 'immer';
import type { IterableElement } from 'type-fest';
import type {
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsSubscription,
  MarketLiquidityQuery,
} from './__generated___/MarketLiquidity';
import {
  MarketLiquidityDocument,
  LiquidityProvisionsDocument,
} from './__generated___/MarketLiquidity';

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
  MarketLiquidityQuery,
  MarketLiquidityQuery
>({
  query: MarketLiquidityDocument,
  subscriptionQuery: LiquidityProvisionsDocument,
  update: (data, delta) => {
    return delta;
  },
  getData: (data) => {
    return data;
  },
  getDelta: (delta) => {
    return delta;
  },
});

// export const marketLiquidityDataProvider = makeDataProvider<
//   MarketLiquidityQuery,
//   never>){
//   query: MarketLiquidityDocument
//   }

// export const liquidityProviderFeeShareDataProvider = makeDataProvider<
//   MarketLiquidityQuery,

// export const useLiquidityProvision = ({
//   marketId,
//   partyId,
// }: {
//   partyId?: string;
//   marketId?: string;
// }) => {
//   const { param: stakeToCcySiskas } = useNetworkParam(
//     NetworkParams.market_liquidity_stakeToCcySiskas
//   );
//   const stakeToCcySiska = stakeToCcySiskas && stakeToCcySiskas[0];
//   const { data, loading, error } = useMarketLiquidityQuery({
//     variables: { marketId: marketId || '' },
//   });
//   const liquidityData: LiquidityData = getLiquidityData(
//     data,
//     partyId,
//     stakeToCcySiska
//   );
//   return { data: liquidityData, loading, error };
// };

// function getLiquidityData(
//   data: MarketLiquidityQuery | undefined,
//   partyId: string | undefined,
//   stakeToCcySiska: string
// ) {
//   const liquidityProviders = (
//     data?.market?.data?.liquidityProviderFeeShare || []
//   )
//     ?.filter((p) => !partyId || p.party.id === partyId) // if partyId is provided, filter out other parties
//     .map((provider) => {
//       const liquidityProvisionConnection =
//         data?.market?.liquidityProvisionsConnection?.edges?.find(
//           (e) => e?.node.party.id === provider.party.id
//         );
//       const balance =
//         liquidityProvisionConnection?.node?.party.accountsConnection?.edges?.reduce(
//           (acc, e) => {
//             return e?.node.type === AccountType.ACCOUNT_TYPE_BOND // just an extra check to make sure we only use bond accounts
//               ? acc.plus(new BigNumber(e?.node.balance ?? 0))
//               : acc;
//           },
//           new BigNumber(0)
//         );
//       const obligation =
//         stakeToCcySiska &&
//         new BigNumber(stakeToCcySiska)
//           .times(liquidityProvisionConnection?.node?.commitmentAmount ?? 1)
//           .toString();
//       const supplied =
//         stakeToCcySiska &&
//         new BigNumber(stakeToCcySiska).times(balance ?? 1).toString();
//       return {
//         party: provider.party.id,
//         createdAt: liquidityProvisionConnection?.node?.createdAt,
//         updatedAt: liquidityProvisionConnection?.node?.updatedAt,
//         commitmentAmount: liquidityProvisionConnection?.node?.commitmentAmount,
//         fee: liquidityProvisionConnection?.node?.fee,
//         status: liquidityProvisionConnection?.node?.status,
//         equityLikeShare: provider.equityLikeShare,
//         averageEntryValuation: provider.averageEntryValuation,
//         obligation,
//         supplied,
//       };
//     });
//   const liquidityData: LiquidityData = {
//     liquidityProviders,
//     suppliedStake: data?.market?.data?.suppliedStake,
//     targetStake: data?.market?.data?.targetStake,
//     decimalPlaces: data?.market?.decimalPlaces,
//     positionDecimalPlaces: data?.market?.positionDecimalPlaces,
//     code: data?.market?.tradableInstrument.instrument.code,
//     name: data?.market?.tradableInstrument.instrument.name,
//     assetDecimalPlaces:
//       data?.market?.tradableInstrument.instrument.product.settlementAsset
//         .decimals,
//     symbol:
//       data?.market?.tradableInstrument.instrument.product.settlementAsset
//         .symbol,
//   };
//   return liquidityData;
// }

// export const lpDataProvider = makeDerivedDataProvider<LiquidityData, never>(
//   [liquidityDataProvider],
//   (parts) => parts[0]
// );
