import {
  compactData,
  updateLevels,
  updateCompactedData,
} from './orderbook-data';
import type { OrderbookData } from './orderbook-data';
import type { MarketDepth_market_depth_sell } from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';

describe('compactData', () => {
  const numberOfRows = 100;
  const middle = 1000;
  const sell: MarketDepth_market_depth_sell[] = new Array(numberOfRows)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: i.toString(),
      price: (middle + numberOfRows - i).toString(),
      numberOfOrders: i.toString(),
    }));
  const buy: MarketDepth_market_depth_sell[] = new Array(numberOfRows)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: (numberOfRows - 1 - i).toString(),
      price: (middle - i).toString(),
      numberOfOrders: (numberOfRows - i).toString(),
    }));
  it('groups data by price and resolution', () => {
    expect(compactData(sell, buy, 1).length).toEqual(200);
    expect(compactData(sell, buy, 5).length).toEqual(41);
    expect(compactData(sell, buy, 10).length).toEqual(21);
  });
  it('counts cumulative vol', () => {
    const orderbookData = compactData(sell, buy, 10);
    expect(orderbookData[0].cumulativeVol.ask).toEqual(4950);
    expect(orderbookData[0].cumulativeVol.bid).toEqual(0);
    expect(orderbookData[10].cumulativeVol.ask).toEqual(390);
    expect(orderbookData[10].cumulativeVol.bid).toEqual(579);
    expect(orderbookData[orderbookData.length - 1].cumulativeVol.bid).toEqual(
      4950
    );
    expect(orderbookData[orderbookData.length - 1].cumulativeVol.ask).toEqual(
      0
    );
  });
  it('stores volume by level', () => {
    const orderbookData = compactData(sell, buy, 10);
    expect(orderbookData[0].askByLevel).toEqual({
      '1095': 5,
      '1096': 4,
      '1097': 3,
      '1098': 2,
      '1099': 1,
      '1100': 0,
    });
    expect(orderbookData[orderbookData.length - 1].bidByLevel).toEqual({
      '901': 0,
      '902': 1,
      '903': 2,
      '904': 3,
    });
  });

  it('updates relative data', () => {
    const orderbookData = compactData(sell, buy, 10);
    expect(orderbookData[0].cumulativeVol.relativeAsk).toEqual(100);
    expect(orderbookData[0].cumulativeVol.relativeBid).toEqual(0);
    expect(orderbookData[0].relativeAsk).toEqual(2);
    expect(orderbookData[0].relativeBid).toEqual(0);
    expect(orderbookData[10].cumulativeVol.relativeAsk).toEqual(8);
    expect(orderbookData[10].cumulativeVol.relativeBid).toEqual(12);
    expect(orderbookData[10].relativeAsk).toEqual(44);
    expect(orderbookData[10].relativeBid).toEqual(64);
    expect(orderbookData[orderbookData.length - 1].relativeAsk).toEqual(0);
    expect(orderbookData[orderbookData.length - 1].relativeBid).toEqual(1);
  });
});

describe('updateLevels', () => {
  const levels: MarketDepth_market_depth_sell[] = new Array(10)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: ((i + 1) * 10).toString(),
      price: ((i + 1) * 10).toString(),
      numberOfOrders: ((i + 1) * 10).toString(),
    }));
  it('updates, removes and adds new items', () => {
    const removeFirstRow: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '10',
      volume: '0',
      numberOfOrders: '0',
    };
    updateLevels(levels, [removeFirstRow]);
    expect(levels[0].price).toEqual('20');
    updateLevels(levels, [removeFirstRow]);
    expect(levels[0].price).toEqual('20');
    expect(updateLevels([], [removeFirstRow])).toEqual([]);
    const addFirstRow: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '10',
      volume: '10',
      numberOfOrders: '10',
    };
    updateLevels(levels, [addFirstRow]);
    expect(levels[0].price).toEqual('10');
    const addBeforeLastRow: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '95',
      volume: '95',
      numberOfOrders: '95',
    };
    updateLevels(levels, [addBeforeLastRow]);
    expect(levels[levels.length - 2].price).toEqual('95');
    const addAtTheEnd: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '115',
      volume: '115',
      numberOfOrders: '115',
    };
    updateLevels(levels, [addAtTheEnd]);
    expect(levels[levels.length - 1].price).toEqual('115');
    const updateLastRow: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '115',
      volume: '116',
      numberOfOrders: '115',
    };
    updateLevels(levels, [updateLastRow]);
    expect(levels[levels.length - 1]).toEqual(updateLastRow);
    expect(updateLevels([], [updateLastRow])).toEqual([updateLastRow]);
  });
});

