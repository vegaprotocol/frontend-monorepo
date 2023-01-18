import { renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { useOrderCloseOut } from './use-order-closeout';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn().mockReturnValue('wallet-pub-key'),
}));
let mockMarketMargin: string | undefined = undefined;
jest.mock('@vegaprotocol/positions', () => ({
  ...jest.requireActual('@vegaprotocol/positions'),
  useMarketMargin: () => mockMarketMargin,
}));

describe('useOrderCloseOut', () => {
  const order = { size: '2', side: 'SIDE_BUY' };
  const market = {
    decimalPlaces: 5,
    depth: {
      lastTrade: {
        price: '1000000',
      },
    },
    tradableInstrument: {
      instrument: {
        product: {
          settlementAsset: {
            id: 'assetId',
          },
        },
      },
    },
    data: {
      markPrice: 100000,
    },
  } as unknown as MarketDealTicket;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return proper null value', () => {
    mockMarketMargin = '-1';
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: order as OrderSubmissionBody['orderSubmission'],
          market: { ...market, data: { ...market.data, markPrice: '0' } },
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toEqual(null);
  });

  it('should return proper sell value', () => {
    mockMarketMargin = '0';
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: {
            ...order,
            side: 'SIDE_SELL',
          } as OrderSubmissionBody['orderSubmission'],
          market: market,
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toEqual('1');
  });

  it('should return proper sell value on limit order', () => {
    mockMarketMargin = '0';
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: {
            ...order,
            price: '1000000',
            type: 'TYPE_LIMIT',
            side: 'SIDE_SELL',
          } as OrderSubmissionBody['orderSubmission'],
          market: market,
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toEqual('1000000');
  });

  it('should return proper empty value', () => {
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: {
            ...order,
            side: 'SIDE_SELL',
          } as OrderSubmissionBody['orderSubmission'],
          market: { ...market, data: { ...market.data, markPrice: '0' } },
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toEqual('0');
  });
});
