import { useEffect, useState } from 'react';
import { isBrowserWalletInstalled, useVegaWallet } from '@vegaprotocol/wallet';
import { depositsProvider } from '@vegaprotocol/deposits';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import * as Types from '@vegaprotocol/types';
import { aggregatedAccountsDataProvider } from '@vegaprotocol/accounts';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { useGlobalStore } from '../../stores';

export enum OnboardingStep {
  ONBOARDING_UNKNOWN_STEP,
  ONBOARDING_WALLET_STEP,
  ONBOARDING_CONNECT_STEP,
  ONBOARDING_DEPOSIT_STEP,
  ONBOARDING_ORDER_STEP,
  ONBOARDING_COMPLETE_STEP,
}

export const useGetOnboardingStep = () => {
  const [isLoading, setIsLoading] = useState(true);
  const connecting = useGlobalStore((store) => store.eagerConnecting);
  const { pubKey = '', pubKeys } = useVegaWallet();
  const { data: depositsData } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { data: collateralData } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const collaterals = Boolean(collateralData?.length);
  const deposits =
    depositsData?.some(
      (item) => item.status === Types.DepositStatus.STATUS_FINALIZED
    ) || false;
  const { data: ordersData } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
  });
  const orders = Boolean(ordersData?.length);

  const partyIds = pubKeys?.map((item) => item.publicKey) || [];
  const { data: positionsData } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables: {
      partyIds,
    },
    skip: !partyIds?.length,
  });
  const positions = Boolean(positionsData?.length);
  useEffect(() => {
    const value = Boolean(
      (connecting || pubKey) &&
        (depositsData === null ||
          ordersData === null ||
          collateralData === null ||
          positionsData === null)
    );
    setIsLoading(value);
  }, [
    pubKey,
    depositsData,
    ordersData,
    collateralData,
    positionsData,
    connecting,
  ]);

  if (isLoading) {
    return OnboardingStep.ONBOARDING_UNKNOWN_STEP;
  }
  if (!isBrowserWalletInstalled()) {
    return OnboardingStep.ONBOARDING_WALLET_STEP;
  }
  if (!pubKey) {
    return OnboardingStep.ONBOARDING_CONNECT_STEP;
  }
  if (!deposits && !collaterals) {
    return OnboardingStep.ONBOARDING_DEPOSIT_STEP;
  }
  if (!orders && !positions) {
    return OnboardingStep.ONBOARDING_ORDER_STEP;
  }
  return OnboardingStep.ONBOARDING_COMPLETE_STEP;
};
