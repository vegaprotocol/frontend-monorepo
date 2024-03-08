import { type ApolloClient } from '@apollo/client';
import { type Duration } from 'date-fns';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import {
  type Candle,
  type DataSource,
  type PriceMonitoringBounds,
} from 'pennant';
import { Interval as PennantInterval } from 'pennant';
import { addDecimal } from '@vegaprotocol/utils';
import {
  ChartDocument,
  type ChartQuery,
  type ChartQueryVariables,
} from './__generated__/Chart';
import {
  CandlesDocument,
  CandlesEventsDocument,
  type CandlesQuery,
  type CandlesQueryVariables,
  type CandlesEventsSubscription,
  type CandlesEventsSubscriptionVariables,
  type CandleFieldsFragment,
} from './__generated__/Candles';
import { type Subscription } from 'zen-observable-ts';
import * as Schema from '@vegaprotocol/types';

const INTERVAL_TO_PENNANT_MAP = {
  [PennantInterval.I1M]: Schema.Interval.INTERVAL_I1M,
  [PennantInterval.I5M]: Schema.Interval.INTERVAL_I5M,
  [PennantInterval.I15M]: Schema.Interval.INTERVAL_I15M,
  [PennantInterval.I30M]: Schema.Interval.INTERVAL_I30M,
  [PennantInterval.I1H]: Schema.Interval.INTERVAL_I1H,
  [PennantInterval.I4H]: Schema.Interval.INTERVAL_I4H,
  [PennantInterval.I6H]: Schema.Interval.INTERVAL_I6H,
  [PennantInterval.I8H]: Schema.Interval.INTERVAL_I8H,
  [PennantInterval.I12H]: Schema.Interval.INTERVAL_I12H,
  [PennantInterval.I1D]: Schema.Interval.INTERVAL_I1D,
  [PennantInterval.I7D]: Schema.Interval.INTERVAL_I7D,
};

const defaultConfig = {
  decimalPlaces: 5,
  supportedIntervals: [
    PennantInterval.I7D,
    PennantInterval.I1D,
    PennantInterval.I12H,
    PennantInterval.I8H,
    PennantInterval.I6H,
    PennantInterval.I4H,
    PennantInterval.I1H,
    PennantInterval.I15M,
    PennantInterval.I30M,
    PennantInterval.I5M,
    PennantInterval.I1M,
  ],
};

/**
 * A data access object that provides access to the Vega GraphQL API.
 */
export class VegaDataSource implements DataSource {
  client: ApolloClient<object>;
  from?: Date;
  marketId: string;
  partyId: null | string;
  _decimalPlaces = 0;
  _positionDecimalPlaces = 0;

  candlesSub: Subscription | null = null;

  /**
   * Indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market.
   */
  get decimalPlaces(): number {
    return this._decimalPlaces;
  }

