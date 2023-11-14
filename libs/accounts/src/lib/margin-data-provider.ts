import produce from 'immer';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import {
  MarginsSubscriptionDocument,
  MarginsDocument,
  type MarginsQuery,
  type MarginFieldsFragment,
  type MarginsSubscriptionSubscription,
  type MarginsQueryVariables,
} from './__generated__/Margins';

const update = (
  data: MarginFieldsFragment[] | null,
  delta: MarginsSubscriptionSubscription['margins']
) => {
  return produce(data || [], (draft) => {
    const { marketId } = delta;
    const index = draft.findIndex((node) => node.market.id === marketId);
    if (index !== -1) {
      const currNode = draft[index];
      draft[index] = {
        ...currNode,
        maintenanceLevel: delta.maintenanceLevel,
        searchLevel: delta.searchLevel,
        initialLevel: delta.initialLevel,
        collateralReleaseLevel: delta.collateralReleaseLevel,
      };
    } else {
      draft.unshift({
        __typename: 'MarginLevels',
        market: {
          __typename: 'Market',
          id: delta.marketId,
        },
        maintenanceLevel: delta.maintenanceLevel,
        searchLevel: delta.searchLevel,
        initialLevel: delta.initialLevel,
        collateralReleaseLevel: delta.collateralReleaseLevel,
        asset: {
          __typename: 'Asset',
          id: delta.asset,
        },
      });
    }
  });
};

const getData = (responseData: MarginsQuery | null) =>
  removePaginationWrapper(responseData?.party?.marginsConnection?.edges) || [];

const getDelta = (subscriptionData: MarginsSubscriptionSubscription) =>
  subscriptionData.margins;

export const marginsDataProvider = makeDataProvider<
  MarginsQuery,
  MarginFieldsFragment[],
  MarginsSubscriptionSubscription,
  MarginsSubscriptionSubscription['margins'],
  MarginsQueryVariables
>({
  query: MarginsDocument,
  subscriptionQuery: MarginsSubscriptionDocument,
  update,
  getData,
  getDelta,
});

export const marketMarginDataProvider = makeDerivedDataProvider<
  MarginFieldsFragment,
  never,
  MarginsQueryVariables & { marketId: string }
>(
  [marginsDataProvider],
  (data, { marketId }) =>
    (data[0] as MarginFieldsFragment[]).find(
      (margin) => margin.market.id === marketId
    ) || null
);
