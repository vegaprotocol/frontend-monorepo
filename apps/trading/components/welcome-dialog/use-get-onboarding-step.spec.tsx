import { renderHook } from '@testing-library/react';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import { positionsDataProvider } from '@vegaprotocol/positions';
import * as walletHooks from '@vegaprotocol/wallet-react';

// TODO: review these tests and use MockedWalletProvider

jest.mock('@vegaprotocol/wallet-react');

// @ts-ignore type wrong after mock
walletHooks.useVegaWallet.mockReturnValue({
  pubKey: 'my-pubkey',
});

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

  it('should return properly ONBOARDING_UNKNOWN_STEP', () => {
    mockData = null;
    const { result } = renderHook(() => useGetOnboardingStep());
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_UNKNOWN_STEP);
  });

  it('should return properly ONBOARDING_CONNECT_STEP', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: null,
    });
    const { result } = renderHook(() => useGetOnboardingStep());
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_CONNECT_STEP);
  });

  it('should return properly ONBOARDING_DEPOSIT_STEP', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: 'my-key',
    });
    const { result } = renderHook(() => useGetOnboardingStep());
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_DEPOSIT_STEP);
  });

  it('should return properly ONBOARDING_ORDER_STEP', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: 'my-key',
    });
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
    const { result } = renderHook(() => useGetOnboardingStep());
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_ORDER_STEP);
  });

  it('should return properly ONBOARDING_COMPLETE_STEP', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: 'my-key',
    });
    mockData = [{ id: 'item-id' }];
    (useDataProvider as jest.Mock).mockImplementation(() => {
      return { data: mockData };
    });
    const { result } = renderHook(() => useGetOnboardingStep());
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_COMPLETE_STEP);
  });
});
