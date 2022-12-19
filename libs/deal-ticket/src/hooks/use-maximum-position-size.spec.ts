import { renderHook } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { PositionMargin } from './use-market-positions';
import { useMaximumPositionSize } from './use-maximum-position-size';
import type { AccountFragment as Account } from './__generated__/PartyBalance';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

const defaultMockMarketPositions = {
  openVolume: '1',
  balance: '100000',
};

let mockMarketPositions: PositionMargin | null = defaultMockMarketPositions;

const mockAccount: Account = {
  __typename: 'AccountBalance',
  type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
  balance: '200000',
  asset: {
    __typename: 'Asset',
    id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    symbol: 'tBTC',
    name: 'tBTC TEST',
    decimals: 5,
  },
};

const mockOrder: OrderSubmissionBody['orderSubmission'] = {
  type: Schema.OrderType.TYPE_MARKET,
  size: '1',
  side: Schema.Side.SIDE_BUY,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  marketId: 'market-id',
};

jest.mock('./use-settlement-account', () => {
  return {
    useSettlementAccount: jest.fn(() => mockAccount),
  };
});

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
    const { result } = renderHook(() =>
      useMaximumPositionSize({
        marketId: '',
        partyId: '',
        price,
        settlementAssetId: '',
        order: mockOrder,
        accounts: [mockAccount],
      })
    );
    expect(result.current).toBe(expected);
  });

  it('should return correct size when open positions and same side', () => {
    const price = '50';
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 3999;
    const { result } = renderHook(() =>
      useMaximumPositionSize({
        marketId: '',
        partyId: '',
        price,
        settlementAssetId: '',
        order: mockOrder,
        accounts: [mockAccount],
      })
    );
    expect(result.current).toBe(expected);
  });

  it('should return correct size when open positions and opposite side', () => {
    const price = '50';
    mockOrder.side = Schema.Side.SIDE_SELL;
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 4001;
    const { result } = renderHook(() =>
      useMaximumPositionSize({
        marketId: '',
        partyId: '',
        price,
        settlementAssetId: '',
        order: mockOrder,
        accounts: [mockAccount],
      })
    );
    expect(result.current).toBe(expected);
  });

  it('should return zero if no account balance', () => {
    mockAccount.balance = '0';
    const price = '50';
    mockMarketPositions = defaultMockMarketPositions;
    const expected = 0;
    const { result } = renderHook(() =>
      useMaximumPositionSize({
        marketId: '',
        partyId: '',
        price,
        settlementAssetId: '',
        order: mockOrder,
        accounts: [],
      })
    );
    expect(result.current).toBe(expected);
  });
});
