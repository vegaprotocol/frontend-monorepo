import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import reverse from 'lodash/reverse';
import cloneDeep from 'lodash/cloneDeep';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

export enum VolumeType {
  bid,
  ask,
}
export interface CumulativeVol {
  value: number;
  relativeValue?: number;
}

export interface OrderbookRowData {
  price: string;
  value: number;
  valuesByLevel: Record<string, number>;
  cumulativeVol: CumulativeVol;
}

type PartialOrderbookRowData = Pick<OrderbookRowData, 'price' | 'value'>;

export type OrderbookData = {
  asks: OrderbookRowData[] | null;
  bids: OrderbookRowData[] | null;
};

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
  cumulativeVol: Math.max(
    orderbookData[0]?.cumulativeVol.value,
    orderbookData[orderbookData.length - 1]?.cumulativeVol.value
  ),
});

// round instead of ceil so we will not show 0 if value if different than 0
const toPercentValue = (value?: number) => Math.ceil((value ?? 0) * 100);

const updateRelativeData = (data: OrderbookRowData[]) => {
  const { cumulativeVol } = getMaxVolumes(data);
  data.forEach((data, i) => {
    data.cumulativeVol.relativeValue = toPercentValue(
      data.cumulativeVol.value / cumulativeVol
    );
  });
};

const updateCumulativeVolumeByType = (
  data: OrderbookRowData[],
  dataType: VolumeType
) => {
  if (data.length) {
    const maxIndex = data.length - 1;
    if (dataType === VolumeType.bid) {
      for (let i = 0; i <= maxIndex; i++) {
        data[i].cumulativeVol.value =
          data[i].value + (i !== 0 ? data[i - 1].cumulativeVol.value : 0);
      }
    } else {
      for (let i = maxIndex; i >= 0; i--) {
        data[i].cumulativeVol.value =
          data[i].value +
          (i !== maxIndex ? data[i + 1].cumulativeVol.value : 0);
      }
    }
  }
};

export const createPartialRow = (
  price: string,
  volume = 0
): PartialOrderbookRowData => ({
  price,
  value: volume,
});

export const extendRow = (row: PartialOrderbookRowData): OrderbookRowData =>
  Object.assign(row, {
    cumulativeVol: {
      value: 0,
    },
    valuesByLevel: { [row.price]: row.value },
  });

export const createRow = (price: string, volume = 0): OrderbookRowData =>
  extendRow(createPartialRow(price, volume));

export const compactTypedRows = (
  directedData: PriceLevelFieldsFragment[] | null | undefined,
  dataType: VolumeType,
  resolution: number
) => {
  // map raw sell data to OrderbookData
  const mappedData = (directedData || [])
    .filter((item) => item.volume !== '0')
    .map<PartialOrderbookRowData>((data) =>
      createPartialRow(data.price, Number(data.volume))
    );

  const groupedByLevel = groupBy<PartialOrderbookRowData>(mappedData, (row) =>
    getPriceLevel(row.price, resolution)
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
      row.value += subRow.value;
      row.valuesByLevel[subRow.price] = subRow.value;
      subRow = groupedByLevel[price].pop();
    }
    orderbookData.push(row);
  });
  orderbookData.sort((a, b) => {
    if (a === b) {
      return 0;
    }
    if (BigInt(a.price) > BigInt(b.price)) {
      return -1;
    }
    return 1;
  });

  updateCumulativeVolumeByType(orderbookData, dataType);
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
  let index = data.findIndex((row) => row.price === priceLevel);
  if (index !== -1) {
    data[index].valuesByLevel[price] = volume;
    data[index].value = Object.entries(data[index].valuesByLevel).reduce(
      (sum, values) => {
        sum += values[1];
        return sum;
      },
      0
    );
  } else {
    const newData: OrderbookRowData = createRow(priceLevel, volume);
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
 * @param oldData sell | buy
 * @param newData delta sell | buy
 * @param resolution
 * @param dataType VolumeType
 * @returns void
 */
export const updateCompactedRowsByType = (
  oldData: Readonly<OrderbookRowData[]>,
  newData: Readonly<PriceLevelFieldsFragment[]> | null,
  resolution: number,
  dataType: VolumeType
) => {
  const data = cloneDeep(oldData as OrderbookRowData[]);
  uniqBy(reverse(newData || []), 'price')?.forEach((delta) => {
    partiallyUpdateCompactedRows(dataType, data, delta, resolution);
  });

  updateCumulativeVolumeByType(data, dataType);
  let index = 0;
  // remove levels that do not have any volume
  while (index < data.length) {
    if (!data[index].value) {
      data.splice(index, 1);
    } else {
      index += 1;
    }
  }
  // count relative volumes
  updateRelativeData(data);
  return data;
};

/**
 * Updates raw data with new data received from subscription - mutates input
 * @param levels
 * @param updates
 * @returns
 */
export const updateLevels = (
  draft: PriceLevelFieldsFragment[],
  updates: (PriceLevelFieldsFragment | PriceLevelFieldsFragment)[],
  ascending = true
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
      index = levels.findIndex((level) =>
        ascending
          ? BigInt(level.price) > BigInt(update.price)
          : BigInt(level.price) < BigInt(update.price)
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
  markPrice?: string;
  bestStaticBidPrice: number;
  bestStaticOfferPrice: number;
  resolution: number;
}

export const generateMockData = ({
  numberOfSellRows,
  numberOfBuyRows,
  midPrice,
  markPrice,
  overlap,
  bestStaticBidPrice,
  bestStaticOfferPrice,
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
  const asks = compactTypedRows(sell, VolumeType.ask, resolution);
  const bids = compactTypedRows(buy, VolumeType.bid, resolution);
  return {
    asks,
    bids,
    resolution,
    midPrice: ((bestStaticBidPrice + bestStaticOfferPrice) / 2).toString(),
    markPrice,
    bestStaticBidPrice: bestStaticBidPrice.toString(),
    bestStaticOfferPrice: bestStaticOfferPrice.toString(),
  };
};
