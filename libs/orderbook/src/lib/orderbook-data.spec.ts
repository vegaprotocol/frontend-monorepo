import { compact, updateLevels, updateCompactedData } from './orderbook-data';
import type { OrderbookData } from './orderbook-data';
import type { MarketDepth_market_depth_sell } from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
} from './__generated__/MarketDepthSubscription';

describe('compact', () => {
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
    expect(compact(sell, buy, 1).length).toEqual(200);
    expect(compact(sell, buy, 5).length).toEqual(41);
    expect(compact(sell, buy, 10).length).toEqual(21);
  });
  it('counts cummulative vol', () => {
    const orderbookData = compact(sell, buy, 10);
    expect(orderbookData[0].cummulativeVol.ask).toEqual(4950);
    expect(orderbookData[0].cummulativeVol.bid).toEqual(0);
    expect(orderbookData[10].cummulativeVol.ask).toEqual(390);
    expect(orderbookData[10].cummulativeVol.bid).toEqual(579);
    expect(orderbookData[orderbookData.length - 1].cummulativeVol.bid).toEqual(
      4950
    );
    expect(orderbookData[orderbookData.length - 1].cummulativeVol.ask).toEqual(
      0
    );
  });
  it('stores volume by level', () => {
    const orderbookData = compact(sell, buy, 10);
    expect(orderbookData[0].askVolByLevel).toEqual({
      1095: 5,
      1096: 4,
      1097: 3,
      1098: 2,
      1099: 1,
      1100: 0,
    });
    expect(orderbookData[orderbookData.length - 1].bidVolByLevel).toEqual({
      901: 0,
      902: 1,
      903: 2,
      904: 3,
    });
  });

  it('updates relative data', () => {
    const orderbookData = compact(sell, buy, 10);
    expect(orderbookData[0].cummulativeVol.relativeAsk).toEqual('100%');
    expect(orderbookData[0].cummulativeVol.relativeBid).toEqual('0%');
    expect(orderbookData[0].relativeAskVol).toEqual('2%');
    expect(orderbookData[0].relativeBidVol).toEqual('0%');
    expect(orderbookData[10].cummulativeVol.relativeAsk).toEqual('8%');
    expect(orderbookData[10].cummulativeVol.relativeBid).toEqual('12%');
    expect(orderbookData[10].relativeAskVol).toEqual('44%');
    expect(orderbookData[10].relativeBidVol).toEqual('66%');
    expect(orderbookData[orderbookData.length - 1].relativeAskVol).toEqual(
      '0%'
    );
    expect(orderbookData[orderbookData.length - 1].relativeBidVol).toEqual(
      '1%'
    );
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
    expect(updateLevels(null, [removeFirstRow])).toEqual(null);
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
    expect(updateLevels(null, [updateLastRow])).toEqual([updateLastRow]);
  });
});

describe('updateCompactedData', () => {
  const orderbookData: OrderbookData[] = [
    {
      price: 120,
      cummulativeVol: {
        ask: 50,
        relativeAsk: '100%',
        bid: 0,
        relativeBid: '0%',
      },
      askVolByLevel: {
        '121': 10,
      },
      bidVolByLevel: {},
      askVol: 10,
      bidVol: 0,
      relativeAskVol: '25%',
      relativeBidVol: '0%',
    },
    {
      price: 100,
      cummulativeVol: {
        ask: 40,
        relativeAsk: '80%',
        bid: 40,
        relativeBid: '80%',
      },
      askVolByLevel: {
        '101': 10,
        '102': 30,
      },
      bidVolByLevel: {
        '99': 10,
        '98': 30,
      },
      askVol: 40,
      bidVol: 40,
      relativeAskVol: '100%',
      relativeBidVol: '100%',
    },
    {
      price: 80,
      cummulativeVol: {
        ask: 0,
        relativeAsk: '0%',
        bid: 50,
        relativeBid: '100%',
      },
      askVolByLevel: {},
      bidVolByLevel: {
        '79': 10,
      },
      askVol: 0,
      bidVol: 10,
      relativeAskVol: '0%',
      relativeBidVol: '25%',
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
    expect(updatedData[0].askVol).toEqual(20);
    expect(updatedData[0].askVolByLevel?.[120]).toEqual(10);
    expect(updatedData[0].cummulativeVol.ask).toEqual(60);
    expect(updatedData[2].bidVol).toEqual(20);
    expect(updatedData[2].bidVolByLevel?.[80]).toEqual(10);
    expect(updatedData[2].cummulativeVol.bid).toEqual(60);
  });

  it('remove row', () => {
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
    expect(updatedData.length).toEqual(1);
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
    expect(updatedData.length).toEqual(5);
    expect(updatedData[0].price).toEqual(130);
    expect(updatedData[0].cummulativeVol.ask).toEqual(55);
    expect(updatedData[4].price).toEqual(60);
    expect(updatedData[4].cummulativeVol.bid).toEqual(55);
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
    expect(updatedData[1].price).toEqual(110);
    expect(updatedData[1].cummulativeVol.ask).toEqual(45);
    expect(updatedData[0].cummulativeVol.ask).toEqual(55);
    expect(updatedData[3].price).toEqual(90);
    expect(updatedData[3].cummulativeVol.bid).toEqual(45);
    expect(updatedData[4].cummulativeVol.bid).toEqual(55);
  });
});
