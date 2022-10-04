import { gql } from '@apollo/client';
import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarginsSubscription,
  MarginsSubscription_margins,
} from './__generated__/MarginsSubscription';
import type { Margins, Margins_party } from './__generated__/Margins';

export const MARGINS_QUERY = gql`
  query Margins($partyId: ID!) {
    party(id: $partyId) {
      id
      marginsConnection {
        edges {
          node {
            market {
              id
            }
            maintenanceLevel
            searchLevel
            initialLevel
            collateralReleaseLevel
            asset {
              id
            }
          }
        }
      }
    }
  }
`;

export const MARGINS_SUBSCRIPTION = gql`
  subscription MarginsSubscription($partyId: ID!) {
    margins(partyId: $partyId) {
      marketId
      asset
      partyId
      maintenanceLevel
      searchLevel
      initialLevel
      collateralReleaseLevel
      timestamp
    }
  }
`;

const update = (data: Margins_party, delta: MarginsSubscription_margins) => {
  return produce(data, (draft) => {
    const { marketId } = delta;
    if (marketId && draft.marginsConnection?.edges) {
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

const getData = (responseData: Margins) => responseData.party;
const getDelta = (subscriptionData: MarginsSubscription) =>
  subscriptionData.margins;

export const marginsDataProvider = makeDataProvider<
  Margins,
  Margins_party,
  MarginsSubscription,
  MarginsSubscription_margins
>({
  query: MARGINS_QUERY,
  subscriptionQuery: MARGINS_SUBSCRIPTION,
  update,
  getData,
  getDelta,
});
