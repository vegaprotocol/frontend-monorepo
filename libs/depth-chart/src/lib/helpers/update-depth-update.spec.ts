import { updateDepthUpdate } from './update-depth-update';

describe('updateDepthUpdate', () => {
  it('Updates typical case', () => {
    const prev = createMarketDepth([{ price: '100', volume: '10' }], null);
    const update = createMarketDepthUpdate(
      [{ price: '200', volume: '20' }],
      null
    );

    const expected = createMarketDepth(
      [
        { price: '200', volume: '20' },
        { price: '100', volume: '10' },
      ],
      []
    );

    expect(updateDepthUpdate(prev, update)).toEqual(expected);
  });

  it('Removes price level', () => {
    const prev = createMarketDepth(
      [
        { price: '200', volume: '20' },
        { price: '100', volume: '10' },
      ],
      null
    );

    const update = createMarketDepthUpdate(
      [{ price: '200', volume: '0' }],
      null
    );

    const expected = createMarketDepth([{ price: '100', volume: '10' }], []);

    expect(updateDepthUpdate(prev, update)).toEqual(expected);
  });
});

function createMarketDepth(
  buy: { price: string; volume: string }[] | null,
  sell: { price: string; volume: string }[] | null
) {
  return {
    market: {
      __typename: 'Market' as const,
      id: 'id',
      decimalPlaces: 0,
      data: { __typename: 'MarketData' as const, midPrice: '100' },
      depth: {
        __typename: 'MarketDepth' as const,
        lastTrade: { __typename: 'Trade' as const, price: '100' },
        sell: sell
          ? sell.map((priceLevel) => ({
              __typename: 'PriceLevel' as const,
              price: priceLevel.price,
              volume: priceLevel.volume,
              numberOfOrders: '20',
            }))
          : null,
        buy: buy
          ? buy.map((priceLevel) => ({
              __typename: 'PriceLevel' as const,
              price: priceLevel.price,
              volume: priceLevel.volume,
              numberOfOrders: '20',
            }))
          : null,
        sequenceNumber: '0',
      },
    },
  };
}

function createMarketDepthUpdate(
  buy: { price: string; volume: string }[] | null,
  sell: { price: string; volume: string }[] | null
) {
  return {
    data: {
      marketDepthUpdate: {
        __typename: 'MarketDepthUpdate' as const,
        market: {
          __typename: 'Market' as const,
          id: 'id',
          data: { __typename: 'MarketData' as const, midPrice: '100' },
        },
        sell: sell
          ? sell.map((priceLevel) => ({
              __typename: 'PriceLevel' as const,
              price: priceLevel.price,
              volume: priceLevel.volume,
              numberOfOrders: '20',
            }))
          : null,
        buy: buy
          ? buy.map((priceLevel) => ({
              __typename: 'PriceLevel' as const,
              price: priceLevel.price,
              volume: priceLevel.volume,
              numberOfOrders: '20',
            }))
          : null,
        sequenceNumber: '1',
      },
    },
  };
}