  /**
   * Indicates the number of position decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the unit size of the Market.
   */
  get positionDecimalPlaces(): number {
    return this._positionDecimalPlaces;
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
        this._positionDecimalPlaces = data.market.positionDecimalPlaces;

        let priceMonitoringBounds: PriceMonitoringBounds[] | undefined;

        if (data.market.data.priceMonitoringBounds) {
          priceMonitoringBounds = data.market.data.priceMonitoringBounds.map(
            (bounds) => ({
              maxValidPrice: Number(
                addDecimal(bounds.maxValidPrice, this._decimalPlaces)
              ),
              minValidPrice: Number(
                addDecimal(bounds.minValidPrice, this._decimalPlaces)
              ),
              referencePrice: Number(
                addDecimal(bounds.referencePrice, this._decimalPlaces)
              ),
            })
          );
        }

        return {
          decimalPlaces: this._decimalPlaces,
          positionDecimalPlaces: this._positionDecimalPlaces,
          supportedIntervals: [
            PennantInterval.I7D,
            PennantInterval.I1D,
            PennantInterval.I12H,
            PennantInterval.I8H,
            PennantInterval.I6H,
            PennantInterval.I4H,
            PennantInterval.I1H,
            PennantInterval.I15M,
            PennantInterval.I30M,
            PennantInterval.I5M,
            PennantInterval.I1M,
          ],
          priceMonitoringBounds: priceMonitoringBounds,
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
      this.from = new Date(from);
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
        const positionDecimalPlaces = data.market.positionDecimalPlaces;

        const openSince =
          typeof data.market.marketTimestamps.open === 'string' &&
          data.market.marketTimestamps.open.length > 0
            ? new Date(data.market.marketTimestamps.open)
            : // this should never happen, but just in case let's have it as
              // Date(0) if the market data is incomplete for some reason
              new Date(0);

        if (this.from < openSince) {
          // overwrite `from` if requested value is before the market's open date
          this.from = openSince;
        }

        const candles = data.market.candlesConnection.edges
          .map((edge) => edge?.node)
          .filter((node): node is CandleFieldsFragment => !!node)
          .filter(
            (node) => sinceMarketOpen(node, openSince) && !emptyCandle(node)
          )
          .map((node) =>
            parseCandle(node, decimalPlaces, positionDecimalPlaces)
          )
          .reduce(checkGranulationContinuity(interval), []);
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
        const candle = parseCandle(
          data.candles,
          this.decimalPlaces,
          this.positionDecimalPlaces
        );
        if (!this.from || candle.date < this.from) {
          return;
        }
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

const getDuration = (
  interval: PennantInterval,
  multiplier: number
): Duration => {
  switch (interval) {
    case 'I7D':
      return {
        days: 7 * multiplier,
      };
    case 'I1D':
      return {
        days: 1 * multiplier,
      };
    case 'I1H':
      return {
        hours: 1 * multiplier,
      };
    case 'I1M':
      return {
        minutes: 1 * multiplier,
      };
    case 'I5M':
      return {
        minutes: 5 * multiplier,
      };
    case 'I4H':
      return {
        hours: 4 * multiplier,
      };
    case 'I6H':
      return {
        hours: 6 * multiplier,
      };
    case 'I8H':
      return {
        hours: 8 * multiplier,
      };
    case 'I12H':
      return {
        hours: 12 * multiplier,
      };
    case 'I15M':
      return {
        minutes: 15 * multiplier,
      };
    case 'I30M':
      return {
        minutes: 30 * multiplier,
      };
  }
};

const getDifference = (
  interval: PennantInterval,
  dateLeft: Date,
  dateRight: Date
): number => {
  switch (interval) {
    case 'I7D':
      return differenceInDays(dateRight, dateLeft) / 7;
    case 'I1D':
      return differenceInDays(dateRight, dateLeft);
    case 'I12H':
      return differenceInHours(dateRight, dateLeft) / 12;
    case 'I8H':
      return differenceInHours(dateRight, dateLeft) / 8;
    case 'I6H':
      return differenceInHours(dateRight, dateLeft) / 6;
    case 'I4H':
      return differenceInHours(dateRight, dateLeft) / 4;
    case 'I1H':
      return differenceInHours(dateRight, dateLeft);
    case 'I15M':
      return differenceInMinutes(dateRight, dateLeft) / 15;
    case 'I30M':
      return differenceInMinutes(dateRight, dateLeft) / 30;
    case 'I5M':
      return differenceInMinutes(dateRight, dateLeft) / 5;
    case 'I1M':
      return differenceInMinutes(dateRight, dateLeft);
  }
};

const checkGranulationContinuity =
  (interval: PennantInterval) =>
  (agg: Candle[], candle: Candle, i: number): Candle[] => {
    if (agg.length && i) {
      const previous = agg[agg.length - 1];
      const difference = getDifference(interval, previous.date, candle.date);
      if (difference > 1) {
        for (let j = 1; j < difference; j++) {
          const duration = getDuration(interval, j);
          const newStartDate = add(previous.date, duration);
          const newParsedCandle: Candle = {
            date: newStartDate,
            high: previous.close,
            low: previous.close,
            open: previous.close,
            close: previous.close,
            volume: 0,
          };
          agg.push(newParsedCandle);
        }
      }
    }
    agg.push(candle);
    return agg;
  };

function parseCandle(
  candle: CandleFieldsFragment,
  decimalPlaces: number,
  positionDecimalPlaces: number
): Candle {
  return {
    date: new Date(candle.periodStart),
    high: Number(addDecimal(candle.high, decimalPlaces)),
    low: Number(addDecimal(candle.low, decimalPlaces)),
    open: Number(addDecimal(candle.open, decimalPlaces)),
    close: Number(addDecimal(candle.close, decimalPlaces)),
    volume: Number(addDecimal(candle.volume, positionDecimalPlaces)),
  };
}

const sinceMarketOpen = (candle: CandleFieldsFragment, openSince: Date) =>
  new Date(candle.periodStart) >= openSince;

const emptyCandle = (candle: CandleFieldsFragment) =>
  candle.high === '' && candle.low === '';
