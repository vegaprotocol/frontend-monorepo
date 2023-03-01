import produce from 'immer';
import { makeDataProvider, removePaginationWrapper } from '@vegaprotocol/utils';
import {
  MarginsSubscriptionDocument,
  MarginsDocument,
} from './__generated__/Positions';
import type {
  MarginsQuery,
  MarginFieldsFragment,
  MarginsSubscriptionSubscription,
} from './__generated__/Positions';

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
  MarginsSubscriptionSubscription['margins']
>({
  query: MarginsDocument,
  subscriptionQuery: MarginsSubscriptionDocument,
  update,
  getData,
  getDelta,
});
