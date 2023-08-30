import groupBy from 'lodash/groupBy';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

export enum VolumeType {
  bid,
  ask,
}

export interface OrderbookRowData {
  price: string;
  volume: number;
  cumulativeVol: number;
}

export const getPriceLevel = (price: string | bigint, resolution: number) => {
  const p = BigInt(price);
  const r = BigInt(resolution);
  let priceLevel = (p / r) * r;
  if (p - priceLevel >= resolution / 2) {
    priceLevel += BigInt(resolution);
  }
  return priceLevel.toString();
};

const updateCumulativeVolumeByType = (
  data: OrderbookRowData[],
  dataType: VolumeType
) => {
  if (data.length) {
    const maxIndex = data.length - 1;
    if (dataType === VolumeType.bid) {
      for (let i = 0; i <= maxIndex; i++) {
        data[i].cumulativeVol =
          data[i].volume + (i !== 0 ? data[i - 1].cumulativeVol : 0);
      }
    } else {
      for (let i = maxIndex; i >= 0; i--) {
        data[i].cumulativeVol =
          data[i].volume + (i !== maxIndex ? data[i + 1].cumulativeVol : 0);
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
    orderbookData.push({
      price,
      volume: value,
      cumulativeVol: 0,
    });
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

  return orderbookData;
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
  lastTradedPrice: string;
  bestStaticBidPrice: number;
  bestStaticOfferPrice: number;
}

export const generateMockData = ({
  numberOfSellRows,
  numberOfBuyRows,
  lastTradedPrice,
  overlap,
  bestStaticBidPrice,
  bestStaticOfferPrice,
}: MockDataGeneratorParams) => {
  let matrix = new Array(numberOfSellRows).fill(undefined);
  let price =
    Number(lastTradedPrice) + (numberOfSellRows - Math.ceil(overlap / 2) + 1);
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
    lastTradedPrice,
    bestStaticBidPrice: bestStaticBidPrice.toString(),
    bestStaticOfferPrice: bestStaticOfferPrice.toString(),
  };
};
