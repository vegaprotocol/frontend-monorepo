import produce from 'immer';
import { gql } from '@apollo/client';
import type {
  Positions,
  Positions_party_positions,
} from './__generated__/Positions';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  PositionSubscribe,
  PositionSubscribe_positions,
} from './__generated__/PositionSubscribe';

const POSITIONS_FRAGMENT = gql`
  fragment PositionDetails on Position {
    realisedPNL
    openVolume
    unrealisedPNL
    averageEntryPrice
    market {
      id
      name
      data {
        markPrice
        marketTradingMode
        market {
          id
        }
      }
      decimalPlaces
      positionDecimalPlaces
      tradableInstrument {
        instrument {
          id
          name
          metadata {
            tags
          }
          code
          product {
            ... on Future {
              settlementAsset {
                id
                symbol
                name
                decimals
              }
              quoteName
            }
          }
        }
      }
    }
  }
`;

const POSITION_QUERY = gql`
  ${POSITIONS_FRAGMENT}
  query Positions($partyId: ID!) {
    party(id: $partyId) {
      id
      positions {
        ...PositionDetails
      }
    }
  }
`;

export const POSITIONS_SUB = gql`
  ${POSITIONS_FRAGMENT}
  subscription PositionSubscribe($partyId: ID!) {
    positions(partyId: $partyId) {
      ...PositionDetails
    }
  }
`;

const update = (
  data: Positions_party_positions[],
  delta: PositionSubscribe_positions
) =>
  produce(data, (draft) => {
    const index = draft.findIndex((m) => m.market.id === delta.market.id);
    if (index !== -1) {
      draft[index] = delta;
    } else {
      draft.push(delta);
    }
  });
const getData = (responseData: Positions): Positions_party_positions[] | null =>
  responseData.party ? responseData.party.positions : null;
const getDelta = (
  subscriptionData: PositionSubscribe
): PositionSubscribe_positions => subscriptionData.positions;

export const positionsDataProvider = makeDataProvider<
  Positions,
  Positions_party_positions[],
  PositionSubscribe,
  PositionSubscribe_positions
>(POSITION_QUERY, POSITIONS_SUB, update, getData, getDelta);
