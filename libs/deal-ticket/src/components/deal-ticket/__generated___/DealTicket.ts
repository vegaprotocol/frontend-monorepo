import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DealTicketMarketFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', indicativePrice: string, indicativeVolume: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, trigger: Types.AuctionTrigger, market: { __typename?: 'Market', id: string } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, name: string } } } }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } };

export type DealTicketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type DealTicketQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', indicativePrice: string, indicativeVolume: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, trigger: Types.AuctionTrigger, market: { __typename?: 'Market', id: string } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, name: string } } } }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } | null };

export const DealTicketMarketFragmentDoc = gql`
    fragment DealTicketMarket on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  data {
    market {
      id
    }
    indicativePrice
    indicativeVolume
    targetStake
    suppliedStake
    auctionStart
    auctionEnd
    trigger
  }
  tradableInstrument {
    instrument {
      id
      name
      product {
        ... on Future {
          quoteName
          settlementAsset {
            id
            symbol
            decimals
            name
          }
        }
      }
    }
  }
  depth {
    lastTrade {
      price
    }
  }
}
    `;
export const DealTicketDocument = gql`
    query DealTicket($marketId: ID!) {
  market(id: $marketId) {
    ...DealTicketMarket
  }
}
    ${DealTicketMarketFragmentDoc}`;

/**
 * __useDealTicketQuery__
 *
 * To run a query within a React component, call `useDealTicketQuery` and pass it any options that fit your needs.
 * When your component renders, `useDealTicketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDealTicketQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useDealTicketQuery(baseOptions: Apollo.QueryHookOptions<DealTicketQuery, DealTicketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DealTicketQuery, DealTicketQueryVariables>(DealTicketDocument, options);
      }
export function useDealTicketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DealTicketQuery, DealTicketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DealTicketQuery, DealTicketQueryVariables>(DealTicketDocument, options);
        }
export type DealTicketQueryHookResult = ReturnType<typeof useDealTicketQuery>;
export type DealTicketLazyQueryHookResult = ReturnType<typeof useDealTicketLazyQuery>;
export type DealTicketQueryResult = Apollo.QueryResult<DealTicketQuery, DealTicketQueryVariables>;