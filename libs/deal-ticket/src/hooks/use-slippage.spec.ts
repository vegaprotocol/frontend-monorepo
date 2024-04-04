import { OrderType, Side } from '@vegaprotocol/types';
import { useSlippage } from './use-slippage';

describe('useSlippage', () => {
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

  it('long', () => {
    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '1',
      })
    ).toEqual({ slippage: '0' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '2',
      })
    ).toEqual({ slippage: '5' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '3',
      })
    ).toEqual({ slippage: '10' });
  });

  it('short', () => {
    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '1',
      })
    ).toEqual({ slippage: '0' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '2',
      })
    ).toEqual({ slippage: '-5' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '3',
      })
    ).toEqual({ slippage: '-10' });
  });
});

describe('useSlippage more volume', () => {
  const data = {
    market: {
      depth: {
        sell: [
          {
            price: '100',
            numberOfOrders: '1',
            volume: '2',
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
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '1',
      })
    ).toEqual({ slippage: '0' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '2',
      })
    ).toEqual({ slippage: '0' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '3',
      })
    ).toEqual({ slippage: '3' });
  });

  it('short', () => {
    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '1',
      })
    ).toEqual({ slippage: '0' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '11',
      })
    ).toEqual({ slippage: '-10' });

    expect(
      useSlippage(data.market.depth, {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '100',
      })
    ).toEqual({ slippage: '-10' });
  });
});

const data3 = {
  market: {
    depth: {
      sell: [
        {
          price: '700013',
          numberOfOrders: '1',
          volume: '100',
        },
        {
          price: '700023',
          numberOfOrders: '1',
          volume: '117',
        },
        {
          price: '700033',
          numberOfOrders: '1',
          volume: '136',
        },
        {
          price: '700043',
          numberOfOrders: '1',
          volume: '158',
        },
        {
          price: '700053',
          numberOfOrders: '1',
          volume: '183',
        },
        {
          price: '700063',
          numberOfOrders: '1',
          volume: '213',
        },
        {
          price: '700073',
          numberOfOrders: '1',
          volume: '246',
        },
        {
          price: '700083',
          numberOfOrders: '1',
          volume: '286',
        },
        {
          price: '700093',
          numberOfOrders: '1',
          volume: '332',
        },
        {
          price: '700103',
          numberOfOrders: '1',
          volume: '386',
        },
        {
          price: '700113',
          numberOfOrders: '1',
          volume: '449',
        },
        {
          price: '700123',
          numberOfOrders: '1',
          volume: '521',
        },
        {
          price: '700133',
          numberOfOrders: '1',
          volume: '606',
        },
        {
          price: '700143',
          numberOfOrders: '1',
          volume: '704',
        },
        {
          price: '700153',
          numberOfOrders: '1',
          volume: '818',
        },
        {
          price: '700163',
          numberOfOrders: '1',
          volume: '950',
        },
        {
          price: '700173',
          numberOfOrders: '1',
          volume: '1104',
        },
        {
          price: '700183',
          numberOfOrders: '1',
          volume: '1283',
        },
        {
          price: '700193',
          numberOfOrders: '1',
          volume: '1490',
        },
        {
          price: '700203',
          numberOfOrders: '1',
          volume: '1732',
        },
        {
          price: '700213',
          numberOfOrders: '1',
          volume: '2012',
        },
        {
          price: '700223',
          numberOfOrders: '1',
          volume: '2338',
        },
        {
          price: '700233',
          numberOfOrders: '1',
          volume: '2716',
        },
        {
          price: '700243',
          numberOfOrders: '1',
          volume: '3156',
        },
        {
          price: '700253',
          numberOfOrders: '1',
          volume: '3667',
        },
      ],
      buy: [
        {
          price: '699916',
          numberOfOrders: '1',
          volume: '110',
        },
        {
          price: '699906',
          numberOfOrders: '1',
          volume: '183',
        },
        {
          price: '699896',
          numberOfOrders: '1',
          volume: '213',
        },
        {
          price: '699886',
          numberOfOrders: '1',
          volume: '247',
        },
        {
          price: '699876',
          numberOfOrders: '1',
          volume: '287',
        },
        {
          price: '699866',
          numberOfOrders: '1',
          volume: '333',
        },
        {
          price: '699856',
          numberOfOrders: '1',
          volume: '387',
        },
        {
          price: '699846',
          numberOfOrders: '1',
          volume: '450',
        },
        {
          price: '699836',
          numberOfOrders: '1',
          volume: '523',
        },
        {
          price: '699826',
          numberOfOrders: '1',
          volume: '607',
        },
        {
          price: '699816',
          numberOfOrders: '1',
          volume: '705',
        },
        {
          price: '699806',
          numberOfOrders: '1',
          volume: '819',
        },
        {
          price: '699796',
          numberOfOrders: '1',
          volume: '952',
        },
        {
          price: '699786',
          numberOfOrders: '1',
          volume: '1106',
        },
        {
          price: '699776',
          numberOfOrders: '1',
          volume: '1285',
        },
        {
          price: '699766',
          numberOfOrders: '1',
          volume: '1492',
        },
        {
          price: '699756',
          numberOfOrders: '1',
          volume: '1734',
        },
        {
          price: '699746',
          numberOfOrders: '1',
          volume: '2014',
        },
        {
          price: '699736',
          numberOfOrders: '1',
          volume: '2340',
        },
        {
          price: '699726',
          numberOfOrders: '1',
          volume: '2719',
        },
        {
          price: '699716',
          numberOfOrders: '1',
          volume: '3159',
        },
        {
          price: '699706',
          numberOfOrders: '1',
          volume: '3669',
        },
        {
          price: '685226',
          numberOfOrders: '1',
          volume: '41720',
        },
        {
          price: '10',
          numberOfOrders: '1',
          volume: '10000',
        },
        {
          price: '1',
          numberOfOrders: '28',
          volume: '280',
        },
      ],
    },
  },
};
