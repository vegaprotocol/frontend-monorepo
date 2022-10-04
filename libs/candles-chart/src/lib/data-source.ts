import type { ApolloClient } from '@apollo/client';
import type { Candle, DataSource } from 'pennant';
import { Interval as PennantInterval } from 'pennant';

import { addDecimal } from '@vegaprotocol/react-helpers';
import { ChartDocument } from './__generated___/Chart';
import type { ChartQuery, ChartQueryVariables } from './__generated___/Chart';
import {
  CandlesDocument,
  CandlesEventsDocument,
} from './__generated___/Candles';
import type {
  CandlesQuery,
  CandlesQueryVariables,
  CandleFieldsFragment,
  CandlesEventsSubscription,
  CandlesEventsSubscriptionVariables,
} from './__generated___/Candles';
import type { Subscription } from 'zen-observable-ts';
import { Interval } from '@vegaprotocol/types';

const INTERVAL_TO_PENNANT_MAP = {
  [PennantInterval.I1M]: Interval.INTERVAL_I1M,
  [PennantInterval.I5M]: Interval.INTERVAL_I5M,
  [PennantInterval.I15M]: Interval.INTERVAL_I15M,
  [PennantInterval.I1H]: Interval.INTERVAL_I1H,
  [PennantInterval.I6H]: Interval.INTERVAL_I6H,
  [PennantInterval.I1D]: Interval.INTERVAL_I1D,
};

const defaultConfig = {
  decimalPlaces: 5,
  supportedIntervals: [
    PennantInterval.I1D,
    PennantInterval.I6H,
    PennantInterval.I1H,
    PennantInterval.I15M,
    PennantInterval.I5M,
    PennantInterval.I1M,
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
      const { data } = await this.client.query<ChartQuery, ChartQueryVariables>(
        {
          query: ChartDocument,
          variables: {
            marketId: this.marketId,
          },
          fetchPolicy: 'no-cache',
        }
      );

      if (data && data.market && data.market.data) {
        this._decimalPlaces = data.market.decimalPlaces;

        return {
          decimalPlaces: this._decimalPlaces,
          supportedIntervals: [
            PennantInterval.I1D,
            PennantInterval.I6H,
            PennantInterval.I1H,
            PennantInterval.I15M,
            PennantInterval.I5M,
            PennantInterval.I1M,
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
  async query(interval: PennantInterval, from: string) {
    try {
      const { data } = await this.client.query<
        CandlesQuery,
        CandlesQueryVariables
      >({
        query: CandlesDocument,
        variables: {
          marketId: this.marketId,
          interval: INTERVAL_TO_PENNANT_MAP[interval],
          since: from,
        },
        fetchPolicy: 'no-cache',
      });

      if (data?.market?.candlesConnection?.edges) {
        const decimalPlaces = data.market.decimalPlaces;

        const candles = data.market.candlesConnection.edges
          .map((edge) => edge?.node)
          .filter((node): node is CandleFieldsFragment => !!node)
          .map((node) => parseCandle(node, decimalPlaces));

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
    interval: PennantInterval,
    onSubscriptionData: (data: Candle) => void
  ) {
    const res = this.client.subscribe<
      CandlesEventsSubscription,
      CandlesEventsSubscriptionVariables
    >({
      query: CandlesEventsDocument,
      variables: {
        marketId: this.marketId,
        interval: INTERVAL_TO_PENNANT_MAP[interval],
      },
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
}

function parseCandle(
  candle: CandleFieldsFragment,
  decimalPlaces: number
): Candle {
  return {
    date: new Date(candle.periodStart),
    high: Number(addDecimal(candle.high, decimalPlaces)),
    low: Number(addDecimal(candle.low, decimalPlaces)),
    open: Number(addDecimal(candle.open, decimalPlaces)),
    close: Number(addDecimal(candle.close, decimalPlaces)),
    volume: Number(candle.volume),
  };
}
