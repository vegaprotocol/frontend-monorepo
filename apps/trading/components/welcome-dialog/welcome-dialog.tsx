import { useNavigate } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
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

export const WelcomeDialog = () => {
  const [telemetryValue, setTelemetryValue, isTelemetryNeeded, closeTelemetry] =
    useTelemetryApproval();
  const { VEGA_ENV } = useEnvironment();
  const [onBoardingViewed] = useLocalStorage(constants.ONBOARDING_VIEWED_KEY);
  const update = useGlobalStore((store) => store.update);
  const dismissed = useGlobalStore((store) => store.onBoardingDismissed);
  const currentStep = useGetOnboardingStep();

  const navigate = useNavigate();
  const isOnboardingDialogNeeded =
    onBoardingViewed !== 'true' &&
    currentStep &&
    currentStep < OnboardingStep.ONBOARDING_COMPLETE_STEP &&
    !dismissed;
  const marketId = useGlobalStore((store) => store.marketId);

  const onClose = () => {
    if (isTelemetryNeeded) {
      closeTelemetry();
    } else {
      const link = marketId
        ? Links[Routes.MARKET](marketId)
        : Links[Routes.HOME]();
      navigate(link);
      update({ onBoardingDismissed: true });
    }
  };
  const title = (
    <span className="font-alpha calt" data-testid="welcome-title">
      {isTelemetryNeeded ? (
        t('Improve vega console')
      ) : (
        <>
          {t('Console')}{' '}
          <span className="text-vega-clight-100 dark:text-vega-cdark-100">
            {VEGA_ENV}
          </span>
        </>
      )}
    </span>
  );

  const content = isTelemetryNeeded ? (
    <TelemetryApproval
      telemetryValue={telemetryValue}
      setTelemetryValue={setTelemetryValue}
    />
  ) : isOnboardingDialogNeeded ? (
    <WelcomeDialogContent />
  ) : null;

  return content ? (
    <Dialog
      open
      title={title}
      size={isTelemetryNeeded ? 'small' : 'medium'}
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      {content}
    </Dialog>
  ) : null;
};
