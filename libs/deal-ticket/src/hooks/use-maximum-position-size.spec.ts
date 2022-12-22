import { renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import * as Schema from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { PositionMargin } from './use-market-positions';
import { useMaximumPositionSize } from './use-maximum-position-size';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn().mockReturnValue('wallet-pub-key'),
}));

let mockAccountBalance: {
  accountBalance: string;
  accountDecimals: number | null;
} = { accountBalance: '200000', accountDecimals: 5 };
jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => mockAccountBalance),
}));

const defaultMockMarketPositions = {
  openVolume: '1',
  balance: '100000',
};

let mockMarketPositions: PositionMargin | null = defaultMockMarketPositions;

const mockOrder: OrderSubmissionBody['orderSubmission'] = {
  type: Schema.OrderType.TYPE_MARKET,
  size: '1',
  side: Schema.Side.SIDE_BUY,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  marketId: 'market-id',
};

jest.mock('./use-market-positions', () => ({
  useMarketPositions: ({
    marketId,
    partyId,
  }: {
    marketId: string;
    partyId: string;
  }) => mockMarketPositions,
}));

describe('useMaximumPositionSize', () => {
  it('should return correct size when no open positions', () => {
    mockMarketPositions = null;
    const price = '50';
    const expected = 4000;
    const { result } = renderHook(
      () =>
        useMaximumPositionSize({
          marketId: '',
          price,
          settlementAssetId: '',
          order: mockOrder,
        }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBe(expected);
  });

  it('should return correct size when open positions and same side', () => {
    const price = '50';
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 3999;
    const { result } = renderHook(
      () =>
        useMaximumPositionSize({
          marketId: '',
          price,
          settlementAssetId: '',
          order: mockOrder,
        }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBe(expected);
  });

  it('should return correct size when open positions and opposite side', () => {
    const price = '50';
    mockOrder.side = Schema.Side.SIDE_SELL;
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 4001;
    const { result } = renderHook(
      () =>
        useMaximumPositionSize({
          marketId: '',
          price,
          settlementAssetId: '',
          order: mockOrder,
        }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBe(expected);
  });

  it('should return zero if no account balance', () => {
    mockAccountBalance = {
      accountBalance: '0',
      accountDecimals: 5,
    };
    const price = '50';
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 0;
    const { result } = renderHook(
      () =>
        useMaximumPositionSize({
          marketId: '',
          price,
          settlementAssetId: '',
          order: mockOrder,
        }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBe(expected);
  });
});
