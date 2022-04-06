import type { ApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import type { Annotation, Candle, DataSource } from 'pennant';
import { Interval } from 'pennant';

import { addDecimal } from '@vegaprotocol/react-helpers';
import type { Chart, ChartVariables } from './__generated__/Chart';
import type { Candles, CandlesVariables } from './__generated__/Candles';
import type { CandleFields } from './__generated__/CandleFields';
import type {
  CandlesSub,
  CandlesSubVariables,
} from './__generated__/CandlesSub';
import type { Subscription } from 'zen-observable-ts';

export const CANDLE_FRAGMENT = gql`
  fragment CandleFields on Candle {
    datetime
    high
    low
    open
    close
    volume
  }
`;

export const CANDLES_QUERY = gql`
  ${CANDLE_FRAGMENT}
  query Candles($marketId: ID!, $interval: Interval!, $since: String!) {
    market(id: $marketId) {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          name
          code
        }
      }
      candles(interval: $interval, since: $since) {
        ...CandleFields
      }
    }
  }
`;

export const CANDLES_SUB = gql`
  ${CANDLE_FRAGMENT}
  subscription CandlesSub($marketId: ID!, $interval: Interval!) {
    candles(marketId: $marketId, interval: $interval) {
      ...CandleFields
    }
  }
`;

const CHART_QUERY = gql`
  query Chart($marketId: ID!) {
    market(id: $marketId) {
      decimalPlaces
      data {
        priceMonitoringBounds {
          minValidPrice
          maxValidPrice
          referencePrice
        }
      }
    }
  }
`;

const defaultConfig = {
  decimalPlaces: 5,
  supportedIntervals: [
    Interval.I1D,
    Interval.I6H,
    Interval.I1H,
    Interval.I15M,
    Interval.I5M,
    Interval.I1M,
  ],
  priceMonitoringBounds: [],
};

/**
 * A data access object that provides access to the Vega GraphQL API.
 */
export class VegaDataSource implements DataSource {
  client: ApolloClient<object>;
  marketId: string;
  partyId: null | string;
  _decimalPlaces = 0;

  candlesSub: Subscription | null = null;
  marketDataSub: Subscription | null = null;
  positionsSub: Subscription | null = null;
  ordersSub: Subscription | null = null;
  orderAnnotations: Annotation[] = [];
  positionAnnotations: Annotation[] = [];

  /**
   * Indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market.
   */
  get decimalPlaces(): number {
    return this._decimalPlaces;
  }

  /**
   *
   * @param client - An ApolloClient instance.
   * @param marketId - Market identifier.
   * @param partyId - Party identifier.
   */
  constructor(
    client: ApolloClient<object>,
    marketId: string,
    partyId: null | string = null
  ) {
    this.client = client;
    this.marketId = marketId;
    this.partyId = partyId;
  }

  /**
   * Used by the charting library to initialize itself.
   */
  async onReady() {
    try {
      const { data } = await this.client.query<Chart, ChartVariables>({
        query: CHART_QUERY,
        variables: {
          marketId: this.marketId,
        },
        fetchPolicy: 'no-cache',
      });

      if (data && data.market && data.market.data) {
        this._decimalPlaces = data.market.decimalPlaces;

        return {
          decimalPlaces: this._decimalPlaces,
          supportedIntervals: [
            Interval.I1D,
            Interval.I6H,
            Interval.I1H,
            Interval.I15M,
            Interval.I5M,
            Interval.I1M,
          ],
          priceMonitoringBounds:
            data.market.data.priceMonitoringBounds?.map((bounds) => ({
              maxValidPrice: Number(
                addDecimal(bounds.maxValidPrice, this._decimalPlaces)
              ),
              minValidPrice: Number(
                addDecimal(bounds.minValidPrice, this._decimalPlaces)
              ),
              referencePrice: Number(
                addDecimal(bounds.referencePrice, this._decimalPlaces)
              ),
            })) ?? [],
        };
      } else {
        return defaultConfig;
      }
    } catch {
      return defaultConfig;
    }
  }

  /**
   * Used by the charting library to get historical data.
   */
  async query(interval: Interval, from: string) {
    try {
      const { data } = await this.client.query<Candles, CandlesVariables>({
        query: CANDLES_QUERY,
        variables: {
          marketId: this.marketId,
          interval,
          since: from,
        },
        fetchPolicy: 'no-cache',
      });

      if (data && data.market && data.market.candles) {
        const decimalPlaces = data.market.decimalPlaces;

        const candles = data.market.candles
          .filter((d): d is CandleFields => d !== null)
          .map((d) => parseCandle(d, decimalPlaces));

        return candles;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Used by the charting library to create a subscription to streaming data.
   */
  subscribeData(
    interval: Interval,
    onSubscriptionData: (data: Candle) => void
  ) {
    const res = this.client.subscribe<CandlesSub, CandlesSubVariables>({
      query: CANDLES_SUB,
      variables: { marketId: this.marketId, interval },
    });

    this.candlesSub = res.subscribe(({ data }) => {
      if (data) {
        const candle = parseCandle(data.candles, this.decimalPlaces);

        onSubscriptionData(candle);
      }
    });
  }

  /**
   * Used by the charting library to clean-up a subscription to streaming data.
   */
  unsubscribeData() {
    this.candlesSub && this.candlesSub.unsubscribe();
  }

  /**
   * Used by the charting library to create a subscription to streaming annotation data.
   */
  subscribeAnnotations(
    onSubscriptionAnnotation: (annotations: Annotation[]) => void
  ) {
    console.log('subscribeAnnotations');
  }

  /**
   * Used by the charting library to clean-up a subscription to streaming annotation data.
   */
  unsubscribeAnnotations() {
    this.ordersSub && this.ordersSub.unsubscribe();
    this.positionsSub && this.positionsSub.unsubscribe();
  }
}

function parseCandle(candle: CandleFields, decimalPlaces: number): Candle {
  return {
    date: new Date(candle.datetime),
    high: Number(addDecimal(candle.high, decimalPlaces)),
    low: Number(addDecimal(candle.low, decimalPlaces)),
    open: Number(addDecimal(candle.open, decimalPlaces)),
    close: Number(addDecimal(candle.close, decimalPlaces)),
    volume: Number(candle.volume),
  };
}
