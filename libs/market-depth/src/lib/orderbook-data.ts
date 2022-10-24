import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import reverse from 'lodash/reverse';
import cloneDeep from 'lodash/cloneDeep';
import { VolumeType } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import type { MarketData } from '@vegaprotocol/market-list';
import type { PriceLevelFieldsFragment } from './__generated___/MarketDepth';
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

type PartialOrderbookRowData = Pick<OrderbookRowData, 'price' | 'ask' | 'bid'>;

export type OrderbookData = Partial<
  Omit<MarketData, '__typename' | 'market'>
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
  data.forEach((data, i) => {
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

const updateCumulativeVolume = (data: OrderbookRowData[]) => {
  if (data.length > 1) {
    const maxIndex = data.length - 1;
    for (let i = 0; i <= maxIndex; i++) {
      data[i].cumulativeVol.bid =
        data[i].bid + (i !== 0 ? data[i - 1].cumulativeVol.bid : 0);
    }
    for (let i = maxIndex; i >= 0; i--) {
      data[i].cumulativeVol.ask =
        data[i].ask + (i !== maxIndex ? data[i + 1].cumulativeVol.ask : 0);
    }
  }
};

export const createPartialRow = (
  price: string,
  volume = 0,
  dataType?: VolumeType
): PartialOrderbookRowData => ({
  price,
  ask: dataType === VolumeType.ask ? volume : 0,
  bid: dataType === VolumeType.bid ? volume : 0,
});

export const extendRow = (row: PartialOrderbookRowData): OrderbookRowData =>
  Object.assign(row, {
    cumulativeVol: {
      ask: 0,
      bid: 0,
    },
    askByLevel: row.ask ? { [row.price]: row.ask } : {},
    bidByLevel: row.bid ? { [row.price]: row.bid } : {},
  });

export const createRow = (
  price: string,
  volume = 0,
  dataType?: VolumeType
): OrderbookRowData => extendRow(createPartialRow(price, volume, dataType));

const mapRawData =
  (dataType: VolumeType.ask | VolumeType.bid) =>
  (data: PriceLevelFieldsFragment): PartialOrderbookRowData =>
    createPartialRow(data.price, Number(data.volume), dataType);

/**
 * @summary merges sell amd buy data, orders by price desc, group by price level, counts cumulative and relative values
 */
export const compactRows = (
  sell: PriceLevelFieldsFragment[] | null | undefined,
  buy: PriceLevelFieldsFragment[] | null | undefined,
  resolution: number
) => {
  // map raw sell data to OrderbookData
  const askOrderbookData = [...(sell ?? [])].map<PartialOrderbookRowData>(
    mapRawData(VolumeType.ask)
  );
  // map raw buy data to OrderbookData
  const bidOrderbookData = [...(buy ?? [])].map<PartialOrderbookRowData>(
    mapRawData(VolumeType.bid)
  );
  // group by price level
  const groupedByLevel = groupBy<PartialOrderbookRowData>(
    [...askOrderbookData, ...bidOrderbookData],
    (row) => getPriceLevel(row.price, resolution)
  );
  const orderbookData: OrderbookRowData[] = [];
  Object.keys(groupedByLevel).forEach((price) => {
    const row = extendRow(
      groupedByLevel[price].pop() as PartialOrderbookRowData
    );
    row.price = price;
    let subRow: PartialOrderbookRowData | undefined =
      groupedByLevel[price].pop();
    while (subRow) {
      row.ask += subRow.ask;
      row.bid += subRow.bid;
      if (subRow.ask) {
        row.askByLevel[subRow.price] = subRow.ask;
      }
      if (subRow.bid) {
        row.bidByLevel[subRow.price] = subRow.bid;
      }
      subRow = groupedByLevel[price].pop();
    }
    orderbookData.push(row);
  });
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
      orderbookData[i].cumulativeVol.ask =
        orderbookData[i].ask +
        (i !== maxIndex ? orderbookData[i + 1].cumulativeVol.ask : 0);
    }
  }
  updateCumulativeVolume(orderbookData);
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
  data: OrderbookRowData[],
  delta: PriceLevelFieldsFragment,
  resolution: number
) => {
  const { price } = delta;
  const volume = Number(delta.volume);
  const priceLevel = getPriceLevel(price, resolution);
  const isAskDataType = dataType === VolumeType.ask;
  const volKey = isAskDataType ? 'ask' : 'bid';
  const volByLevelKey = isAskDataType ? 'askByLevel' : 'bidByLevel';
  let index = data.findIndex((row) => row.price === priceLevel);
  if (index !== -1) {
    data[index][volKey] =
      data[index][volKey] - (data[index][volByLevelKey][price] || 0) + volume;
    data[index][volByLevelKey][price] = volume;
  } else {
    const newData: OrderbookRowData = createRow(priceLevel, volume, dataType);
    index = data.findIndex((row) => BigInt(row.price) < BigInt(priceLevel));
    if (index !== -1) {
      data.splice(index, 0, newData);
    } else {
      data.push(newData);
    }
  }
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
  rows: Readonly<OrderbookRowData[]>,
  sell: Readonly<PriceLevelFieldsFragment[]> | null,
  buy: Readonly<PriceLevelFieldsFragment[]> | null,
  resolution: number
) => {
  const data = cloneDeep(rows as OrderbookRowData[]);
  uniqBy(reverse(sell || []), 'price')?.forEach((delta) => {
    partiallyUpdateCompactedRows(VolumeType.ask, data, delta, resolution);
  });
  uniqBy(reverse(buy || []), 'price')?.forEach((delta) => {
    partiallyUpdateCompactedRows(VolumeType.bid, data, delta, resolution);
  });
  updateCumulativeVolume(data);
  let index = 0;
  // remove levels that do not have any volume
  while (index < data.length) {
    if (!data[index].ask && !data[index].bid) {
      data.splice(index, 1);
    } else {
      index += 1;
    }
  }
  // count relative volumes
  updateRelativeData(data);
  return data;
};

