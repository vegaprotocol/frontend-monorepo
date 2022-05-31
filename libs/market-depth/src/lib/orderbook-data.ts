import produce from 'immer';
import groupBy from 'lodash/groupBy';
import { VolumeType } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import type {
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
  MarketDepth_market_data,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
  MarketDepthSubscription_marketDepthUpdate_market_data,
} from './__generated__/MarketDepthSubscription';

export interface CumulativeVol {
  bid: number;
  relativeBid?: number;
  ask: number;
  relativeAsk?: number;
}

export interface OrderbookRowData {
  price: string;
  bid: number;
  bidByLevel: Record<string, number>;
  relativeBid?: number;
  ask: number;
  askByLevel: Record<string, number>;
  relativeAsk?: number;
  cumulativeVol: CumulativeVol;
}

export type OrderbookData = Partial<
  Omit<MarketDepth_market_data, '__typename' | 'market'>
> & { rows: OrderbookRowData[] | null };

export const getPriceLevel = (price: string | bigint, resolution: number) => {
  const p = BigInt(price);
  const r = BigInt(resolution);
  let priceLevel = (p / r) * r;
  if (p - priceLevel >= resolution / 2) {
    priceLevel += BigInt(resolution);
  }
  return priceLevel.toString();
};

const getMaxVolumes = (orderbookData: OrderbookRowData[]) => ({
  bid: Math.max(...orderbookData.map((data) => data.bid)),
  ask: Math.max(...orderbookData.map((data) => data.ask)),
  cumulativeVol: Math.max(
    orderbookData[0]?.cumulativeVol.ask,
    orderbookData[orderbookData.length - 1]?.cumulativeVol.bid
  ),
});

// round instead of ceil so we will not show 0 if value if different than 0
const toPercentValue = (value?: number) => Math.ceil((value ?? 0) * 100);

/**
 * @summary Updates relativeAsk, relativeBid, cumulativeVol.relativeAsk, cumulativeVol.relativeBid
 */
const updateRelativeData = (data: OrderbookRowData[]) => {
  const { bid, ask, cumulativeVol } = getMaxVolumes(data);
  const maxBidAsk = Math.max(bid, ask);
  data.forEach((data) => {
    data.relativeAsk = toPercentValue(data.ask / maxBidAsk);
    data.relativeBid = toPercentValue(data.bid / maxBidAsk);
    data.cumulativeVol.relativeAsk = toPercentValue(
      data.cumulativeVol.ask / cumulativeVol
    );
    data.cumulativeVol.relativeBid = toPercentValue(
      data.cumulativeVol.bid / cumulativeVol
    );
  });
};

export const createRow = (
  price: string,
  volume = 0,
  dataType?: VolumeType
): OrderbookRowData => ({
  price,
  ask: dataType === VolumeType.ask ? volume : 0,
  bid: dataType === VolumeType.bid ? volume : 0,
  cumulativeVol: {
    ask: dataType === VolumeType.ask ? volume : 0,
    bid: dataType === VolumeType.bid ? volume : 0,
  },
  askByLevel: dataType === VolumeType.ask ? { [price]: volume } : {},
  bidByLevel: dataType === VolumeType.bid ? { [price]: volume } : {},
});

const mapRawData =
  (dataType: VolumeType.ask | VolumeType.bid) =>
  (
    data:
      | MarketDepth_market_depth_sell
      | MarketDepthSubscription_marketDepthUpdate_sell
      | MarketDepth_market_depth_buy
      | MarketDepthSubscription_marketDepthUpdate_buy
  ): OrderbookRowData =>
    createRow(data.price, Number(data.volume), dataType);

/**
 * @summary merges sell amd buy data, orders by price desc, group by price level, counts cumulative and relative values
 */
