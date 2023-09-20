import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useEnvironment } from '@vegaprotocol/environment';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { useOnboardingStore } from './use-get-onboarding-step';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const dialogOpen = useOnboardingStore((store) => store.dialogOpen);
  const dismiss = useOnboardingStore((store) => store.dismiss);

  return (
    <Dialog
      id="welcome-dialog"
      open={dismissed ? false : dialogOpen}
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
