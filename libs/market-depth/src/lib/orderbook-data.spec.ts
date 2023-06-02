import type { OrderbookRowData } from './orderbook-data';
import {
  compactTypedRows,
  updateCompactedRows,
  updateLevels,
  VolumeType,
} from './orderbook-data';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

describe('compactTypedRows', () => {
  const numberOfRows = 100;
  const middle = 1000;
  const sell: PriceLevelFieldsFragment[] = new Array(numberOfRows)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: i.toString(),
      price: (middle + numberOfRows - i).toString(),
      numberOfOrders: i.toString(),
    }));
  const buy: PriceLevelFieldsFragment[] = new Array(numberOfRows)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: (numberOfRows - 1 - i).toString(),
      price: (middle - i).toString(),
      numberOfOrders: (numberOfRows - i).toString(),
    }));
  it('groups data by price and resolution', () => {
    expect(compactTypedRows(sell, VolumeType.ask, 1).length).toEqual(100);
    expect(compactTypedRows(buy, VolumeType.bid, 1).length).toEqual(100);
    expect(compactTypedRows(sell, VolumeType.ask, 5).length).toEqual(21);
    expect(compactTypedRows(buy, VolumeType.bid, 5).length).toEqual(21);
    expect(compactTypedRows(sell, VolumeType.ask, 10).length).toEqual(11);
    expect(compactTypedRows(buy, VolumeType.bid, 10).length).toEqual(11);
  });
  it('counts cumulative vol', () => {
    const asks = compactTypedRows(sell, VolumeType.ask, 10);
    const bids = compactTypedRows(buy, VolumeType.bid, 10);
    expect(asks[0].cumulativeVol.ask).toEqual(4950);
    expect(bids[0].cumulativeVol.bid).toEqual(579);
    expect(asks[10].cumulativeVol.ask).toEqual(390);
    expect(bids[10].cumulativeVol.bid).toEqual(4950);
    expect(bids[bids.length - 1].cumulativeVol.bid).toEqual(4950);
    expect(asks[asks.length - 1].cumulativeVol.ask).toEqual(390);
  });
  it('stores volume by level', () => {
    const asks = compactTypedRows(sell, VolumeType.ask, 10);
    const bids = compactTypedRows(buy, VolumeType.bid, 10);
    expect(asks[0].askByLevel).toEqual({
      '1095': 5,
      '1096': 4,
      '1097': 3,
      '1098': 2,
      '1099': 1,
    });
    expect(bids[bids.length - 1].bidByLevel).toEqual({
      '902': 1,
      '903': 2,
      '904': 3,
    });
  });

  it('updates relative data', () => {
    const asks = compactTypedRows(sell, VolumeType.ask, 10);
    const bids = compactTypedRows(buy, VolumeType.bid, 10);
    expect(asks[0].cumulativeVol.relativeAsk).toEqual(100);
    expect(bids[0].cumulativeVol.relativeBid).toEqual(12);
    expect(asks[0].relativeAsk).toEqual(2);
    expect(bids[0].relativeBid).toEqual(66);
    expect(asks[10].cumulativeVol.relativeAsk).toEqual(8);
    expect(bids[10].cumulativeVol.relativeBid).toEqual(100);
    expect(asks[10].relativeAsk).toEqual(44);
    expect(bids[10].relativeBid).toEqual(1);
    expect(asks[asks.length - 1].relativeAsk).toEqual(44);
    expect(bids[bids.length - 1].relativeBid).toEqual(1);
  });
});

describe('updateLevels', () => {
  let levels: PriceLevelFieldsFragment[] = new Array(10)
    .fill(null)
    .map((n, i) => ({
      __typename: 'PriceLevel',
      volume: ((i + 1) * 10).toString(),
      price: ((i + 1) * 10).toString(),
      numberOfOrders: ((i + 1) * 10).toString(),
    }));
  it('updates, removes and adds new items', () => {
    const removeFirstRow: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '10',
      volume: '0',
      numberOfOrders: '0',
    };
    levels = updateLevels(levels, [removeFirstRow]);
    expect(levels[0].price).toEqual('20');
    levels = updateLevels(levels, [removeFirstRow]);
    expect(levels[0].price).toEqual('20');
    expect(updateLevels([], [removeFirstRow])).toEqual([]);
    const addFirstRow: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '10',
      volume: '10',
      numberOfOrders: '10',
    };
    levels = updateLevels(levels, [addFirstRow]);
    expect(levels[0].price).toEqual('10');
    const addBeforeLastRow: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '95',
      volume: '95',
      numberOfOrders: '95',
    };
    levels = updateLevels(levels, [addBeforeLastRow]);
    expect(levels[levels.length - 2].price).toEqual('95');
    const addAtTheEnd: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '115',
      volume: '115',
      numberOfOrders: '115',
    };
    levels = updateLevels(levels, [addAtTheEnd]);
    expect(levels[levels.length - 1].price).toEqual('115');
    const updateLastRow: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '115',
      volume: '116',
      numberOfOrders: '115',
    };
    levels = updateLevels(levels, [updateLastRow]);
    expect(levels[levels.length - 1]).toEqual(updateLastRow);
    expect(updateLevels([], [updateLastRow])).toEqual([updateLastRow]);
  });
});

describe('updateCompactedRowsByType', () => {
  const orderbookRows: OrderbookRowData[] = [
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
    const sell: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '120',
      volume: '10',
      numberOfOrders: '10',
    };
    const buy: PriceLevelFieldsFragment = {
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
    expect(updatedRows[0].askByLevel?.[120]).toEqual(10);
    expect(updatedRows[0].cumulativeVol.ask).toEqual(60);
    expect(updatedRows[2].bid).toEqual(20);
    expect(updatedRows[2].bidByLevel?.[80]).toEqual(10);
    expect(updatedRows[2].cumulativeVol.bid).toEqual(60);
  });

  it('remove row', () => {
    const sell: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '121',
      volume: '0',
      numberOfOrders: '0',
    };
    const buy: PriceLevelFieldsFragment = {
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
    expect(updatedRows.length).toEqual(1);
  });

  it('add new row at the end', () => {
    const sell: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '131',
      volume: '5',
      numberOfOrders: '5',
    };
    const buy: PriceLevelFieldsFragment = {
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
    expect(updatedRows.length).toEqual(5);
    expect(updatedRows[0].price).toEqual('130');
    expect(updatedRows[0].cumulativeVol.ask).toEqual(55);
    expect(updatedRows[4].price).toEqual('60');
    expect(updatedRows[4].cumulativeVol.bid).toEqual(55);
  });

  it('add new row in the middle', () => {
    const sell: PriceLevelFieldsFragment = {
      __typename: 'PriceLevel',
      price: '111',
      volume: '5',
      numberOfOrders: '5',
    };
    const buy: PriceLevelFieldsFragment = {
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