export const compactRows = (
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
  // map raw sell data to OrderbookData
  const askOrderbookData = [...(sell ?? [])].map<OrderbookRowData>(
    mapRawData(VolumeType.ask)
  );
  // map raw buy data to OrderbookData
  const bidOrderbookData = [...(buy ?? [])].map<OrderbookRowData>(
    mapRawData(VolumeType.bid)
  );

  // group by price level
  const groupedByLevel = groupBy<OrderbookRowData>(
    [...askOrderbookData, ...bidOrderbookData],
    (row) => getPriceLevel(row.price, resolution)
  );

  // create single OrderbookData from grouped OrderbookData[], sum volumes and atore volume by level
  const orderbookData = Object.keys(groupedByLevel).reduce<OrderbookRowData[]>(
    (rows, price) =>
      rows.concat(
        groupedByLevel[price].reduce<OrderbookRowData>(
          (a, c) => ({
            ...a,
            ask: a.ask + c.ask,
            askByLevel: Object.assign(a.askByLevel, c.askByLevel),
            bid: (a.bid ?? 0) + (c.bid ?? 0),
            bidByLevel: Object.assign(a.bidByLevel, c.bidByLevel),
          }),
          createRow(price)
        )
      ),
    []
  );
  // order by price, it's safe to cast to number price diff should not exceed Number.MAX_SAFE_INTEGER
  orderbookData.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)));
  // count cumulative volumes
  if (orderbookData.length > 1) {
    const maxIndex = orderbookData.length - 1;
    for (let i = 0; i <= maxIndex; i++) {
      orderbookData[i].cumulativeVol.bid =
        orderbookData[i].bid +
        (i !== 0 ? orderbookData[i - 1].cumulativeVol.bid : 0);
    }
    for (let i = maxIndex; i >= 0; i--) {
      if (!orderbookData[i].cumulativeVol.ask) {
        orderbookData[i].cumulativeVol.ask =
          orderbookData[i].ask +
          (i !== maxIndex ? orderbookData[i + 1].cumulativeVol.ask : 0);
      }
    }
  }
  // count relative volumes
  updateRelativeData(orderbookData);
  return orderbookData;
};

/**
 *
 * @param type
 * @param draft
 * @param delta
 * @param resolution
 * @param modifiedIndex
 * @returns max (sell) or min (buy) modified index in draft data, mutates draft
 */
const partiallyUpdateCompactedRows = (
  dataType: VolumeType,
  draft: OrderbookRowData[],
  delta:
    | MarketDepthSubscription_marketDepthUpdate_sell
    | MarketDepthSubscription_marketDepthUpdate_buy,
  resolution: number,
  modifiedIndex: number
) => {
  const { price } = delta;
  const volume = Number(delta.volume);
  const priceLevel = getPriceLevel(price, resolution);
  const volKey = dataType === VolumeType.ask ? 'ask' : 'bid';
  const oppositeVolKey = dataType === VolumeType.ask ? 'bid' : 'ask';
  const volByLevelKey =
    dataType === VolumeType.ask ? 'askByLevel' : 'bidByLevel';
  const resolveModifiedIndex =
    dataType === VolumeType.ask ? Math.max : Math.min;
  let index = draft.findIndex((data) => data.price === priceLevel);
  if (index !== -1) {
    modifiedIndex = resolveModifiedIndex(modifiedIndex, index);
    draft[index][volKey] =
      draft[index][volKey] - (draft[index][volByLevelKey][price] || 0) + volume;
    draft[index][volByLevelKey][price] = volume;
  } else {
    const newData: OrderbookRowData = createRow(priceLevel, volume, dataType);
    index = draft.findIndex((data) => BigInt(data.price) < BigInt(priceLevel));
    if (index !== -1) {
      draft.splice(index, 0, newData);
      newData.cumulativeVol[oppositeVolKey] =
        draft[index + (dataType === VolumeType.ask ? -1 : 1)]?.cumulativeVol[
          oppositeVolKey
        ] ?? 0;
      modifiedIndex = resolveModifiedIndex(modifiedIndex, index);
    } else {
      draft.push(newData);
      modifiedIndex = draft.length - 1;
    }
  }
  return modifiedIndex;
};

/**
 * Updates OrderbookData[] with new data received from subscription - mutates input
 *
 * @param rows
 * @param sell
 * @param buy
 * @param resolution
 * @returns void
 */
