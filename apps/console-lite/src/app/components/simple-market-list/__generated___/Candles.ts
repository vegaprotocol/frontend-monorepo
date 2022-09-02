import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CandleLiveSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type CandleLiveSubscription = { __typename?: 'Subscription', candles: { __typename?: 'Candle', close: string } };


export const CandleLiveDocument = gql`
    subscription CandleLive($marketId: ID!) {
  candles(marketId: $marketId, interval: INTERVAL_I1H) {
    close
  }
}
    `;

/**
 * __useCandleLiveSubscription__
 *
 * To run a query within a React component, call `useCandleLiveSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCandleLiveSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCandleLiveSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useCandleLiveSubscription(baseOptions: Apollo.SubscriptionHookOptions<CandleLiveSubscription, CandleLiveSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<CandleLiveSubscription, CandleLiveSubscriptionVariables>(CandleLiveDocument, options);
      }
export type CandleLiveSubscriptionHookResult = ReturnType<typeof useCandleLiveSubscription>;
export type CandleLiveSubscriptionResult = Apollo.SubscriptionResult<CandleLiveSubscription>;