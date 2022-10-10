import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  MarginsSubscriptionDocument,
  MarginsDocument,
} from './__generated___/Positions';
import type {
  MarginsQuery,
  MarginsSubscriptionSubscription,
} from './__generated___/Positions';

const update = (
  data: MarginsQuery['party'],
  delta: MarginsSubscriptionSubscription['margins']
) => {
  return produce(data, (draft) => {
    const { marketId } = delta;
    if (marketId && draft?.marginsConnection?.edges) {
      const index = draft.marginsConnection.edges.findIndex(
        (edge) => edge.node.market.id === marketId
      );
      if (index !== -1) {
        const currNode = draft.marginsConnection.edges[index].node;
        draft.marginsConnection.edges[index].node = {
          ...currNode,
          maintenanceLevel: delta.maintenanceLevel,
          searchLevel: delta.searchLevel,
          initialLevel: delta.initialLevel,
          collateralReleaseLevel: delta.collateralReleaseLevel,
        };
      } else {
        draft.marginsConnection.edges.unshift({
          __typename: 'MarginEdge',
          node: {
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
          },
        });
      }
    }
  });
};

const getData = (responseData: MarginsQuery) => responseData.party;
const getDelta = (subscriptionData: MarginsSubscriptionSubscription) =>
  subscriptionData.margins;

export const marginsDataProvider = makeDataProvider<
  MarginsQuery,
  MarginsQuery['party'],
  MarginsSubscriptionSubscription,
  MarginsSubscriptionSubscription['margins']
>({
  query: MarginsDocument,
  subscriptionQuery: MarginsSubscriptionDocument,
  update,
  getData,
  getDelta,
});
