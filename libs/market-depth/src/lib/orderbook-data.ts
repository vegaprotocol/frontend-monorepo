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
  cumulativeVol: CumulativeVol;
}

type PartialOrderbookRowData = Pick<OrderbookRowData, 'price' | 'value'>;

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

export const compactRows = (
  data: PriceLevelFieldsFragment[] | null | undefined,
  dataType: VolumeType,
  resolution: number
) => {
  const groupedByLevel = groupBy(data, (row) =>
    getPriceLevel(row.price, resolution)
  );
  const orderbookData: OrderbookRowData[] = [];
  Object.keys(groupedByLevel).forEach((price) => {
    const { volume } = groupedByLevel[price].pop() as PriceLevelFieldsFragment;
    let value = Number(volume);
    let subRow: { volume: string } | undefined = groupedByLevel[price].pop();
    while (subRow) {
      value += Number(subRow.volume);
      subRow = groupedByLevel[price].pop();
    }
    orderbookData.push({ price, value, cumulativeVol: { value: 0 } });
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

const updateRowsData = (
  dataType: VolumeType,
  data: PriceLevelFieldsFragment[],
  delta: PriceLevelFieldsFragment
) => {
  const { price, volume, numberOfOrders } = delta;
  let index = data.findIndex((row) => row.price === price);
  if (index !== -1) {
    if (volume === '0') {
      data.splice(index, 1);
    } else {
      data[index].volume = volume;
    }
  } else if (volume !== '0') {
    const newData = { price, volume, numberOfOrders };
    index = data.findIndex((row) => BigInt(row.price) < BigInt(price));
    if (index !== -1) {
      data.splice(index, 0, newData);
    } else {
      data.push(newData);
    }
  }
};

export const fillSubscriptionData = (
  oldData: PriceLevelFieldsFragment[],
  newData: PriceLevelFieldsFragment[],
  dataType: VolumeType
) => {
  if (newData.length) {
    const data = cloneDeep(oldData as PriceLevelFieldsFragment[]);
    uniqBy(reverse(newData || []), 'price')?.forEach((delta) => {
      updateRowsData(dataType, data, delta);
    });
    return data;
  }
  return oldData;
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
  return {
    asks: sell,
    bids: buy,
    markPrice,
    bestStaticBidPrice: bestStaticBidPrice.toString(),
    bestStaticOfferPrice: bestStaticOfferPrice.toString(),
  };
};
