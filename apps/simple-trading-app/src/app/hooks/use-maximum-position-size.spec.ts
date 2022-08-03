import { renderHook } from '@testing-library/react-hooks';
import useMaximumPositionSize from './use-maximum-position-size';
import type { PartyBalanceQuery_party_accounts } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import { AccountType } from '@vegaprotocol/types';
import type { PositionMargin } from './use-market-positions';
import { BigNumber } from 'bignumber.js';
import {
  VegaWalletOrderSide,
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
} from '@vegaprotocol/wallet';

const defaultMockMarketPositions = {
  openVolume: new BigNumber(1),
  balance: new BigNumber(100000),
};

let mockMarketPositions: PositionMargin | null = defaultMockMarketPositions;

const mockAccount: PartyBalanceQuery_party_accounts = {
  __typename: 'Account',
  type: AccountType.General,
  balance: '200000',
  asset: {
    __typename: 'Asset',
    id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    symbol: 'tBTC',
    name: 'tBTC TEST',
    decimals: 5,
  },
};

const mockOrder = {
  type: VegaWalletOrderType.Market,
  size: '1',
  side: VegaWalletOrderSide.Buy,
  timeInForce: VegaWalletOrderTimeInForce.IOC,
};

jest.mock('./use-settlement-account', () => {
  return {
    useSettlementAccount: jest.fn(() => mockAccount),
  };
});
jest.mock('./use-market-positions', () => jest.fn(() => mockMarketPositions));

describe('useMaximumPositionSize Hook', () => {
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
    mockOrder.side = VegaWalletOrderSide.Sell;
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
