import { useEffect, useMemo } from 'react';
import {
  type LibrarySymbolInfo,
  type IBasicDataFeed,
  type ResolutionString,
  type SeriesFormat,
} from '../charting_library/charting_library';

type Candle = {
  start: string;
  lastUpdate: string;
  high: string;
  low: string;
  open: string;
  close: string;
  volume: string;
  notional: string;
};

/* eslint-disable no-console */
const url = 'https://api.n07.testnet.vega.xyz/api/v2';
const websocketUrl = 'wss://api.n07.testnet.vega.xyz/api/v2/stream/candle/data';
let socket: WebSocket;

const configurationData = {
  // only showing Vega ofc
  exchanges: undefined,

  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ['1'] as ResolutionString[],
} as const;

const resolutionMap: Record<ResolutionString, (marketId: string) => string> = {
  // @ts-ignore something something
  '1': (marketId: string) => `trades_candle_1_minute_${marketId}`,
};

export const useDataFeed = (marketId: string) => {
  const datafeed = useMemo(() => {
    const feed: IBasicDataFeed = {
      onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
      },
      searchSymbols: () => {
        console.log('[searchSymbols]: Method call');
      },
      resolveSymbol: async (
        marketId,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
      ) => {
        console.log('[resolveSymbol]: Method call', marketId);
        try {
          const data = await request('market/' + marketId);

          const symbolInfo: LibrarySymbolInfo = {
            ticker: data.market.id,
            name: data.market.tradableInstrument.instrument.code,
            full_name: data.market.tradableInstrument.instrument.code,
            listed_exchange: 'vega',
            format: 'price' as SeriesFormat,
            description: data.market.tradableInstrument.instrument.name,
            type: 'futures',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: '',
            minmov: 1,
            pricescale: 100,
            visible_plots_set: 'ohlc',
            supported_resolutions: ['1'] as ResolutionString[],
            volume_precision: data.market.positionDecimalPlaces,
            data_status: 'pulsed',
            delay: 1000,
            has_intraday: true, // required for less than 1 day interval
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
        onErrorCallback,
      ) => {
        console.log('HERE', resolution, symbolInfo);

        if (!symbolInfo.ticker) {
          onErrorCallback('No symbol.ticker');
          return;
        }

        try {
          const candleId = resolutionMap[resolution](symbolInfo.ticker);
          console.log(candleId);
          const data = await request(`candle?candleId=${candleId}`);

          if (!data.candles.edges.length) {
            onHistoryCallback([], { noData: true });
            return;
          }

          const bars = data.candles.edges
            .map((e: { node: Candle }) => {
              return prepareBar(e.node);
            })
            .reverse();

          console.log(bars);

          onHistoryCallback(bars, { noData: false });
        } catch (err) {
          console.log('Cannot getBars', err);
          onErrorCallback(err as Error);
        }
      },

      subscribeBars: (
        symbolInfo,
        resolution,
        onTick,
        subscriberUID,
        onResetCacheNeededCallback,
      ) => {
        console.log(
          '[subscribeBars]: Method call with subscriberUID:',
          subscriberUID,
        );

        if (!symbolInfo.ticker) {
          console.error('No symbolInfo.ticker');
          return;
        }

        const candleId = resolutionMap[resolution](symbolInfo.ticker);

        socket = new WebSocket(`${websocketUrl}?candleId=${candleId}`);

        socket.onopen = (event) => {
          console.log('open', event);
        };

        socket.onmessage = (event) => {
          console.log('message', event);
          try {
            // TODO: update or append to candle set
            const data = JSON.parse(event.data);
            const bar = prepareBar(data.result.candle);
            onTick(bar);
          } catch (err) {
            console.error(err);
          }
        };

        socket.onerror = (event) => {
          console.log('error', event);
        };

        socket.onclose = (event) => {
          console.log('close', event);
        };
      },

      unsubscribeBars: (subscriberUID) => {
        console.log(
          '[unsubscribeBars]: Method call with subscriberUID:',
          subscriberUID,
        );

        if (socket) {
          socket.close();
        }
      },
    };

    return feed;
  }, []);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return datafeed;
};

const prepareBar = (candle: Candle) => {
  return {
    time: Number(candle.start.slice(0, -6)), // trim to milliseconds
    low: Number(candle.low),
    high: Number(candle.high),
    open: Number(candle.open),
    close: Number(candle.close),
    volume: Number(candle.volume),
  };
};

const request = async (path: string) => {
  try {
    const res = await fetch(`${url}/${path}`);
    const json = await res.json();
    return json;
    console.log(json);
  } catch (err) {
    console.error(err);
  }
};
