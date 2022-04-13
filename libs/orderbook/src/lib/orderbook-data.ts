import produce from 'immer';
import groupBy from 'lodash/groupBy';
import type {
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate,
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';

export interface CummulativeVol {
  bid?: number;
  relativeBid?: number;
  ask?: number;
  relativeAsk?: number;
}

export interface OrderbookData {
  price: number;
  bidVol?: number;
  bidVolByLevel?: Record<number, number>;
  relativeBidVol?: number;
  askVol?: number;
  askVolByLevel?: Record<number, number>;
  relativeAskVol?: number;
  cummulativeVol: CummulativeVol;
}

export const getGroupPrice = (price: number, resolution: number) =>
  Math.round(price / resolution) * resolution;

export const maxVolumes = (orderbookData: OrderbookData[]) => {
  let bidVol = 0;
  let askVol = 0;
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
    cummulativeVol,
  };
};

export const updateRelativeData = (data: OrderbookData[]) => {
  const { bidVol, askVol, cummulativeVol } = maxVolumes(data);
  data.forEach((data) => {
    data.relativeAskVol = (data.askVol ?? 0) / askVol;
    data.relativeBidVol = (data.bidVol ?? 0) / bidVol;
    data.cummulativeVol.relativeAsk =
      (data.cummulativeVol.ask ?? 0) / cummulativeVol;
    data.cummulativeVol.relativeBid =
      (data.cummulativeVol.bid ?? 0) / cummulativeVol;
  });
};

export const compact = (
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
    .sort((a, b) => Number(a.price) - Number(b.price))
    .map<OrderbookData>((sell) => ({
      price: Number(sell.price),
      askVol: Number(sell.volume),
      cummulativeVol: {
        ask: (cummulativeVol += Number(sell.volume)),
      },
    }))
    .reverse();
  cummulativeVol = 0;
  const bidOrderbookData = (buy ?? [])
    .sort((a, b) => Number(b.price) - Number(a.price))
    .map<OrderbookData>((buy) => ({
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

  const orderbookData = Object.keys(groupedByLevel).reduce<OrderbookData[]>(
    (rows, price) =>
      rows.concat(
        groupedByLevel[price].reduce<OrderbookData>(
          (a, c) => ({
            ...a,
            askVol: (a.askVol ?? 0) + (c.askVol ?? 0),
            askVolByLevel: Object.assign(a.askVolByLevel, {
              [c.price]: c.askVol ?? 0,
            }),
            bidVol: (a.bidVol ?? 0) + (c.bidVol ?? 0),
            bidVolByLevel: Object.assign(a.bidVolByLevel, {
              [c.price]: c.bidVol ?? 0,
            }),
            cummulativeVol: {
              bid: Math.max(
                a.cummulativeVol.bid ?? 0,
                c.cummulativeVol.bid ?? 0
              ),
              ask: Math.max(
                a.cummulativeVol.ask ?? 0,
                c.cummulativeVol.ask ?? 0
              ),
            },
          }),
          {
            price: Number(price),
            cummulativeVol: {},
            askVolByLevel: {},
            bidVolByLevel: {},
          }
        )
      ),
    []
  );
  orderbookData.sort((a, b) => b.price - a.price);
  updateRelativeData(orderbookData);
  return orderbookData;
};

export const updateCompactedData = (
  orderbookData: OrderbookData[],
  delta: MarketDepthSubscription_marketDepthUpdate,
  resolution: number
) =>
  produce(orderbookData, (draft) => {
    delta.buy?.forEach((buy) => {
      const price = Number(buy.price);
      const volume = Number(buy.volume);
      const groupPrice = getGroupPrice(price, resolution);
      let index = draft.findIndex((data) => data.price === groupPrice);
      if (index !== -1 && draft[index]) {
        draft[index].askVol =
          (draft[index].askVol ?? 0) -
          (draft[index].askVolByLevel?.[price] || 0) +
          volume;
        draft[index].askVolByLevel = Object.assign(
          draft[index].askVolByLevel ?? {},
          { [price]: volume }
        );
      } else {
        const newData: OrderbookData = {
          price,
          askVol: volume,
          askVolByLevel: { [price]: volume },
          cummulativeVol: {},
        };
        index = draft.findIndex((data) => data.price > price);
        if (index !== -1) {
          draft.splice(index, 0, newData);
        } else {
          draft.push(newData);
        }
      }
    });
    delta.sell?.forEach((sell) => {
      const price = Number(sell.price);
      const volume = Number(sell.volume);
      const groupPrice = getGroupPrice(price, resolution);
      let index = draft.findIndex((data) => data.price === groupPrice);
      if (index !== -1 && draft[index]) {
        draft[index].bidVol =
          (draft[index].bidVol ?? 0) -
          (draft[index].bidVolByLevel?.[price] || 0) +
          volume;
        draft[index].bidVolByLevel = Object.assign(
          draft[index].bidVolByLevel ?? {},
          { [price]: volume }
        );
      } else {
        const newData: OrderbookData = {
          price,
          bidVol: volume,
          bidVolByLevel: { [price]: volume },
          cummulativeVol: {},
        };
        index = draft.findIndex((data) => data.price > price);
        if (index !== -1) {
          draft.splice(index, 0, newData);
        } else {
          draft.push(newData);
        }
      }
    });
    let index = 0;
    while (index < draft.length) {
      if (!draft[index].askVol && !draft[index].bidVol) {
        draft.splice(index, 1);
      } else {
        index += 1;
      }
    }
    updateRelativeData(draft);
  });

export const updateLevels = (
  levels:
    | (MarketDepth_market_depth_buy | MarketDepth_market_depth_sell)[]
    | null,
  updates: (
    | MarketDepthSubscription_marketDepthUpdate_buy
    | MarketDepthSubscription_marketDepthUpdate_sell
  )[]
) => {
  updates.forEach((update) => {
    if (levels) {
      let index = levels.findIndex((level) => level.price === update.price);
      if (index !== -1) {
        if (update.volume === '0') {
          levels.splice(index, 1);
        } else {
          Object.assign(levels[index], update);
        }
      } else if (update.volume !== '0') {
        index = levels.findIndex(
          (level) => Number(level.price) > Number(update.price)
        );
        if (index !== -1) {
          levels.splice(index, 0, update);
        } else {
          levels.push(update);
        }
      }
    } else if (update.volume !== '0') {
      levels = [update];
    }
  });
  return levels;
};
