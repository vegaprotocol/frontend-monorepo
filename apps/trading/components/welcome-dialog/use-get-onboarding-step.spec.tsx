import { act, renderHook } from '@testing-library/react';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { MockedWalletProvider, mockConfig } from '@vegaprotocol/wallet-react';

let mockData: object[] | null = [{ id: 'item-id' }];
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn(() => ({ data: mockData })),
}));

describe('useGetOnboardingStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData = [];
    globalThis.window.vega = {} as Vega;
  });

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  const setup = () => {
    return renderHook(() => useGetOnboardingStep(), {
      wrapper: MockedWalletProvider,
    });
  };

  it('should return properly ONBOARDING_UNKNOWN_STEP', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    mockData = null;
    const { result } = setup();
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_UNKNOWN_STEP);
  });

  it('should return properly ONBOARDING_CONNECT_STEP', () => {
    const { result } = setup();
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_CONNECT_STEP);
  });

  it('should return properly ONBOARDING_DEPOSIT_STEP', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    const { result } = setup();
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_DEPOSIT_STEP);
  });

  it('should return properly ONBOARDING_ORDER_STEP', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    mockData = [{ id: 'item-id' }];
    (useDataProvider as jest.Mock).mockImplementation((args) => {
      if (
        args.dataProvider === ordersWithMarketProvider ||
        args.dataProvider === positionsDataProvider
      ) {
        return { data: [] };
      }
      return { data: mockData };
    });
    const { result } = setup();
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_ORDER_STEP);
  });

  it('should return properly ONBOARDING_COMPLETE_STEP', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    mockData = [{ id: 'item-id' }];
    (useDataProvider as jest.Mock).mockImplementation(() => {
      return { data: mockData };
    });
    const { result } = setup();
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_COMPLETE_STEP);
  });
});
