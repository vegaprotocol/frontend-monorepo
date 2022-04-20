import produce from 'immer';
import groupBy from 'lodash/groupBy';
import type {
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';

export interface CumulativeVol {
  bid: number;
  relativeBid?: string;
  ask: number;
  relativeAsk?: string;
}

export interface OrderbookData {
  price: number;
  bidVol: number;
  bidVolByLevel?: Record<number, number>;
  relativeBidVol?: string;
  askVol: number;
  askVolByLevel?: Record<number, number>;
  relativeAskVol?: string;
  cumulativeVol: CumulativeVol;
}

const getGroupPrice = (price: number, resolution: number) =>
  Math.round(price / resolution) * resolution;

const maxVolumes = (orderbookData: OrderbookData[]) => {
  let bidVol = 0;
  let askVol = 0;
  let cumulativeVol = 0;
  orderbookData.forEach((data) => {
    bidVol = Math.max(bidVol, data.bidVol);
    askVol = Math.max(askVol, data.askVol);
  });
  cumulativeVol = Math.max(
    orderbookData[0]?.cumulativeVol.ask,
    orderbookData[orderbookData.length - 1]?.cumulativeVol.bid
  );
  return {
    bidVol,
    askVol,
    cumulativeVol,
  };
};

const toPercentString = (value?: number) => `${Math.ceil((value ?? 0) * 100)}%`;

const updateRelativeData = (data: OrderbookData[]) => {
  const { bidVol, askVol, cumulativeVol } = maxVolumes(data);
  data.forEach((data) => {
    data.relativeAskVol = toPercentString(data.askVol / askVol);
    data.relativeBidVol = toPercentString(data.bidVol / bidVol);
    data.cumulativeVol.relativeAsk = toPercentString(
      data.cumulativeVol.ask / cumulativeVol
    );
    data.cumulativeVol.relativeBid = toPercentString(
      data.cumulativeVol.bid / cumulativeVol
    );
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
  let cumulativeVol = 0;
  const askOrderbookData = [...(sell ?? [])]
    .sort((a, b) => Number(a.price) - Number(b.price))
    .map<OrderbookData>((sell) => ({
      price: Number(sell.price),
      askVol: Number(sell.volume),
      bidVol: 0,
      cumulativeVol: {
        ask: (cumulativeVol += Number(sell.volume)),
        bid: 0,
      },
    }))
    .reverse();
  cumulativeVol = 0;
  const bidOrderbookData = [...(buy ?? [])]
    .sort((a, b) => Number(b.price) - Number(a.price))
    .map<OrderbookData>((buy) => ({
      price: Number(buy.price),
      askVol: 0,
      bidVol: Number(buy.volume),
      cumulativeVol: {
        ask: 0,
        bid: (cumulativeVol += Number(buy.volume)),
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
            askVol: a.askVol + c.askVol,
            askVolByLevel: Object.assign(a.askVolByLevel, {
              [c.price]: c.askVol ?? 0,
            }),
            bidVol: (a.bidVol ?? 0) + (c.bidVol ?? 0),
            bidVolByLevel: Object.assign(a.bidVolByLevel, {
              [c.price]: c.bidVol ?? 0,
            }),
            cumulativeVol: {
              bid: Math.max(a.cumulativeVol.bid, c.cumulativeVol.bid),
              ask: Math.max(a.cumulativeVol.ask, c.cumulativeVol.ask),
            },
          }),
          {
            price: Number(price),
            askVol: 0,
            bidVol: 0,
            cumulativeVol: {
              ask: 0,
              bid: 0,
            },
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
  sell: MarketDepthSubscription_marketDepthUpdate_sell[] | null,
  buy: MarketDepthSubscription_marketDepthUpdate_buy[] | null,
  resolution: number
) =>
  produce(orderbookData, (draft) => {
    let sellModifiedIndex = -1;
    sell?.forEach((buy) => {
      const price = Number(buy.price);
      const volume = Number(buy.volume);
      const groupPrice = getGroupPrice(price, resolution);
      let index = draft.findIndex((data) => data.price === groupPrice);
      if (index !== -1) {
        sellModifiedIndex = Math.max(sellModifiedIndex, index);
        draft[index].askVol =
          draft[index].askVol -
          (draft[index].askVolByLevel?.[price] || 0) +
          volume;
        draft[index].askVolByLevel = Object.assign(
          draft[index].askVolByLevel ?? {},
          { [price]: volume }
        );
      } else {
        const newData: OrderbookData = {
          price: groupPrice,
          askVol: volume,
          bidVol: 0,
          askVolByLevel: { [price]: volume },
          cumulativeVol: {
            ask: volume,
            bid: 0,
          },
        };
        index = draft.findIndex((data) => data.price < groupPrice);
        if (index !== -1) {
          draft.splice(index, 0, newData);
          newData.cumulativeVol.bid = draft[index - 1]?.cumulativeVol.bid ?? 0;
          sellModifiedIndex = Math.max(sellModifiedIndex, index);
        } else {
          draft.push(newData);
          sellModifiedIndex = draft.length - 1;
        }
      }
    });
    let buyModifiedIndex = draft.length;
    buy?.forEach((sell) => {
      const price = Number(sell.price);
      const volume = Number(sell.volume);
      const groupPrice = getGroupPrice(price, resolution);
      let index = draft.findIndex((data) => data.price === groupPrice);
      if (index !== -1) {
        buyModifiedIndex = Math.min(buyModifiedIndex, index);
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
          price: groupPrice,
          askVol: 0,
          bidVol: volume,
          bidVolByLevel: { [price]: volume },
          cumulativeVol: {
            ask: 0,
            bid: volume,
          },
        };
        index = draft.findIndex((data) => data.price < groupPrice);
        if (index !== -1) {
          draft.splice(index, 0, newData);
          newData.cumulativeVol.ask = draft[index + 1]?.cumulativeVol.ask ?? 0;
          buyModifiedIndex = Math.min(buyModifiedIndex, index);
        } else {
          draft.push(newData);
          buyModifiedIndex = draft.length - 1;
        }
      }
    });
    if (sellModifiedIndex !== -1) {
      for (let i = Math.min(sellModifiedIndex, draft.length - 2); i >= 0; i--) {
        draft[i].cumulativeVol.ask =
          draft[i + 1].cumulativeVol.ask + draft[i].askVol;
      }
    }
    if (buyModifiedIndex !== draft.length) {
      for (
        let i = Math.max(buyModifiedIndex, 1), l = draft.length;
        i < l;
        i++
      ) {
        draft[i].cumulativeVol.bid =
          draft[i - 1].cumulativeVol.bid + draft[i].bidVol;
      }
    }
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
