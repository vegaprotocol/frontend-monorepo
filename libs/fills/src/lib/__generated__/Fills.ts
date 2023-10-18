import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TradeFeeFieldsFragment = { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null };

export type FillFieldsFragment = { __typename?: 'Trade', id: string, createdAt: any, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, market: { __typename?: 'Market', id: string }, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null } };

export type FillEdgeFragment = { __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, createdAt: any, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, market: { __typename?: 'Market', id: string }, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null } } };

export type FillsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.TradesFilter>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  dateRange?: Types.InputMaybe<Types.DateRange>;
}>;


export type FillsQuery = { __typename?: 'Query', trades?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, createdAt: any, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, market: { __typename?: 'Market', id: string }, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type FillUpdateFieldsFragment = { __typename?: 'TradeUpdate', id: string, marketId: string, buyOrder: string, sellOrder: string, buyerId: string, sellerId: string, aggressor: Types.Side, price: string, size: string, createdAt: any, type: Types.TradeType, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null } };

export type FillsEventSubscriptionVariables = Types.Exact<{
  filter: Types.TradesSubscriptionFilter;
}>;


export type FillsEventSubscription = { __typename?: 'Subscription', tradesStream?: Array<{ __typename?: 'TradeUpdate', id: string, marketId: string, buyOrder: string, sellOrder: string, buyerId: string, sellerId: string, aggressor: Types.Side, price: string, size: string, createdAt: any, type: Types.TradeType, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string, makerFeeReferralDiscount?: string | null, makerFeeVolumeDiscount?: string | null, infrastructureFeeReferralDiscount?: string | null, infrastructureFeeVolumeDiscount?: string | null, liquidityFeeReferralDiscount?: string | null, liquidityFeeVolumeDiscount?: string | null } }> | null };

export const TradeFeeFieldsFragmentDoc = gql`
    fragment TradeFeeFields on TradeFee {
  makerFee
  infrastructureFee
  liquidityFee
  makerFeeReferralDiscount
  makerFeeVolumeDiscount
  infrastructureFeeReferralDiscount
  infrastructureFeeVolumeDiscount
  liquidityFeeReferralDiscount
  liquidityFeeVolumeDiscount
}
    `;
export const FillFieldsFragmentDoc = gql`
    fragment FillFields on Trade {
  id
  market {
    id
  }
  createdAt
  price
  size
  buyOrder
  sellOrder
  aggressor
  buyer {
    id
  }
  seller {
    id
  }
  buyerFee {
    ...TradeFeeFields
  }
  sellerFee {
    ...TradeFeeFields
  }
}
    ${TradeFeeFieldsFragmentDoc}`;
export const FillEdgeFragmentDoc = gql`
    fragment FillEdge on TradeEdge {
  node {
    ...FillFields
  }
  cursor
}
    ${FillFieldsFragmentDoc}`;
export const FillUpdateFieldsFragmentDoc = gql`
    fragment FillUpdateFields on TradeUpdate {
  id
  marketId
  buyOrder
  sellOrder
  buyerId
  sellerId
  aggressor
  price
  size
  createdAt
  type
  buyerFee {
    ...TradeFeeFields
  }
  sellerFee {
    ...TradeFeeFields
  }
}
    ${TradeFeeFieldsFragmentDoc}`;
export const FillsDocument = gql`
    query Fills($filter: TradesFilter, $pagination: Pagination, $dateRange: DateRange) {
  trades(filter: $filter, dateRange: $dateRange, pagination: $pagination) {
    edges {
      ...FillEdge
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${FillEdgeFragmentDoc}`;

/**
 * __useFillsQuery__
 *
 * To run a query within a React component, call `useFillsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFillsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFillsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *      dateRange: // value for 'dateRange'
 *   },
 * });
 */
export function useFillsQuery(baseOptions?: Apollo.QueryHookOptions<FillsQuery, FillsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FillsQuery, FillsQueryVariables>(FillsDocument, options);
      }
export function useFillsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FillsQuery, FillsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FillsQuery, FillsQueryVariables>(FillsDocument, options);
        }
export type FillsQueryHookResult = ReturnType<typeof useFillsQuery>;
export type FillsLazyQueryHookResult = ReturnType<typeof useFillsLazyQuery>;
export type FillsQueryResult = Apollo.QueryResult<FillsQuery, FillsQueryVariables>;
export const FillsEventDocument = gql`
    subscription FillsEvent($filter: TradesSubscriptionFilter!) {
  tradesStream(filter: $filter) {
    ...FillUpdateFields
  }
}
    ${FillUpdateFieldsFragmentDoc}`;

/**
 * __useFillsEventSubscription__
 *
 * To run a query within a React component, call `useFillsEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFillsEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFillsEventSubscription({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useFillsEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<FillsEventSubscription, FillsEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FillsEventSubscription, FillsEventSubscriptionVariables>(FillsEventDocument, options);
      }
export type FillsEventSubscriptionHookResult = ReturnType<typeof useFillsEventSubscription>;
export type FillsEventSubscriptionResult = Apollo.SubscriptionResult<FillsEventSubscription>;