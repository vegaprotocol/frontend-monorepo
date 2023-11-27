import * as router from 'react-router';
import { useNavigateToLastMarket } from './use-navigate-to-last-market';
import { useGlobalStore } from '../../stores';
import { renderHook } from '@testing-library/react';
import { useTopTradedMarkets } from './use-top-traded-markets';
import { Links } from '../links';

const mockLastMarketId = 'LAST';

jest.mock('../../stores', () => {
  const original = jest.requireActual('../../stores');
  return {
    ...original,
    useGlobalStore: jest.fn(),
  };
});

jest.mock('./use-top-traded-markets', () => {
  return {
    useTopTradedMarkets: jest.fn(),
  };
});

describe('useNavigateToLastMarket', () => {
  const navigate = jest.fn();
  beforeAll(() => {
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
  });

  it('navigates to the last market when it is active', () => {
    (useGlobalStore as unknown as jest.Mock).mockReturnValue(mockLastMarketId);
    (useTopTradedMarkets as jest.Mock).mockReturnValue({
      data: [{ id: mockLastMarketId }],
    });
    renderHook(() => useNavigateToLastMarket());
    expect(navigate).toHaveBeenCalledWith(Links.MARKET(mockLastMarketId), {
      replace: true,
    });
  });

  it('navigates to the top traded market if the last one is not active', () => {
    (useGlobalStore as unknown as jest.Mock).mockReturnValue(mockLastMarketId);
    (useTopTradedMarkets as jest.Mock).mockReturnValue({
      data: [{ id: 'TOP' }],
    });
    renderHook(() => useNavigateToLastMarket());
    expect(navigate).toHaveBeenCalledWith(Links.MARKET('TOP'), {
      replace: true,
    });
  });

  it('navigates to the list of markets when all of the markets are not active', () => {
    (useGlobalStore as unknown as jest.Mock).mockReturnValue(mockLastMarketId);
    (useTopTradedMarkets as jest.Mock).mockReturnValue({
      data: [],
    });
    renderHook(() => useNavigateToLastMarket());
    expect(navigate).toHaveBeenCalledWith(Links.MARKETS());
  });
});
