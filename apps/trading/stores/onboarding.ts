import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ONBOARDING_STORAGE_KEY = 'vega_onboarding';

export type RiskStatus = 'pending' | 'accepted' | 'rejected';
export type OnboardingDialog = 'inactive' | 'intro' | 'risk' | 'connect';

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
        set({ risk: 'accepted' });
      },
      rejectRisk: () => {
        set({ risk: 'rejected' });
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
