import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Intent, ToastHeading, useToasts } from '@vegaprotocol/ui-toolkit';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useCallback, useEffect } from 'react';
import { TelemetryApproval } from './telemetry-approval';
import { useT } from '../../lib/use-t';

const TELEMETRY_APPROVAL_TOAST_ID = 'telemetry_toast_id';

export const Telemetry = () => {
  const t = useT();
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
    if (isTelemetryNeeded) {
      const toast: Toast = {
        id: TELEMETRY_APPROVAL_TOAST_ID,
        intent: Intent.Primary,
        content: (
          <>
            <ToastHeading>{t('Improve vega console')}</ToastHeading>
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
    setToast,
    hasToast,
    onApprovalClose,
    setTelemetryApprovalAndClose,
    t,
  ]);

  return null;
};
