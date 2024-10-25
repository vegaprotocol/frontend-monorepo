import { useEffect, useMemo, useRef } from 'react';
import { Interval } from '@vegaprotocol/types';
import { getMarketExpiryDate } from '@vegaprotocol/utils';
import {
  type IBasicDataFeed,
  type DatafeedConfiguration,
  type LibrarySymbolInfo,
  type ResolutionString,
} from '../charting-library';
import { useQueryClient } from '@tanstack/react-query';
import { candleDataQueryOptionsV2, marketOptions } from '@vegaprotocol/rest';

const EXCHANGE = 'Nebula';

const resolutionMap: Record<string, Interval> = {
  '1': Interval.INTERVAL_I1M,
  '5': Interval.INTERVAL_I5M,
  '15': Interval.INTERVAL_I15M,
  '30': Interval.INTERVAL_I30M,
  '60': Interval.INTERVAL_I1H,
  '240': Interval.INTERVAL_I4H,
  '360': Interval.INTERVAL_I6H,
  '480': Interval.INTERVAL_I8H,
  '720': Interval.INTERVAL_I12H,
  '1D': Interval.INTERVAL_I1D,
  '1W': Interval.INTERVAL_I7D,
} as const;

const resolutionSecMap: Record<string, string> = {
  '1': '60',
  '5': '300',
  '15': '900',
  '30': '1800',
  '60': '3600',
  '240': '14400',
  '360': '21600',
  '480': '28800',
  '720': '43200',
  '1D': '86400',
  '1W': '604800',
} as const;

const supportedResolutions = Object.keys(resolutionMap);

const configurationData: DatafeedConfiguration = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: supportedResolutions as ResolutionString[],
} as const;

// HACK: local handle for market id
let requestedSymbol: string | undefined = undefined;

export const useDatafeedV2 = (marketId: string) => {
  const intervalRef = useRef<NodeJS.Timer>();
  const hasHistory = useRef(false);
  const client = useQueryClient();

  const datafeed = useMemo(() => {
    const feed: IBasicDataFeed & { setSymbol: (symbol: string) => void } = {
      setSymbol: (symbol: string) => {
        // re-setting the symbol so it could be consumed by `resolveSymbol`
        requestedSymbol = symbol;
      },
      onReady: (callback) => {
        requestedSymbol = marketId;
        setTimeout(() => callback(configurationData));
      },

      searchSymbols: () => {
        /* no op, we handle finding markets in app */
      },

      resolveSymbol: async (
        marketId,
        onSymbolResolvedCallback,
        onResolveErrorCallback
      ) => {
        try {
          const market = await client.fetchQuery(
            marketOptions(client, requestedSymbol || marketId)
          );

          if (!market) {
            onResolveErrorCallback('Cannot resolve symbol: market not found');
            return;
          }

          let type = 'undefined'; // https://www.tradingview.com/charting-library-docs/latest/api/modules/Charting_Library#symboltype
          if (market.type === 'future' || market.type === 'perp') {
            type = 'futures';
          } else if (market.type === 'spot') {
            type = 'spot';
          }

          const expirationDate = getMarketExpiryDate(market.metatags);
          const expirationTimestamp = expirationDate
            ? Math.floor(expirationDate.getTime() / 1000)
            : undefined;

          const expired = expirationDate
            ? Date.now() > expirationDate.getTime()
            : market.data.state !== 'STATE_ACTIVE' &&
              market.data.state !== 'STATE_SUSPENDED';

          const symbolInfo: LibrarySymbolInfo = {
            ticker: market.id, // use ticker as our unique identifier so that code/name can be used for name/description
            name: market.code,
            full_name: `${EXCHANGE}:${market.code}`,
            description: market.name,
            listed_exchange: EXCHANGE,
            expired,
            expiration_date: expirationTimestamp,
            format: 'price',
            type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: EXCHANGE,
            minmov: 1,
            pricescale: Number('1' + '0'.repeat(market.decimalPlaces)), // for number of decimal places
            visible_plots_set: 'ohlc',
            volume_precision: market.positionDecimalPlaces,
            data_status: 'streaming',
            delay: 1000, // around 1 block time
            has_intraday: true, // required for less than 1 day interval
            has_empty_bars: true, // library will generate bars if there are gaps, useful for auctions
            has_ticks: false, // switch to true when enabling block intervals
          };

          onSymbolResolvedCallback(symbolInfo);
        } catch (err) {
          onResolveErrorCallback('Cannot resolve symbol');
        }
      },

      getBars: async (
        symbolInfo,
        resolution,
        periodParams,
        onHistoryCallback,
        onErrorCallback
      ) => {
        if (!symbolInfo.ticker) {
          onErrorCallback('No symbol.ticker');
          return;
        }

        try {
          const data = await client.fetchQuery(
            candleDataQueryOptionsV2({
              marketId: symbolInfo.ticker,
              interval: resolutionSecMap[resolution],
              fromTimestamp: String(
                unixTimestampToDate(periodParams.from).getTime()
              ),
              toTimestamp: String(
                unixTimestampToDate(periodParams.to).getTime()
              ),
            })
          );

          if (!data.length) {
            onHistoryCallback([], { noData: true });
            return;
          }

          const bars = data
            .filter((d) => isValidBar(d))
            .map((d) => ({
              time: d.openingTimestamp,
              low: d.low,
              high: d.high,
              open: d.open,
              close: d.close,
              volume: d.volume,
            }))
            .reverse();

          hasHistory.current = true;

          onHistoryCallback(bars, { noData: false });
        } catch (err) {
          onErrorCallback(
            err instanceof Error ? err.message : 'Failed to get bars'
          );
        }
      },

      subscribeBars: (
        symbolInfo,
        resolution,
        onTick
        // subscriberUID,  // chart will subscribe and unsbuscribe when the parent market of the page changes so we don't need to use subscriberUID as of now
      ) => {
        // Dont start the subscription if there is no candle history. This protects against a
        // problem where drawing on the chart throws an error if there is no prior history, instead
        // no you'll just get the no data message
        if (!hasHistory.current) {
          return;
        }

        intervalRef.current = setInterval(async () => {
          if (!symbolInfo.ticker) {
            throw new Error('No symbolInfo.ticker');
          }

          const data = await client.fetchQuery(
            candleDataQueryOptionsV2({
              marketId: symbolInfo.ticker,
              interval: resolutionSecMap[resolution],
              fromTimestamp: String(Date.now()),
            })
          );

          const bar = data[0];

          if (isValidBar(bar)) {
            onTick({
              time: bar.openingTimestamp,
              low: bar.low,
              high: bar.high,
              open: bar.open,
              close: bar.close,
              volume: bar.volume,
            });
          }
        }, 5000);
      },

      /**
       * We only have one active subscription no need to use the uid provided by unsubscribeBars
       */
      unsubscribeBars: () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      },
    };
    return feed;
  }, [client, marketId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return datafeed;
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

const unixTimestampToDate = (timestamp: number) => {
  return new Date(timestamp * 1000);
};
