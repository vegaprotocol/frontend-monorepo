import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import {
  MarketDepthDocument,
  type MarketDepthQuery,
  type MarketDepthQueryVariables,
  MarketDepthUpdateDocument,
} from '@vegaprotocol/market-depth';
import { OrderType, type PriceLevel, Side } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { calcSlippage, useSlippage } from './use-slippage';
import BigNumber from 'bignumber.js';

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
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('1'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '100',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('2'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5',
        weightedAveragePrice: '105',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('3'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '10',
        weightedAveragePrice: '110',
      });
    });

    it('short', () => {
      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('1'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '90',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('2'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5.555555555555555556',
        weightedAveragePrice: '85',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('3'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '11.111111111111111111',
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
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('20'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5',
        weightedAveragePrice: '105',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('30'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '10',
        weightedAveragePrice: '110',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          size: new BigNumber('25'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '8',
        slippagePct: '8',
        weightedAveragePrice: '108',
      });
    });

    it('short', () => {
      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('1'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '90',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('11'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '0.90909090909090909091',
        slippagePct: '1.010101010101010101',
        weightedAveragePrice: '89.09090909090909090909',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_SELL,
          price: new BigNumber('90'),
          size: new BigNumber('100'),
          priceLevels: data.market.depth.buy,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '9',
        slippagePct: '10',
        weightedAveragePrice: '81',
      });
    });
  });

  describe('limit', () => {
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

    it('works', () => {
      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          limitPrice: new BigNumber('120'),
          size: new BigNumber('3'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '10',
        weightedAveragePrice: '110',
        totalVolume: '3',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_BUY,
          price: new BigNumber('100'),
          limitPrice: new BigNumber('110'),
          size: new BigNumber('3'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5',
        weightedAveragePrice: '105',
        totalVolume: '2',
      });

      expect(
        calcSlippage({
          side: Side.SIDE_SELL, // Deliberate wrong side of book totalVol should be 0
          price: new BigNumber('100'),
          limitPrice: new BigNumber('110'),
          size: new BigNumber('3'),
          priceLevels: data.market.depth.sell,
          marketDecimals: 0,
          positionDecimals: 0,
        })
      ).toMatchObject({
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '0',
        totalVolume: '0',
      });
    });
  });
});

describe('useSlippage', () => {
  const setup = (
    marketId: string,
    order: Parameters<typeof useSlippage>[0],
    book: { sell: PriceLevel[]; buy: PriceLevel[] }
  ) => {
    const mock: MockedResponse<MarketDepthQuery, MarketDepthQueryVariables> = {
      request: {
        query: MarketDepthDocument,
        variables: { marketId },
      },
      result: {
        data: {
          market: {
            __typename: 'Market',
            id: marketId,
            depth: {
              __typename: 'MarketDepth',
              buy: book.buy,
              sell: book.sell,
              sequenceNumber: '1',
            },
          },
        },
      },
    };

    const mockSub = {
      request: {
        query: MarketDepthUpdateDocument,
        variables: { marketId },
      },
      result: undefined,
    };

    return renderHook(
      () =>
        useSlippage(order, {
          id: marketId,
          decimalPlaces: 0,
          positionDecimalPlaces: 0,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider
            cache={
              new InMemoryCache({
                typePolicies: {
                  Market: { keyFields: false },
                  PriceLevel: {
                    keyFields: false,
                  },
                },
              })
            }
            mocks={[mock, mockSub]}
          >
            {children}
          </MockedProvider>
        ),
      }
    );
  };

  it('returns slippage for buy order', async () => {
    const marketId = 'market-id';
    const { result } = setup(
      marketId,
      {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_BUY,
        size: '1',
      },
      data.market.depth
    );

    await waitFor(() => {
      expect(result.current).toMatchObject({
        slippage: '5',
        slippagePct: '5.263157894736842105',
        weightedAveragePrice: '100',
        totalVolume: '1',
      });
    });
  });

  it('returns slippage for sell order', async () => {
    const marketId = 'market-id';
    const { result } = setup(
      marketId,
      {
        type: OrderType.TYPE_MARKET,
        side: Side.SIDE_SELL,
        size: '1',
      },
      data.market.depth
    );

    await waitFor(() => {
      expect(result.current).toMatchObject({
        slippage: '5',
        slippagePct: '5.263157894736842105',
        weightedAveragePrice: '90',
        totalVolume: '1',
      });
    });
  });
});