export const mapMarketData = (
  data: Pick<
    MarketData,
    | 'staticMidPrice'
    | 'bestStaticBidPrice'
    | 'bestStaticOfferPrice'
    | 'indicativePrice'
  > | null,
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
  draft: PriceLevelFieldsFragment[],
  updates: (PriceLevelFieldsFragment | PriceLevelFieldsFragment)[]
) => {
  const levels = [...draft];
  updates.forEach((update) => {
    let index = levels.findIndex((level) => level.price === update.price);
    if (index !== -1) {
      if (update.volume === '0') {
        levels.splice(index, 1);
      } else {
        levels[index] = update;
      }
    } else if (update.volume !== '0') {
      index = levels.findIndex(
        (level) => BigInt(level.price) > BigInt(update.price)
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
  const sell: PriceLevelFieldsFragment[] = matrix.map((row, i) => ({
    price: (price -= 1).toString(),
    volume: (numberOfSellRows - i + 1).toString(),
    numberOfOrders: '',
  }));
  price += overlap;
  matrix = new Array(numberOfBuyRows).fill(undefined);
  const buy: PriceLevelFieldsFragment[] = matrix.map((row, i) => ({
    price: (price -= 1).toString(),
    volume: (i + 2).toString(),
    numberOfOrders: '',
  }));
  const rows = compactRows(sell, buy, resolution);
  return {
    rows,
    resolution,
    indicativeVolume: indicativeVolume?.toString(),
    marketTradingMode:
      overlap > 0
        ? MarketTradingMode.TRADING_MODE_BATCH_AUCTION
        : MarketTradingMode.TRADING_MODE_CONTINUOUS,
    ...mapMarketData(
      {
        staticMidPrice: '',
        bestStaticBidPrice: bestStaticBidPrice.toString(),
        bestStaticOfferPrice: bestStaticOfferPrice.toString(),
        indicativePrice: indicativePrice?.toString() ?? '',
      },
      resolution
    ),
  };
};
