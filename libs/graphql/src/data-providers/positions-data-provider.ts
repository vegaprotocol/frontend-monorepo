import { gql } from '@apollo/client';
import {
  positions,
  positions_party_positions,
} from '../__generated__/positions';
import { makeDataProvider } from './generic-data-provider';

import {
  positionSubscribe,
  positionSubscribe_positions,
} from '../__generated__/positionSubscribe';

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
      }
      decimalPlaces
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
  query positions($partyId: ID!) {
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
  subscription positionSubscribe($partyId: ID!) {
    positions(partyId: $partyId) {
      ...PositionDetails
    }
  }
`;

export const positionsDataProvider = makeDataProvider<
  positions,
  positions_party_positions,
  positionSubscribe,
  positionSubscribe_positions
>(
  POSITION_QUERY,
  POSITIONS_SUB,
  (
    draft: positions_party_positions[] | null,
    delta: positionSubscribe_positions
  ) => {
    if (!draft) {
      return;
    }
    const index = draft.findIndex((m) => m.market.id === delta.market.id);
    if (index !== -1) {
      draft[index] = delta;
    } else {
      draft.push(delta);
    }
  },
  (responseData: positions): positions_party_positions[] | null =>
    responseData.party ? responseData.party.positions : null,
  (subscriptionData: positionSubscribe): positionSubscribe_positions =>
    subscriptionData.positions
);
