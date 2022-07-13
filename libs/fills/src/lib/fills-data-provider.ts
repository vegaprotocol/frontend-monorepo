import produce from 'immer';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type { FillFields } from './__generated__/FillFields';
import type {
  Fills,
  Fills_party_tradesPaged_edges,
} from './__generated__/Fills';
import type { FillsSub } from './__generated__/FillsSub';

const FILL_FRAGMENT = gql`
  fragment FillFields on Trade {
    id
    createdAt
    price
    size
    buyOrder
    sellOrder
    buyer {
      id
    }
    seller {
      id
    }
    market {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          code
        }
      }
    }
  }
`;

export const FILLS_QUERY = gql`
  ${FILL_FRAGMENT}
  query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
    party(id: $partyId) {
      id
      tradesPaged(marketId: $marketId, pagination: $pagination) {
        totalCount
        edges {
          node {
            ...FillFields
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const FILLS_SUB = gql`
  ${FILL_FRAGMENT}
  subscription FillsSub($partyId: ID!) {
    trades(partyId: $partyId) {
      ...FillFields
    }
  }
`;

const update = (data: Fills_party_tradesPaged_edges[], delta: FillFields[]) => {
  return produce(data, (draft) => {
    delta.forEach((node) => {
      const index = draft.findIndex((edge) => edge.node.id === node.id);
      if (index !== -1) {
        Object.assign(draft[index].node, node);
      } else {
        draft.unshift({ node, cursor: '', __typename: 'TradeEdge' });
      }
    });
  });
};

const getData = (responseData: Fills): Fills_party_tradesPaged_edges[] | null =>
  responseData.party?.tradesPaged.edges || null;

const getPageInfo = (responseData: Fills): PageInfo | null =>
  responseData.party?.tradesPaged.pageInfo || null;

const getTotalCount = (responseData: Fills): number | undefined =>
  responseData.party?.tradesPaged.totalCount;

const getDelta = (subscriptionData: FillsSub) => subscriptionData.trades || [];

export const fillsDataProvider = makeDataProvider(
  FILLS_QUERY,
  FILLS_SUB,
  update,
  getData,
  getDelta,
  {
    getPageInfo,
    getTotalCount,
    append,
    first: 100,
  }
);
