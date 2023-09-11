import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import { positionsDataProvider } from '@vegaprotocol/positions';

let mockData: object[] | null = [{ id: 'item-id' }];
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn(() => ({ data: mockData })),
}));

let mockContext: Partial<VegaWalletContextShape> = { pubKey: 'test-pubkey' };

describe('useGetOnboardingStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData = [];
    mockContext = { pubKey: 'test-pubkey' };
    globalThis.window.vega = {} as Vega;
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletContext.Provider
      value={mockContext as unknown as VegaWalletContextShape}
    >
      {children}
    </VegaWalletContext.Provider>
  );

  it('should return properly ONBOARDING_UNKNOWN_STEP', () => {
    mockData = null;
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_UNKNOWN_STEP);
  });

  it('should return properly ONBOARDING_WALLET_STEP', () => {
    mockContext = { pubKey: null };
    // @ts-ignore test only purpose
    globalThis.window.vega = undefined;
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_WALLET_STEP);
  });

  it('should return properly ONBOARDING_CONNECT_STEP', () => {
    mockContext = { pubKey: null };
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_CONNECT_STEP);
  });

  it('should return properly ONBOARDING_DEPOSIT_STEP', async () => {
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    await expect(result.current).toEqual(
      OnboardingStep.ONBOARDING_DEPOSIT_STEP
    );
  });

  it('should return properly ONBOARDING_ORDER_STEP', async () => {
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
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    await expect(result.current).toEqual(OnboardingStep.ONBOARDING_ORDER_STEP);
  });

  it('should return properly ONBOARDING_COMPLETE_STEP', async () => {
    mockData = [{ id: 'item-id' }];
    (useDataProvider as jest.Mock).mockImplementation(() => {
      return { data: mockData };
    });
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    await expect(result.current).toEqual(
      OnboardingStep.ONBOARDING_COMPLETE_STEP
    );
  });
});
