import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { WelcomeDialogContent } from './welcome-dialog-content';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import * as constants from '../constants';

const ONBOARDING_STORAGE_KEY = 'vega_onboarding_dismiss_store';
export const useOnboardingStore = create<{
  dismissed: boolean;
  dismiss: () => void;
}>()(
  persist(
    (set) => ({
      dismissed: false,
      dismiss: () => set(() => ({ dismissed: true })),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
    }
  )
);

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const [onBoardingViewed] = useLocalStorage(constants.ONBOARDING_VIEWED_KEY);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const currentStep = useGetOnboardingStep();

  const isOnboardingDialogNeeded =
    onBoardingViewed !== 'true' &&
    currentStep < OnboardingStep.ONBOARDING_COMPLETE_STEP &&
    !dismissed;

  return (
    <Dialog
      open={isOnboardingDialogNeeded}
      title={
        <span className="font-alpha calt" data-testid="welcome-title">
          {t('Console')}{' '}
          <span className="text-vega-clight-100 dark:text-vega-cdark-100">
            {VEGA_ENV}
          </span>
        </span>
      }
      size="medium"
      onChange={() => dismiss()}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      <WelcomeDialogContent />
    </Dialog>
  );
};