describe('updateCompactedData', () => {
  const orderbookData: OrderbookData[] = [
    {
      price: '120',
      cumulativeVol: {
        ask: 50,
        relativeAsk: 100,
        bid: 0,
        relativeBid: 0,
      },
      askByLevel: {
        '121': 10,
      },
      bidByLevel: {},
      ask: 10,
      bid: 0,
      relativeAsk: 25,
      relativeBid: 0,
    },
    {
      price: '100',
      cumulativeVol: {
        ask: 40,
        relativeAsk: 80,
        bid: 40,
        relativeBid: 80,
      },
      askByLevel: {
        '101': 10,
        '102': 30,
      },
      bidByLevel: {
        '99': 10,
        '98': 30,
      },
      ask: 40,
      bid: 40,
      relativeAsk: 100,
      relativeBid: 100,
    },
    {
      price: '80',
      cumulativeVol: {
        ask: 0,
        relativeAsk: 0,
        bid: 50,
        relativeBid: 100,
      },
      askByLevel: {},
      bidByLevel: {
        '79': 10,
      },
      ask: 0,
      bid: 10,
      relativeAsk: 0,
      relativeBid: 25,
    },
  ];
  const resolution = 10;

  it('update volume', () => {
    const sell: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '120',
      volume: '10',
      numberOfOrders: '10',
    };
    const buy: MarketDepthSubscription_marketDepthUpdate_buy = {
      __typename: 'PriceLevel',
      price: '80',
      volume: '10',
      numberOfOrders: '10',
    };
    const updatedData = updateCompactedData(
      orderbookData,
      [sell],
      [buy],
      resolution
    );
    expect(updatedData[0].ask).toEqual(20);
    expect(updatedData[0].askByLevel?.['120']).toEqual(10);
    expect(updatedData[0].cumulativeVol.ask).toEqual(60);
    expect(updatedData[4].bid).toEqual(20);
    expect(updatedData[4].bidByLevel?.['80']).toEqual(10);
    expect(updatedData[4].cumulativeVol.bid).toEqual(60);
  });

  it('update with zero value volume', () => {
    const sell: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '121',
      volume: '0',
      numberOfOrders: '0',
    };
    const buy: MarketDepthSubscription_marketDepthUpdate_buy = {
      __typename: 'PriceLevel',
      price: '79',
      volume: '0',
      numberOfOrders: '0',
    };
    const updatedData = updateCompactedData(
      orderbookData,
      [sell],
      [buy],
      resolution
    );
    expect(updatedData.length).toEqual(5);
  });

  it('add new row at the end', () => {
    const sell: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '131',
      volume: '5',
      numberOfOrders: '5',
    };
    const buy: MarketDepthSubscription_marketDepthUpdate_buy = {
      __typename: 'PriceLevel',
      price: '59',
      volume: '5',
      numberOfOrders: '5',
    };
    const updatedData = updateCompactedData(
      orderbookData,
      [sell],
      [buy],
      resolution
    );
    expect(updatedData.length).toEqual(8);
    expect(updatedData[0].price).toEqual('130');
    expect(updatedData[0].cumulativeVol.ask).toEqual(55);
    expect(updatedData[7].price).toEqual('60');
    expect(updatedData[7].cumulativeVol.bid).toEqual(55);
  });

  it('add new row in the middle', () => {
    const sell: MarketDepthSubscription_marketDepthUpdate_sell = {
      __typename: 'PriceLevel',
      price: '111',
      volume: '5',
      numberOfOrders: '5',
    };
    const buy: MarketDepthSubscription_marketDepthUpdate_buy = {
      __typename: 'PriceLevel',
      price: '91',
      volume: '5',
      numberOfOrders: '5',
    };
    const updatedData = updateCompactedData(
      orderbookData,
      [sell],
      [buy],
      resolution
    );
    expect(updatedData.length).toEqual(5);
    expect(updatedData[1].price).toEqual('110');
    expect(updatedData[1].cumulativeVol.ask).toEqual(45);
    expect(updatedData[0].cumulativeVol.ask).toEqual(55);
    expect(updatedData[3].price).toEqual('90');
    expect(updatedData[3].cumulativeVol.bid).toEqual(45);
    expect(updatedData[4].cumulativeVol.bid).toEqual(55);
  });
});
