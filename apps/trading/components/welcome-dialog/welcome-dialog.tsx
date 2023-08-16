import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useEnvironment } from '@vegaprotocol/environment';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from './use-get-onboarding-step';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();

  const update = useGlobalStore((store) => store.update);
  const dismissed = useGlobalStore((store) => store.onBoardingDismissed);
  const currentStep = useGetOnboardingStep();

  const navigate = useNavigate();
  const isOnboardingDialogNeeded =
    currentStep &&
    currentStep < OnboardingStep.ONBOARDING_COMPLETE_STEP &&
    !dismissed;
  const marketId = useGlobalStore((store) => store.marketId);

  const onClose = () => {
    const link = marketId
      ? Links[Routes.MARKET](marketId)
      : Links[Routes.HOME]();
    navigate(link);
    update({ onBoardingDismissed: true });
  };
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
      size="medium"
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      <WelcomeDialogContent />
    </Dialog>
  ) : null;
};
