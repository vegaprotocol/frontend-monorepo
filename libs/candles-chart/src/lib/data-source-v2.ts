import { type Duration } from 'date-fns';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { type DataSource, type PriceMonitoringBounds } from 'pennant';
import { Interval as PennantInterval } from 'pennant';
import { type QueryClient } from '@tanstack/react-query';
import { candleDataQueryOptionsV2, marketOptions } from '@vegaprotocol/rest';

const INTERVAL_TO_SEC_MAP = {
  [PennantInterval.I1M]: '60',
  [PennantInterval.I5M]: '300',
  [PennantInterval.I15M]: '900',
  [PennantInterval.I30M]: '1800',
  [PennantInterval.I1H]: '3600',
  [PennantInterval.I4H]: '14400',
  [PennantInterval.I6H]: '21600',
  [PennantInterval.I8H]: '28800',
  [PennantInterval.I12H]: '43200',
  [PennantInterval.I1D]: '86400',
  [PennantInterval.I7D]: '604800',
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

type PennantCandle = {
  date: Date;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
};

/**
 * A data access object that provides access to the Vega GraphQL API.
 */
export class VegaDataSourceV2 implements DataSource {
  client: QueryClient;
  from?: Date;
  marketId: string;
  partyId: null | string;
  interval: NodeJS.Timer | null;
  _decimalPlaces = 0;
  _positionDecimalPlaces = 0;

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
    client: QueryClient,
    marketId: string,
    partyId: null | string = null
  ) {
    this.client = client;
    this.marketId = marketId;
    this.partyId = partyId;
    this.interval = null;
  }

  /**
   * Used by the charting library to initialize itself.
   */
  async onReady() {
    try {
      const market = await this.client.fetchQuery(
        marketOptions(this.client, this.marketId)
      );

      if (market && market.data) {
        this._decimalPlaces = market.decimalPlaces;
        this._positionDecimalPlaces = market.positionDecimalPlaces;

        let priceMonitoringBounds: PriceMonitoringBounds[] | undefined;

        // if (data.market.data.priceMonitoringBounds) {
        //   priceMonitoringBounds = data.market.data.priceMonitoringBounds.map(
        //     (bounds) => ({
        //       maxValidPrice: Number(
        //         addDecimal(bounds.maxValidPrice, this._decimalPlaces)
        //       ),
        //       minValidPrice: Number(
        //         addDecimal(bounds.minValidPrice, this._decimalPlaces)
        //       ),
        //       referencePrice: Number(
        //         addDecimal(bounds.referencePrice, this._decimalPlaces)
        //       ),
        //     })
        //   );
        // }

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
      const data = await this.client.fetchQuery(
        candleDataQueryOptionsV2({
          marketId: this.marketId,
          interval: INTERVAL_TO_SEC_MAP[interval],
          fromTimestamp: this.from.getTime().toString(),
        })
      );

      if (data) {
        const candles = data
          .map((node) => ({
            date: new Date(node.closingTimestamp),
            high: node.high,
            low: node.low,
            open: node.open,
            close: node.close,
            volume: node.volume,
          }))
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
    onSubscriptionData: (data: PennantCandle) => void
  ) {
    this.interval = setInterval(async () => {
      const data = await this.client.fetchQuery(
        candleDataQueryOptionsV2({
          marketId: this.marketId,
          interval: INTERVAL_TO_SEC_MAP[interval],
          fromTimestamp: String(Date.now()),
        })
      );

      const bar = data[0];

      if (isValidBar(bar)) {
        onSubscriptionData({
          date: new Date(bar.closingTimestamp),
          low: bar.low,
          high: bar.high,
          open: bar.open,
          close: bar.close,
          volume: bar.volume,
        });
      }
    }, 5000);
  }

  /**
   * Used by the charting library to clean-up a subscription to streaming data.
   */
  unsubscribeData() {
    this.interval && clearInterval(this.interval);
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
  (agg: PennantCandle[], candle: PennantCandle, i: number) => {
    if (agg.length && i) {
      const previous = agg[agg.length - 1];
      const difference = getDifference(interval, previous.date, candle.date);
      if (difference > 1) {
        for (let j = 1; j < difference; j++) {
          const duration = getDuration(interval, j);
          const newStartDate = add(previous.date, duration);
          const newParsedCandle = {
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

const isValidBar = (bar?: {
  close: string | number;
  open: string | number;
  low: string | number;
  high: string | number;
}) => {
  if (!bar) return false;
  if (!bar.close) return false;
  if (!bar.open) return false;
  if (!bar.low) return false;
  if (!bar.high) return false;
  return true;
};
