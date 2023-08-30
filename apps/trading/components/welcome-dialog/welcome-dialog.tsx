import { useNavigate } from 'react-router-dom';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Dialog, Intent, useToasts } from '@vegaprotocol/ui-toolkit';
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
import { useCallback } from 'react';

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

const TELEMETRY_APPROVAL_TOAST_ID = 'telemetry_tost_id';
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

  const [setToast, hasToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.remove,
  ]);
  const onApprovalClose = useCallback(() => {
    closeTelemetry();
    removeToast(TELEMETRY_APPROVAL_TOAST_ID);
  }, [removeToast, closeTelemetry]);

  const setTelemetryApprovalAndClose = useCallback(
    (value: string) => {
      setTelemetryValue(value);
      onApprovalClose();
    },
    [setTelemetryValue, onApprovalClose]
  );

  if (isTelemetryPopupNeeded) {
    const toast: Toast = {
      id: TELEMETRY_APPROVAL_TOAST_ID,
      intent: Intent.Warning,
      content: (
        <>
          <h3 className="text-sm uppercase mb-1">
            {t('Improve vega console')}
          </h3>
          <TelemetryApproval
            telemetryValue={telemetryValue}
            setTelemetryValue={setTelemetryApprovalAndClose}
          />
        </>
      ),
      onClose: onApprovalClose,
    };
    if (!hasToast(TELEMETRY_APPROVAL_TOAST_ID)) {
      setToast(toast);
    }
    return;
  }

  const title = (
    <span className="font-alpha calt" data-testid="welcome-title">
      {t('Console')}{' '}
      <span className="text-vega-clight-100 dark:text-vega-cdark-100">
        {VEGA_ENV}
      </span>
    </span>
  );

  return isOnboardingDialogNeeded ? (
    <Dialog
      open
      title={title}
      size={isTelemetryPopupNeeded ? 'small' : 'medium'}
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      <WelcomeDialogContent />
    </Dialog>
  ) : null;
};
