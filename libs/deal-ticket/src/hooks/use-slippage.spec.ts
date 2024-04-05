import { OrderType, Side } from '@vegaprotocol/types';
import { calcSlippage, useSlippage } from './use-slippage';

const data = {
  market: {
    depth: {
      sell: [
        {
          price: '100',
          numberOfOrders: '1',
          volume: '1',
        },
        {
          price: '110',
          numberOfOrders: '1',
          volume: '1',
        },
        {
          price: '120',
          numberOfOrders: '1',
          volume: '1',
        },
      ],
      buy: [
        {
          price: '90',
          numberOfOrders: '1',
          volume: '1',
        },
        {
          price: '80',
          numberOfOrders: '1',
          volume: '1',
        },
        {
          price: '70',
          numberOfOrders: '1',
          volume: '1',
        },
      ],
    },
  },
};

describe('calcSlippage', () => {
  describe('basic', () => {
    it('long', () => {
      expect(
        calcSlippage({
          price: '100',
          size: '1',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '0',
        weightedAveragePrice: '100',
      });

      expect(
        calcSlippage({
          price: '100',
          size: '2',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '5',
        weightedAveragePrice: '105',
      });

      expect(
        calcSlippage({
          price: '100',
          size: '3',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '10',
        weightedAveragePrice: '110',
      });
    });

    it('short', () => {
      expect(
        calcSlippage({
          price: '90',
          size: '1',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '0',
        weightedAveragePrice: '90',
      });

      expect(
        calcSlippage({
          price: '90',
          size: '2',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '-5',
        weightedAveragePrice: '85',
      });

      expect(
        calcSlippage({
          price: '90',
          size: '3',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '-10',
        weightedAveragePrice: '80',
      });
    });
  });

  describe('more volume', () => {
    const data = {
      market: {
        depth: {
          sell: [
            {
              price: '100',
              numberOfOrders: '1',
              volume: '10',
            },
            {
              price: '110',
              numberOfOrders: '1',
              volume: '10',
            },
            {
              price: '120',
              numberOfOrders: '1',
              volume: '10',
            },
          ],
          buy: [
            {
              price: '90',
              numberOfOrders: '1',
              volume: '10',
            },
            {
              price: '80',
              numberOfOrders: '1',
              volume: '100',
            },
            {
              price: '70',
              numberOfOrders: '1',
              volume: '1',
            },
          ],
        },
      },
    };

    it('long', () => {
      expect(
        calcSlippage({
          price: '100',
          size: '20',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({ slippage: '5', weightedAveragePrice: '105' });

      expect(
        calcSlippage({
          price: '100',
          size: '30',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({ slippage: '10', weightedAveragePrice: '110' });

      expect(
        calcSlippage({
          price: '100',
          size: '25',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({ slippage: '8', weightedAveragePrice: '108' });
    });

    it('short', () => {
      expect(
        calcSlippage({
          price: '90',
          size: '1',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({ slippage: '0' });

      expect(
        calcSlippage({
          price: '90',
          size: '11',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '-0.90909090909090909091',
        weightedAveragePrice: '89.09090909090909090909',
      });

      expect(
        calcSlippage({
          price: '90',
          size: '100',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({ slippage: '-9' });
    });
  });
});

describe('useSlippage', () => {
  it('uses the correct side of the book', () => {
    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '1',
      })
    ).toMatchObject({
      slippage: '0',
      weightedAveragePrice: '100',
    });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '1',
      })
    ).toMatchObject({
      slippage: '0',
      weightedAveragePrice: '90',
    });
  });
});
