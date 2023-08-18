import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';

let mockData: object[] | null = null;
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn(() => ({ data: mockData })),
}));

let mockContext: Partial<VegaWalletContextShape> = { pubKey: 'test-pubkey' };

describe('useGetOnboardingStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletContext.Provider
      value={mockContext as unknown as VegaWalletContextShape}
    >
      {children}
    </VegaWalletContext.Provider>
  );

  it('should return proper ONBOARDING_UNKNOWN_STEP', () => {
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_UNKNOWN_STEP);
  });

  it('should return proper ONBOARDING_WALLET_STEP', () => {
    mockData = [{ id: 'item-id' }];
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_WALLET_STEP);
  });

  it('should return proper ONBOARDING_CONNECT_STEP', () => {
    mockData = [{ id: 'item-id' }];
    mockContext = { pubKey: null };
    globalThis.window.vega = {} as Vega;
    const { result } = renderHook(() => useGetOnboardingStep(), { wrapper });
    expect(result.current).toEqual(OnboardingStep.ONBOARDING_CONNECT_STEP);
  });
});
