import produce from 'immer';
import groupBy from 'lodash/groupBy';
import { VolumeType } from '@vegaprotocol/react-helpers';
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
  relativeBid?: number;
  ask: number;
  relativeAsk?: number;
}

export interface OrderbookData {
  price: string;
  bid: number;
  bidByLevel: Record<string, number>;
  relativeBid?: number;
  ask: number;
  askByLevel: Record<string, number>;
  relativeAsk?: number;
  cumulativeVol: CumulativeVol;
}

const getPriceLevel = (price: string, resolution: number) => {
  const p = BigInt(price);
  const r = BigInt(resolution);
  let priceLevel = (p / r) * r;
  if (p - priceLevel >= resolution / 2) {
    priceLevel += BigInt(resolution);
  }
  return priceLevel.toString();
};

const getMaxVolumes = (orderbookData: OrderbookData[]) => ({
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
const updateRelativeData = (data: OrderbookData[]) => {
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

const createData = (
  price: string,
  volume = 0,
  dataType?: VolumeType
): OrderbookData => ({
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
  ): OrderbookData =>
    createData(data.price, Number(data.volume), dataType);

const fillGaps = (orderbookData: OrderbookData[], resolution: number) => {
  if (orderbookData.length < 2) {
    return;
  }
  let index = 0;
  while (index < orderbookData.length - 1) {
    if (
      BigInt(orderbookData[index].price) -
        BigInt(orderbookData[index + 1].price) !==
      BigInt(resolution)
    ) {
      const data = createData(
        (BigInt(orderbookData[index].price) - BigInt(resolution)).toString()
      );
      data.cumulativeVol = { ...orderbookData[index].cumulativeVol };
      orderbookData.splice(index + 1, 0, data);
    }
    index += 1;
  }
};

/**
 * @summary merges sell amd buy data, orders by price desc, group by price level, counts cumulative and relative values
 */
export const compactData = (
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
  const askOrderbookData = [...(sell ?? [])].map<OrderbookData>(
    mapRawData(VolumeType.ask)
  );
  // map raw buy data to OrderbookData
  const bidOrderbookData = [...(buy ?? [])].map<OrderbookData>(
    mapRawData(VolumeType.bid)
  );

  // group by price level
  const groupedByLevel = groupBy<OrderbookData>(
    [...askOrderbookData, ...bidOrderbookData],
    (row) => getPriceLevel(row.price, resolution)
  );

  // create single OrderbookData from grouped OrderbookData[], sum volumes and atore volume by level
  const orderbookData = Object.keys(groupedByLevel).reduce<OrderbookData[]>(
    (rows, price) =>
      rows.concat(
        groupedByLevel[price].reduce<OrderbookData>(
          (a, c) => ({
            ...a,
            ask: a.ask + c.ask,
            askByLevel: Object.assign(a.askByLevel, c.askByLevel),
            bid: (a.bid ?? 0) + (c.bid ?? 0),
            bidByLevel: Object.assign(a.bidByLevel, c.bidByLevel),
          }),
          createData(price)
        )
      ),
    []
  );
  // order by price, it's safe to cast to number price diff sould not exceed Number.MAX_SAFE_INTEGER
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
  // fill gaps between price levels
  fillGaps(orderbookData, resolution);
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
const partiallyUpdateCompactedData = (
  dataType: VolumeType,
  draft: OrderbookData[],
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
    const newData: OrderbookData = createData(priceLevel, volume, dataType);
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
 * @param orderbookData
 * @param sell
 * @param buy
 * @param resolution
 * @returns void
 */
export const updateCompactedData = (
  orderbookData: OrderbookData[],
  sell: MarketDepthSubscription_marketDepthUpdate_sell[] | null,
  buy: MarketDepthSubscription_marketDepthUpdate_buy[] | null,
  resolution: number
) =>
  produce(orderbookData, (draft) => {
    let sellModifiedIndex = -1;
    sell?.forEach((buy) => {
      sellModifiedIndex = partiallyUpdateCompactedData(
        VolumeType.ask,
        draft,
        buy,
        resolution,
        sellModifiedIndex
      );
    });
    let buyModifiedIndex = draft.length;
    buy?.forEach((sell) => {
      buyModifiedIndex = partiallyUpdateCompactedData(
        VolumeType.bid,
        draft,
        sell,
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
    // fill gaps between price levels
    fillGaps(draft, resolution);
    // count relative volumes
    updateRelativeData(draft);
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
