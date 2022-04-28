import {
  compactRows,
  updateLevels,
  updateCompactedRows,
} from './orderbook-data';
import type { OrderbookRow } from './orderbook-data';
import type { MarketDepth_market_depth_sell } from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';

describe('compactRows', () => {
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
    expect(compactRows(sell, buy, 1).length).toEqual(200);
    expect(compactRows(sell, buy, 5).length).toEqual(41);
    expect(compactRows(sell, buy, 10).length).toEqual(21);
  });
  it('counts cumulative vol', () => {
    const orderbookRows = compactRows(sell, buy, 10);
    expect(orderbookRows[0].cumulativeVol.ask).toEqual(4950);
    expect(orderbookRows[0].cumulativeVol.bid).toEqual(0);
    expect(orderbookRows[10].cumulativeVol.ask).toEqual(390);
    expect(orderbookRows[10].cumulativeVol.bid).toEqual(579);
    expect(orderbookRows[orderbookRows.length - 1].cumulativeVol.bid).toEqual(
      4950
    );
    expect(orderbookRows[orderbookRows.length - 1].cumulativeVol.ask).toEqual(
      0
    );
  });
  it('stores volume by level', () => {
    const orderbookRows = compactRows(sell, buy, 10);
    expect(orderbookRows[0].askByLevel).toEqual({
      '1095': 5,
      '1096': 4,
      '1097': 3,
      '1098': 2,
      '1099': 1,
      '1100': 0,
    });
    expect(orderbookRows[orderbookRows.length - 1].bidByLevel).toEqual({
      '901': 0,
      '902': 1,
      '903': 2,
      '904': 3,
    });
  });

  it('updates relative data', () => {
    const orderbookRows = compactRows(sell, buy, 10);
    expect(orderbookRows[0].cumulativeVol.relativeAsk).toEqual(100);
    expect(orderbookRows[0].cumulativeVol.relativeBid).toEqual(0);
    expect(orderbookRows[0].relativeAsk).toEqual(2);
    expect(orderbookRows[0].relativeBid).toEqual(0);
    expect(orderbookRows[10].cumulativeVol.relativeAsk).toEqual(8);
    expect(orderbookRows[10].cumulativeVol.relativeBid).toEqual(12);
    expect(orderbookRows[10].relativeAsk).toEqual(44);
    expect(orderbookRows[10].relativeBid).toEqual(64);
    expect(orderbookRows[orderbookRows.length - 1].relativeAsk).toEqual(0);
    expect(orderbookRows[orderbookRows.length - 1].relativeBid).toEqual(1);
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

describe('updateCompactedRows', () => {
  const orderbookRows: OrderbookRow[] = [
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
    const updatedRows = updateCompactedRows(
      orderbookRows,
      [sell],
      [buy],
      resolution
    );
    expect(updatedRows[0].ask).toEqual(20);
    expect(updatedRows[0].askByLevel?.['120']).toEqual(10);
    expect(updatedRows[0].cumulativeVol.ask).toEqual(60);
    expect(updatedRows[4].bid).toEqual(20);
    expect(updatedRows[4].bidByLevel?.['80']).toEqual(10);
    expect(updatedRows[4].cumulativeVol.bid).toEqual(60);
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
    const updatedRows = updateCompactedRows(
      orderbookRows,
      [sell],
      [buy],
      resolution
    );
    expect(updatedRows.length).toEqual(5);
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
    const updatedRows = updateCompactedRows(
      orderbookRows,
      [sell],
      [buy],
      resolution
    );
    expect(updatedRows.length).toEqual(8);
    expect(updatedRows[0].price).toEqual('130');
    expect(updatedRows[0].cumulativeVol.ask).toEqual(55);
    expect(updatedRows[7].price).toEqual('60');
    expect(updatedRows[7].cumulativeVol.bid).toEqual(55);
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
    const updatedRows = updateCompactedRows(
      orderbookRows,
      [sell],
      [buy],
      resolution
    );
    expect(updatedRows.length).toEqual(5);
    expect(updatedRows[1].price).toEqual('110');
    expect(updatedRows[1].cumulativeVol.ask).toEqual(45);
    expect(updatedRows[0].cumulativeVol.ask).toEqual(55);
    expect(updatedRows[3].price).toEqual('90');
    expect(updatedRows[3].cumulativeVol.bid).toEqual(45);
    expect(updatedRows[4].cumulativeVol.bid).toEqual(55);
  });
});
