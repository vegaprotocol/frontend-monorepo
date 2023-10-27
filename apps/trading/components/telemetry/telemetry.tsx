import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useCallback, useEffect } from 'react';
import { TelemetryApproval } from './telemetry-approval';
import { t } from '@vegaprotocol/i18n';
import { useOnboardingStore } from '../welcome-dialog/use-get-onboarding-step';

const TELEMETRY_APPROVAL_TOAST_ID = 'telemetry_toast_id';

export const Telemetry = () => {
  const onboardingDissmissed = useOnboardingStore((store) => store.dismissed);
  const [telemetryValue, setTelemetryValue, isTelemetryNeeded, closeTelemetry] =
    useTelemetryApproval();

  const [setToast, hasToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.remove,
  ]);

  const onApprovalClose = useCallback(() => {
    closeTelemetry();
    removeToast(TELEMETRY_APPROVAL_TOAST_ID);
  }, [closeTelemetry, removeToast]);

  const setTelemetryApprovalAndClose = useCallback(
    (value: string) => {
      setTelemetryValue(value);
      onApprovalClose();
    },
    [onApprovalClose, setTelemetryValue]
  );

  useEffect(() => {
    if (isTelemetryNeeded && onboardingDissmissed) {
      const toast: Toast = {
        id: TELEMETRY_APPROVAL_TOAST_ID,
        intent: Intent.Primary,
        content: (
          <>
            <h3 className="mb-1 text-sm uppercase">
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
  }, [
    telemetryValue,
    isTelemetryNeeded,
    onboardingDissmissed,
    setToast,
    hasToast,
    onApprovalClose,
    setTelemetryApprovalAndClose,
  ]);

  return null;
};
