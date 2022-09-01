import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PositionFieldsFragment = { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: string | null, marginsConnection: { __typename?: 'MarginConnection', edges?: Array<{ __typename?: 'MarginEdge', node: { __typename?: 'MarginLevels', maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, market: { __typename?: 'Market', id: string }, asset: { __typename?: 'Asset', symbol: string } } }> | null }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } }, data?: { __typename?: 'MarketData', markPrice: string, market: { __typename?: 'Market', id: string } } | null } };

export type PositionsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PositionsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, positionsConnection: { __typename?: 'PositionConnection', edges?: Array<{ __typename?: 'PositionEdge', node: { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: string | null, marginsConnection: { __typename?: 'MarginConnection', edges?: Array<{ __typename?: 'MarginEdge', node: { __typename?: 'MarginLevels', maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, market: { __typename?: 'Market', id: string }, asset: { __typename?: 'Asset', symbol: string } } }> | null }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } }, data?: { __typename?: 'MarketData', markPrice: string, market: { __typename?: 'Market', id: string } } | null } } }> | null } } | null };

export type PositionsSubscriptionSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PositionsSubscriptionSubscription = { __typename?: 'Subscription', positions: { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: string | null, marginsConnection: { __typename?: 'MarginConnection', edges?: Array<{ __typename?: 'MarginEdge', node: { __typename?: 'MarginLevels', maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, market: { __typename?: 'Market', id: string }, asset: { __typename?: 'Asset', symbol: string } } }> | null }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } }, data?: { __typename?: 'MarketData', markPrice: string, market: { __typename?: 'Market', id: string } } | null } } };

export const PositionFieldsFragmentDoc = gql`
    fragment PositionFields on Position {
  realisedPNL
  openVolume
  unrealisedPNL
  averageEntryPrice
  updatedAt
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
          symbol
        }
      }
    }
  }
  market {
    id
    name
    decimalPlaces
    positionDecimalPlaces
    tradingMode
    tradableInstrument {
      instrument {
        name
      }
    }
    data {
      markPrice
      market {
        id
      }
    }
  }
}
    `;
export const PositionsDocument = gql`
    query Positions($partyId: ID!) {
  party(id: $partyId) {
    id
    positionsConnection {
      edges {
        node {
          ...PositionFields
        }
      }
    }
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __usePositionsQuery__
 *
 * To run a query within a React component, call `usePositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePositionsQuery(baseOptions: Apollo.QueryHookOptions<PositionsQuery, PositionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PositionsQuery, PositionsQueryVariables>(PositionsDocument, options);
      }
export function usePositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PositionsQuery, PositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PositionsQuery, PositionsQueryVariables>(PositionsDocument, options);
        }
export type PositionsQueryHookResult = ReturnType<typeof usePositionsQuery>;
export type PositionsLazyQueryHookResult = ReturnType<typeof usePositionsLazyQuery>;
export type PositionsQueryResult = Apollo.QueryResult<PositionsQuery, PositionsQueryVariables>;
export const PositionsSubscriptionDocument = gql`
    subscription PositionsSubscription($partyId: ID!) {
  positions(partyId: $partyId) {
    ...PositionFields
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __usePositionsSubscriptionSubscription__
 *
 * To run a query within a React component, call `usePositionsSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePositionsSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsSubscriptionSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePositionsSubscriptionSubscription(baseOptions: Apollo.SubscriptionHookOptions<PositionsSubscriptionSubscription, PositionsSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PositionsSubscriptionSubscription, PositionsSubscriptionSubscriptionVariables>(PositionsSubscriptionDocument, options);
      }
export type PositionsSubscriptionSubscriptionHookResult = ReturnType<typeof usePositionsSubscriptionSubscription>;
export type PositionsSubscriptionSubscriptionResult = Apollo.SubscriptionResult<PositionsSubscriptionSubscription>;