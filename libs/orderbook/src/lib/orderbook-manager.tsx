import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useMemo, useRef } from 'react';
import groupBy from 'lodash/groupBy';
import type { AgGridReact } from 'ag-grid-react';
import type { MarketDepth_market } from './__generated__/MarketDepth';
import type { MarketDepthSubscription_marketDepthUpdate } from './__generated__/MarketDepthSubscription';
import type { OrderbookData } from './orderbook';

interface OrderbookManagerProps {
  marketId: string;
  resolution: number;
}

const compact = (data: MarketDepth_market, resolution: number) => {
  let cummulativeVol = 0;
  const askOrderbookData = (data.depth?.sell ?? [])
    .reverse()
    .map<OrderbookData>((sell) => ({
      price: Number(sell.price),
      askVol: Number(sell.volume),
      cummulativeVol: {
        ask: (cummulativeVol += Number(sell.volume)),
      },
    }))
    .reverse();
  cummulativeVol = 0;
  const bidOrderbookData = (data.depth.buy ?? []).map<OrderbookData>((buy) => ({
    price: Number(buy.price),
    bidVol: Number(buy.volume),
    cummulativeVol: {
      bid: (cummulativeVol += Number(buy.volume)),
    },
  }));

  const groupedByLevel = groupBy<OrderbookData>(
    [...askOrderbookData, ...bidOrderbookData],
    (row) => Math.round(row.price * resolution) / resolution
  );

  const orderBookData = Object.values(groupedByLevel).reduce(
    (a, c) =>
      a.concat(
        c.slice(1).reduce(
          (a, c) => ({
            price: a.price,
            bidVol: (a.bidVol ?? 0) + (c.bidVol ?? 0),
            cummulativeVol: {
            askVol: (a.askVol ?? 0) + (c.askVol ?? 0),
              bid: (a.cummulativeVol.bid ?? 0) + (c.cummulativeVol.bid ?? 0),
              ask: (a.cummulativeVol.ask ?? 0) + (c.cummulativeVol.ask ?? 0),
            },
          }),
          c[0]
        )
      ),
    []
  );
  orderBookData.sort((a, b) => b.price - a.price);
  return orderBookData;
};

export const OrderbookManager = ({
  marketId,
  resolution,
}: OrderbookManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const maxBidVol = useRef<number>(0);
  const maxAskVol = useRef<number>(0);
  const maxCummulativeVol = useRef<number>(0);
  const variables = useMemo(() => ({ marketId }), [marketId]);

  // Apply updates to the table
  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      // compact
      // get maxBidVol, maxAskVol and maxCummulativeVol
      // if maxCummulativeVol has changed update all rows
      // else 
      //   if maxAskVol changed
      //     update whole ask side
      //   if maxBidVol changed
      //     update whole bid side
      //   if not(maxAskVol changed || maxBidVol changed)
      //    update ask side starting from lowest level back to update cummulative Vol
      //    update bid side starting from highest level forward to update cummulative Vol
      return true
    },
    []
  );

  const { data, error, loading } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  const rows = useMemo(() => {
    if (!data) {
      return null;
    }
    const orderbookData = compact(data, resolution);
    // data.data?.midPrice
    orderbookData.forEach((data) => {
      maxBidVol.current = Math.max(maxBidVol.current, data.bidVol ?? 0);
      maxAskVol.current = Math.max(maxAskVol.current, data.askVol ?? 0);
    });
    maxCummulativeVol.current = Math.max(
      orderbookData[0]?.cummulativeVol.ask ?? 0,
      orderbookData[orderbookData.length - 1]?.cummulativeVol.bid ?? 0
    );
    orderbookData.forEach((data) => {
      data.relativeAskVol = (data.askVol ?? 0) / maxAskVol.current;
      data.relativeBidVol = (data.bidVol ?? 0) / maxBidVol.current;
      data.cummulativeVol.relativeAsk = (data.cummulativeVol.ask ?? 0) / maxCummulativeVol.current;
      data.cummulativeVol.relativeBid = (data.cummulativeVol.bid ?? 0) / maxCummulativeVol.current;
    })
    return orderbookData;
  }, [data, resolution]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data ? (
        <Orderbook
          ref={gridRef}
          data={rows}
          decimalPlaces={data.decimalPlaces}
        />
      ) : undefined}
    </AsyncRenderer>
  );
};
