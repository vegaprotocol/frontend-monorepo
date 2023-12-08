import { useEffect } from 'react';
import { useMatch } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { VegaConnectDialog } from '@vegaprotocol/wallet';
import { Connectors } from '../../lib/vega-connectors';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { RiskMessage } from './risk-message';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { useOnboardingStore } from './use-get-onboarding-step';

export const WelcomeDialog = () => {
  const isReferrals = useMatch(Links.REFERRALS());
  const t = useT();
  const { VEGA_ENV } = useEnvironment();
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const dialogOpen = useOnboardingStore((store) => store.dialogOpen);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const setDialogOpen = useOnboardingStore((store) => store.setDialogOpen);
  const walletDialogOpen = useOnboardingStore(
    (store) => store.walletDialogOpen
  );
  const setWalletDialogOpen = useOnboardingStore(
    (store) => store.setWalletDialogOpen
  );

  useEffect(() => {
    if (dismissed) return;
    if (isReferrals) return;
    setDialogOpen(true);
  }, [dismissed, isReferrals, setDialogOpen]);

  const content = walletDialogOpen ? (
    <VegaConnectDialog
      connectors={Connectors}
      riskMessage={<RiskMessage />}
      onClose={() => setWalletDialogOpen(false)}
      contentOnly
    />
  ) : (
    <WelcomeDialogContent />
  );

  const onClose = walletDialogOpen
    ? () => setWalletDialogOpen(false)
    : () => {
        setDialogOpen(false);
        dismiss();
      };

  const title = walletDialogOpen ? null : (
    <span className="font-alpha calt" data-testid="welcome-title">
      {t('Console')}{' '}
      <span className="text-vega-clight-100 dark:text-vega-cdark-100">
        {VEGA_ENV}
      </span>
    </span>
  );

  return (
    <Dialog
      open={dismissed ? false : dialogOpen}
      title={title}
      size="medium"
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      {content}
    </Dialog>
  );
};
