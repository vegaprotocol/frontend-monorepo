import { compact, updateLevels } from './orderbook-data';
import type { MarketDepth_market_depth_sell } from './__generated__/MarketDepth';
import type { MarketDepthSubscription_marketDepthUpdate_sell } from './__generated__/MarketDepthSubscription';

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

  it('counts relative data', () => {
    const orderbookData = compact(sell, buy, 10);
    expect(orderbookData[0].cummulativeVol.relativeAsk).toEqual(1);
    expect(orderbookData[0].cummulativeVol.relativeBid).toEqual(0);
    expect(orderbookData[0].relativeAskVol).toEqual(15 / 905);
    expect(orderbookData[0].relativeBidVol).toEqual(0);
    expect(orderbookData[10].cummulativeVol.relativeAsk).toEqual(390 / 4950);
    expect(orderbookData[10].cummulativeVol.relativeBid).toEqual(579 / 4950);
    expect(orderbookData[10].relativeAskVol).toEqual(390 / 905);
    expect(orderbookData[10].relativeBidVol).toEqual(579 / 885);
    expect(orderbookData[orderbookData.length - 1].relativeAskVol).toEqual(0);
    expect(orderbookData[orderbookData.length - 1].relativeBidVol).toEqual(
      6 / 885
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
