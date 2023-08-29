import { useNavigate } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';
import * as constants from '../constants';
import { TelemetryApproval } from './telemetry-approval';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';

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
  const navigate = useNavigate();
  const [telemetryValue, setTelemetryValue, isTelemetryNeeded, closeTelemetry] =
    useTelemetryApproval();
  const [onBoardingViewed] = useLocalStorage(constants.ONBOARDING_VIEWED_KEY);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const currentStep = useGetOnboardingStep();
  const isTelemetryPopupNeeded =
    isTelemetryNeeded &&
    (onBoardingViewed === 'true' ||
      currentStep > OnboardingStep.ONBOARDING_ORDER_STEP);

  const isOnboardingDialogNeeded =
    onBoardingViewed !== 'true' &&
    currentStep &&
    currentStep < OnboardingStep.ONBOARDING_COMPLETE_STEP &&
    !dismissed;
  const marketId = useGlobalStore((store) => store.marketId);

  const onClose = () => {
    if (isTelemetryPopupNeeded) {
      closeTelemetry();
    } else {
      const link = marketId
        ? Links[Routes.MARKET](marketId)
        : Links[Routes.HOME]();
      navigate(link);
      dismiss();
    }
  };
  const title = (
    <span className="font-alpha calt" data-testid="welcome-title">
      {isOnboardingDialogNeeded ? (
        <>
          {t('Console')}{' '}
          <span className="text-vega-clight-100 dark:text-vega-cdark-100">
            {VEGA_ENV}
          </span>
        </>
      ) : isTelemetryPopupNeeded ? (
        t('Improve vega console')
      ) : null}
    </span>
  );

  const content = isOnboardingDialogNeeded ? (
    <WelcomeDialogContent />
  ) : isTelemetryPopupNeeded ? (
    <TelemetryApproval
      telemetryValue={telemetryValue}
      setTelemetryValue={setTelemetryValue}
    />
  ) : null;

  return content ? (
    <Dialog
      open
      title={title}
      size={isTelemetryPopupNeeded ? 'small' : 'medium'}
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      {content}
    </Dialog>
  ) : null;
};
