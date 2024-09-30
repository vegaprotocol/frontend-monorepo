import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Button, Intent, ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../use-t';
import { Links } from '../links';
import { useIncompleteWithdrawals } from './use-incomplete-withdrawals';

const CHECK_INTERVAL = 1000;
const ON_APP_START_TOAST_ID = `ready-to-withdraw`;

export const useReadyToWithdrawalToasts = () => {
  const [setToast, hasToast, updateToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
    store.remove,
  ]);

  const { delayed, ready } = useIncompleteWithdrawals();

  useEffect(() => {
    // set on app start toast if there are withdrawals ready to complete
    if (ready.length > 0) {
      // set only once, unless removed
      if (!hasToast(ON_APP_START_TOAST_ID)) {
        const appStartToast: Toast = {
          id: ON_APP_START_TOAST_ID,
          intent: Intent.Warning,
          content:
            ready.length === 1 ? (
              <SingleReadyToWithdrawToastContent />
            ) : (
              <MultipleReadyToWithdrawToastContent count={ready.length} />
            ),
          onClose: () => updateToast(ON_APP_START_TOAST_ID, { hidden: true }),
        };
        setToast(appStartToast);
      }
    }

    // set toast whenever a withdrawal delay is passed
    let interval: NodeJS.Timer;
    if (delayed.length > 0) {
      interval = setInterval(() => {
        const ready = delayed.filter(
          (item) => item.timestamp && Date.now() >= item.timestamp
        );
        for (const withdrawal of ready) {
          const id = `complete-withdrawal-${withdrawal.data.id}`;
          const toast: Toast = {
            id,
            intent: Intent.Warning,
            content: <SingleReadyToWithdrawToastContent />,
            onClose: () => {
              updateToast(id, { hidden: true });
            },
          };
          if (!hasToast(id)) setToast(toast);
        }
      }, CHECK_INTERVAL);
    }

    return () => {
      clearInterval(interval);
    };
  }, [delayed, hasToast, ready, removeToast, setToast, updateToast]);
};

const MultipleReadyToWithdrawToastContent = ({ count }: { count: number }) => {
  const t = useT();
  const navigate = useNavigate();
  return (
    <>
      <ToastHeading>{t('Withdrawals ready')}</ToastHeading>
      <p>
        {t('Complete these {{count}} withdrawals to release your funds', {
          count,
        })}
      </p>
      <p className="mt-2">
        <Button
          data-testid="toast-view-withdrawals"
          size="xs"
          onClick={() => navigate(Links.PORTFOLIO())}
        >
          {t('View withdrawals')}
        </Button>
      </p>
    </>
  );
};

const SingleReadyToWithdrawToastContent = () => {
  const t = useT();
  const navigate = useNavigate();

  return (
    <>
      <ToastHeading>{t('Withdrawal ready')}</ToastHeading>
      <p>{t('Complete the withdrawal to release your funds')}</p>
      <p className="mt-2">
        <Button
          data-testid="toast-view-withdrawals"
          size="xs"
          onClick={() => navigate(Links.PORTFOLIO())}
        >
          {t('View withdrawals')}
        </Button>
      </p>
    </>
  );
};
