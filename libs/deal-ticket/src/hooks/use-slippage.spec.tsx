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
        slippagePct: '0',
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
        slippagePct: '5',
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
        slippagePct: '10',
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
        slippagePct: '0',
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
        slippagePct: '-5.555555555555555556',
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
        slippagePct: '-11.111111111111111111',
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
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5',
        weightedAveragePrice: '105',
      });

      expect(
        calcSlippage({
          price: '100',
          size: '30',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '10',
        weightedAveragePrice: '110',
      });

      expect(
        calcSlippage({
          price: '100',
          size: '25',
          priceLevels: data.market.depth.sell,
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
          price: '90',
          size: '1',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '90',
      });

      expect(
        calcSlippage({
          price: '90',
          size: '11',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '-0.90909090909090909091',
        slippagePct: '-1.010101010101010101',
        weightedAveragePrice: '89.09090909090909090909',
      });

      expect(
        calcSlippage({
          price: '90',
          size: '100',
          priceLevels: data.market.depth.buy,
        })
      ).toMatchObject({
        slippage: '-9',
        slippagePct: '-10',
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
          price: '100',
          limitPrice: '120',
          size: '3',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '10',
        slippagePct: '10',
        weightedAveragePrice: '110',
      });

      expect(
        calcSlippage({
          price: '100',
          limitPrice: '110',
          size: '3',
          priceLevels: data.market.depth.sell,
        })
      ).toMatchObject({
        slippage: '5',
        slippagePct: '5',
        weightedAveragePrice: '105',
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

    return renderHook(() => useSlippage(order, marketId), {
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
    });
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
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '100',
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
        slippage: '0',
        slippagePct: '0',
        weightedAveragePrice: '90',
      });
    });
  });
});
