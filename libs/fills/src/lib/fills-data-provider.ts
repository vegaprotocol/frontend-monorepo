import produce from 'immer';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo, Pagination } from '@vegaprotocol/react-helpers';
import type { FillFields } from './__generated__/FillFields';
import type {
  Fills,
  Fills_party_tradesPaged_edges,
} from './__generated__/Fills';
import { generateFill } from './test-helpers';
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

const totalCount = 45000;

const getData = (
  responseData: Fills,
  pagination: Pagination
): Fills_party_tradesPaged_edges[] | null => {
  const after = Number(pagination?.after || '0');
  const skip = pagination?.skip ?? 0;
  const numOfRows = Math.min(pagination.first || 0, totalCount - after);
  return new Array(numOfRows).fill(null).map((v, i) => ({
    __typename: 'TradeEdge',
    node: generateFill({ id: (after + i + skip + 1).toString() }),
    cursor: (after + i + skip + 1).toString(),
  }));
};

const getPageInfo = (
  responseData: Fills,
  pagination: Pagination
): PageInfo | null => {
  const endCursor = Math.min(
    (Number(pagination.after) || 0) + (pagination.first || 0),
    totalCount
  );
  return {
    endCursor: endCursor.toString(),
    hasNextPage: endCursor < totalCount,
  };
};

const getTotalCount = (
  responseData: Fills,
  pagination: Pagination
): number | undefined => totalCount;

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
