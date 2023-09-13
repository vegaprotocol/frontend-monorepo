import type { Toast} from '@vegaprotocol/ui-toolkit';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useEffect } from 'react';
import { TelemetryApproval } from './telemetry-approval';
import { t } from '@vegaprotocol/i18n';

const TELEMETRY_APPROVAL_TOAST_ID = 'telemetry_tost_id';

export const Telemetry = () => {
  const [telemetryValue, setTelemetryValue, isTelemetryNeeded, closeTelemetry] =
    useTelemetryApproval();

  const [setToast, hasToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.remove,
  ]);

  const onApprovalClose = () => {
    closeTelemetry();
    removeToast(TELEMETRY_APPROVAL_TOAST_ID);
  };

  const setTelemetryApprovalAndClose = (value: string) => {
    setTelemetryValue(value);
    onApprovalClose();
  };

  useEffect(() => {
    if (isTelemetryNeeded) {
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
  }, [isTelemetryNeeded]);

  return null;
};