export const updateCompactedRows = (
  rows: OrderbookRowData[],
  sell: MarketDepthSubscription_marketDepthUpdate_sell[] | null,
  buy: MarketDepthSubscription_marketDepthUpdate_buy[] | null,
  resolution: number
) =>
  produce(rows, (draft) => {
    let sellModifiedIndex = -1;
    sell?.forEach((delta) => {
      sellModifiedIndex = partiallyUpdateCompactedRows(
        VolumeType.ask,
        draft,
        delta,
        resolution,
        sellModifiedIndex
      );
    });
    let buyModifiedIndex = draft.length;
    buy?.forEach((delta) => {
      buyModifiedIndex = partiallyUpdateCompactedRows(
        VolumeType.bid,
        draft,
        delta,
        resolution,
        buyModifiedIndex
      );
    });

    // update cummulative ask only below hihgest modified price level
    if (sellModifiedIndex !== -1) {
      for (let i = Math.min(sellModifiedIndex, draft.length - 2); i >= 0; i--) {
        draft[i].cumulativeVol.ask =
          draft[i + 1].cumulativeVol.ask + draft[i].ask;
      }
    }
    // update cummulative bid only above lowest modified price level
    if (buyModifiedIndex !== draft.length) {
      for (
        let i = Math.max(buyModifiedIndex, 1), l = draft.length;
        i < l;
        i++
      ) {
        draft[i].cumulativeVol.bid =
          draft[i - 1].cumulativeVol.bid + draft[i].bid;
      }
    }
    let index = 0;
    // remove levels that do not have any volume
    while (index < draft.length) {
      if (!draft[index].ask && !draft[index].bid) {
        draft.splice(index, 1);
      } else {
        index += 1;
      }
    }
    // count relative volumes
    updateRelativeData(draft);
  });

export const mapMarketData = (
  data:
    | MarketDepth_market_data
    | MarketDepthSubscription_marketDepthUpdate_market_data
    | null,
  resolution: number
) => ({
  staticMidPrice:
    data?.staticMidPrice && getPriceLevel(data?.staticMidPrice, resolution),
  bestStaticBidPrice:
    data?.bestStaticBidPrice &&
    getPriceLevel(data?.bestStaticBidPrice, resolution),
  bestStaticOfferPrice:
    data?.bestStaticOfferPrice &&
    getPriceLevel(data?.bestStaticOfferPrice, resolution),
  indicativePrice:
    data?.indicativePrice && getPriceLevel(data?.indicativePrice, resolution),
});

/**
 * Updates raw data with new data received from subscription - mutates input
 * @param levels
 * @param updates
 * @returns
 */
export const updateLevels = (
  levels: (MarketDepth_market_depth_buy | MarketDepth_market_depth_sell)[],
  updates: (
    | MarketDepthSubscription_marketDepthUpdate_buy
    | MarketDepthSubscription_marketDepthUpdate_sell
  )[]
) => {
  updates.forEach((update) => {
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
  });
  return levels;
};

export interface MockDataGeneratorParams {
  numberOfSellRows: number;
  numberOfBuyRows: number;
  overlap: number;
  midPrice: number;
  bestStaticBidPrice: number;
  bestStaticOfferPrice: number;
  indicativePrice?: number;
  indicativeVolume?: number;
  resolution: number;
}

export const generateMockData = ({
  numberOfSellRows,
  numberOfBuyRows,
  midPrice,
  overlap,
  bestStaticBidPrice,
  bestStaticOfferPrice,
  indicativePrice,
  indicativeVolume,
  resolution,
}: MockDataGeneratorParams) => {
  let matrix = new Array(numberOfSellRows).fill(undefined);
  let price = midPrice + (numberOfSellRows - Math.ceil(overlap / 2) + 1);
  const sell: MarketDepth_market_depth_sell[] = matrix.map((row, i) => ({
    __typename: 'PriceLevel',
    price: (price -= 1).toString(),
    volume: (numberOfSellRows - i + 1).toString(),
    numberOfOrders: '',
  }));
  price += overlap;
  matrix = new Array(numberOfBuyRows).fill(undefined);
  const buy: MarketDepth_market_depth_buy[] = matrix.map((row, i) => ({
    __typename: 'PriceLevel',
    price: (price -= 1).toString(),
    volume: (i + 2).toString(),
    numberOfOrders: '',
  }));
  const rows = compactRows(sell, buy, resolution);
  return {
    rows,
    resolution,
    indicativeVolume: indicativeVolume?.toString(),
    ...mapMarketData(
      {
        __typename: 'MarketData',
        staticMidPrice: '',
        marketTradingMode:
          overlap > 0
            ? MarketTradingMode.BatchAuction
            : MarketTradingMode.Continuous,
        bestStaticBidPrice: bestStaticBidPrice.toString(),
        bestStaticOfferPrice: bestStaticOfferPrice.toString(),
        indicativePrice: indicativePrice?.toString() ?? '',
        indicativeVolume: indicativeVolume?.toString() ?? '',
        market: {
          __typename: 'Market',
          id: '',
        },
      },
      resolution
    ),
  };
};
