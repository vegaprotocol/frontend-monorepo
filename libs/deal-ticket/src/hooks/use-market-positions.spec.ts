import { renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useMarketPositions } from './use-market-positions';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn().mockReturnValue('wallet-pub-key'),
}));
let mockMarketAccountBalance: {
  accountBalance: string;
  accountDecimals: number | null;
} = { accountBalance: '50001000000', accountDecimals: 5 };
jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useMarketAccountBalance: jest.fn(() => mockMarketAccountBalance),
}));

jest.mock('@vegaprotocol/positions', () => ({
  ...jest.requireActual('@vegaprotocol/positions'),
  useMarketPositionOpenVolume: jest.fn(() => '100002'),
}));

describe('useOrderPosition Hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return proper positive value', () => {
    const { result } = renderHook(
      () => useMarketPositions({ marketId: 'marketId' }),
      { wrapper: MockedProvider }
    );
    expect(result.current?.openVolume).toEqual('100002');
    expect(result.current?.balance).toEqual('50001000000');
  });

  it('if balance equal 0 return null', () => {
    mockMarketAccountBalance = { accountBalance: '0', accountDecimals: 5 };
    const { result } = renderHook(
      () => useMarketPositions({ marketId: 'marketId' }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBeNull();
  });

  it('if no markets return null', () => {
    mockMarketAccountBalance = { accountBalance: '', accountDecimals: null };
    const { result } = renderHook(
      () => useMarketPositions({ marketId: 'marketId' }),
      { wrapper: MockedProvider }
    );
    expect(result.current).toBeNull();
  });
});
