import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { depositsProvider } from '@vegaprotocol/deposits';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '@vegaprotocol/orders';
import * as Types from '@vegaprotocol/types';
import { aggregatedAccountsDataProvider } from '@vegaprotocol/accounts';
import { positionsDataProvider } from '@vegaprotocol/positions';

const ONBOARDING_STORAGE_KEY = 'vega_onboarding';

type RiskStatus = 'pending' | 'accepted' | 'rejected';
type OnboardingDialog = 'inactive' | 'intro' | 'risk' | 'connect';

export const useOnboardingStore = create<{
  dialog: OnboardingDialog;
  dismissed: boolean;
  dismiss: () => void;
  setDialog: (step: OnboardingDialog) => void;
  risk: RiskStatus;
  acceptRisk: () => void;
  rejectRisk: () => void;
}>()(
  persist(
    (set) => ({
      dialog: 'inactive',
      dismissed: false,
      dismiss: () => set({ dismissed: true }),
      setDialog: (step) => set({ dialog: step }),
      risk: 'pending',
      acceptRisk: () => {
        set({ risk: 'accepted', dialog: 'connect' });
      },
      rejectRisk: () => {
        set({ risk: 'rejected', dialog: 'intro' });
      },
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      partialize: (state) => ({
        dismissed: state.dismissed,
        risk: state.risk,
      }),
    }
  )
);

export enum OnboardingStep {
  ONBOARDING_UNKNOWN_STEP,
  ONBOARDING_WALLET_STEP,
  ONBOARDING_CONNECT_STEP,
  ONBOARDING_DEPOSIT_STEP,
  ONBOARDING_ORDER_STEP,
  ONBOARDING_COMPLETE_STEP,
}

export const useGetOnboardingStep = () => {
  // const connecting = useGlobalStore((store) => store.eagerConnecting);
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
      pagination: {
        first: 1,
      },
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

  const isLoading = Boolean(
    pubKey &&
      (depositsData === null ||
        ordersData === null ||
        collateralData === null ||
        positionsData === null)
  );
  let step = OnboardingStep.ONBOARDING_UNKNOWN_STEP;
  if (isLoading) {
    return step;
  }
  if (!pubKey) {
    step = OnboardingStep.ONBOARDING_CONNECT_STEP;
  }
  if (pubKey) {
    step = OnboardingStep.ONBOARDING_DEPOSIT_STEP;
  }
  if (pubKey && (deposits || collaterals)) {
    step = OnboardingStep.ONBOARDING_ORDER_STEP;
  }
  if (pubKey && (orders || positions)) {
    step = OnboardingStep.ONBOARDING_COMPLETE_STEP;
  }
  return step;
};
