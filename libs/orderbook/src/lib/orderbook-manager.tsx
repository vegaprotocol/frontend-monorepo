import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import produce from 'immer';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useMemo, useRef, useState } from 'react';
import groupBy from 'lodash/groupBy';
import type { AgGridReact } from 'ag-grid-react';
import type {
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate,
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';
import type { OrderbookData } from './orderbook';

interface OrderbookManagerProps {
  marketId: string;
  resolution: number;
}

const getGroupPrice = (price:number, resolution:number) => Math.round(price * resolution) / resolution

const compact = (
  sell:
    | (
        | MarketDepth_market_depth_sell
        | MarketDepthSubscription_marketDepthUpdate_sell
      )[]
    | null,
  buy:
    | (
        | MarketDepth_market_depth_buy
        | MarketDepthSubscription_marketDepthUpdate_buy
      )[]
    | null,
  resolution: number
) => {
  let cummulativeVol = 0;
  const askOrderbookData = (sell ?? [])
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
  const bidOrderbookData = (buy ?? []).map<OrderbookData>((buy) => ({
    price: Number(buy.price),
    bidVol: Number(buy.volume),
    cummulativeVol: {
      bid: (cummulativeVol += Number(buy.volume)),
    },
  }));

  const groupedByLevel = groupBy<OrderbookData>(
    [...askOrderbookData, ...bidOrderbookData],
    (row) => getGroupPrice(row.price, resolution)
  );

  const orderBookData = Object.keys(groupedByLevel).reduce<OrderbookData[]>(
    (rows, price) =>
      rows.concat(
        groupedByLevel[price].reduce<OrderbookData>(
          (a, c) => ({
            ...a,
            bidVol: (a.bidVol ?? 0) + (c.bidVol ?? 0),
            askVol: (a.askVol ?? 0) + (c.askVol ?? 0),
            cummulativeVol: {
              bid: Math.max((a.cummulativeVol.bid ?? 0), (c.cummulativeVol.bid ?? 0)),
              ask: Math.max((a.cummulativeVol.ask ?? 0) + (c.cummulativeVol.ask ?? 0)),
            },
          }),
          { price: Number(price), cummulativeVol: {} }
        )
      ),
    []
  );
  // orderBookData.sort((a, b) => b.price - a.price);
  return orderBookData;
};

const maxVolumes = (orderbookData: OrderbookData[]) => {
  let bidVol = 0
  let askVol = 0
  let cummulativeVol = 0;
  orderbookData.forEach((data) => {
    bidVol = Math.max(bidVol, data.bidVol ?? 0);
    askVol = Math.max(askVol, data.askVol ?? 0);
  });
  cummulativeVol = Math.max(
    orderbookData[0]?.cummulativeVol.ask ?? 0,
    orderbookData[orderbookData.length - 1]?.cummulativeVol.bid ?? 0
  );
  return {
    bidVol,
    askVol,
    cummulativeVol
  }
}

const updateRelativeData = (data: OrderbookData[]) => {
  const { bidVol, askVol, cummulativeVol } = maxVolumes(data)
  data.forEach((data) => {
    data.relativeAskVol = (data.askVol ?? 0) / askVol;
    data.relativeBidVol = (data.bidVol ?? 0) / bidVol;
    data.cummulativeVol.relativeAsk =
      (data.cummulativeVol.ask ?? 0) / cummulativeVol;
    data.cummulativeVol.relativeBid =
      (data.cummulativeVol.bid ?? 0) / cummulativeVol;
  });
}



const reducer = (state: OrderbookData[] | null, action: { type: 'init', data: OrderbookData[] | null } | { type: 'update', delta: MarketDepthSubscription_marketDepthUpdate }) {
  switch (action.type) {
    case 'init':
      return action.data;
    case 'update':
      return produce(state, (draft) => {
        action.delta
      });
    default:
      throw new Error();
  }
}

export const OrderbookManager = ({
  marketId,
  resolution,
}: OrderbookManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ marketId }), [marketId]);

  const [orderbookData, setOrderbookData] = useState<OrderbookData[]|null>(null);

  // Apply updates to the table
  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!gridRef.current || !orderbookData) {
        return false;
      }
      setOrderbookData(produce(orderbookData, (draft) => {
        if (!draft) {
          return
        }
        delta.buy?.forEach(buy => {
          const price = Number(buy.price);
          const volume = Number(buy.volume);
          const groupPrice = getGroupPrice(price, resolution);
          let index = draft.findIndex(data => data.price === groupPrice)
          if (index !== -1 && draft[index]) {
            draft[index].askVol = (draft[index].askVol ?? 0) - (draft[index].askVolByLevel?.[price] || 0) + volume ;
            draft[index].askVolByLevel = Object.assign(draft[index].askVolByLevel ?? {}, { [price]: volume });
          } else {            
            const newData:OrderbookData = {
              price,
              askVol: volume,
              askVolByLevel: { [price]: volume },
              cummulativeVol: {}
            }
            index = draft.findIndex((data) => data.price > price);
            if (index !== -1) {
              draft.splice(index, 0, newData);
            } else {
              draft.push(newData);
            }
          }
        })
        delta.sell?.forEach(sell => {
          const price = Number(sell.price);
          const volume = Number(sell.volume);
          const groupPrice = getGroupPrice(price, resolution);
          let index = draft.findIndex(data => data.price === groupPrice)
          if (index !== -1 && draft[index]) {
            draft[index].bidVol = (draft[index].bidVol ?? 0) - (draft[index].bidVolByLevel?.[price] || 0) + volume ;
            draft[index].bidVolByLevel = Object.assign(draft[index].bidVolByLevel ?? {}, { [price]: volume });
          } else {            
            const newData:OrderbookData = {
              price,
              bidVol: volume,
              bidVolByLevel: { [price]: volume },
              cummulativeVol: {}
            }
            index = draft.findIndex((data) => data.price > price);
            if (index !== -1) {
              draft.splice(index, 0, newData);
            } else {
              draft.push(newData);
            }
          }
        })
        let index = 0
        while (index < draft.length) {
          if (!draft[index].askVol && !draft[index].bidVol) {
            draft.splice(index, 1);
          } else {
            index += 1;
          }
        }
        updateRelativeData(draft);
      }))
      return true;
    },
    []
  );

  const { data, error, loading } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  useCallback(() => {
    if (!data) {
      return setOrderbookData(null);
    }
    const orderbookData = compact(data.depth.sell, data.depth.buy, resolution);
    updateRelativeData(orderbookData);
    setOrderbookData(orderbookData);
  }, [data, resolution]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data ? (
        <Orderbook
          ref={gridRef}
          data={orderbookData}
          decimalPlaces={data.decimalPlaces}
        />
      ) : undefined}
    </AsyncRenderer>
  );
};
