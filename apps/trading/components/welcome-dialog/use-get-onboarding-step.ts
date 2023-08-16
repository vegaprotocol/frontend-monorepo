import { useCallback, useMemo } from 'react';
import { isBrowserWalletInstalled, useVegaWallet } from '@vegaprotocol/wallet';
import { depositsProvider } from '@vegaprotocol/deposits';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import * as Types from '@vegaprotocol/types';

export enum OnboardingStep {
  ONBOARDING_UNKNOWN_STEP,
  ONBOARDING_WALLET_STEP,
  ONBOARDING_CONNECT_STEP,
  ONBOARDING_DEPOSIT_STEP,
  ONBOARDING_ORDER_STEP,
  ONBOARDING_COMPLETE_STEP,
}

export const useGetOnboardingStep = () => {
  const { pubKey = '' } = useVegaWallet();
  const { data: depositsData } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey },
    skip: !pubKey,
  });
  const deposits = depositsData?.some(
    (item) => item.status === Types.DepositStatus.STATUS_FINALIZED
  );
  const { data: ordersData } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables: {
      partyId: pubKey,
    },
    skip: !pubKey,
  });
  const orders = Boolean(ordersData?.length);
  const resolveOnBoardingState = useCallback(
    (pubKey?: string, deposits?: boolean, orders?: boolean) => {
      if (!pubKey && !isBrowserWalletInstalled()) {
        return OnboardingStep.ONBOARDING_WALLET_STEP;
      }
      if (!pubKey) {
        return OnboardingStep.ONBOARDING_CONNECT_STEP;
      }
      if (!deposits) {
        return OnboardingStep.ONBOARDING_DEPOSIT_STEP;
      }
      if (!orders) {
        return OnboardingStep.ONBOARDING_ORDER_STEP;
      }
      return OnboardingStep.ONBOARDING_COMPLETE_STEP;
    },
    []
  );
  const result = useMemo(
    () => resolveOnBoardingState(pubKey, deposits, orders),
    [resolveOnBoardingState, pubKey, deposits, orders]
  );
  if (depositsData === null || ordersData === null) {
    // prevent a bad result before the data loads
    return OnboardingStep.ONBOARDING_UNKNOWN_STEP;
  }
  return result;
};
