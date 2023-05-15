import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeMarketsProvider } from '@vegaprotocol/market-list';
import * as constants from '../constants';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeNoticeDialog } from './welcome-notice-dialog';
import { WelcomeLandingDialog } from './welcome-landing-dialog';
import { Disclaimer } from './disclaimer';
import { useGlobalStore } from '../../stores';
import { useEnvironment } from '@vegaprotocol/environment';
import { Networks } from '@vegaprotocol/environment';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const { pathname } = useLocation();
  let dialogContent: React.ReactNode;
  let title = '';
  let size: 'small' | 'medium' = 'small';
  let onClose: ((open: boolean) => void) | undefined = undefined;
  const [riskAccepted] = useLocalStorage(constants.RISK_ACCEPTED_KEY);
  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
    variables: undefined,
  });

  const update = useGlobalStore((store) => store.update);
  const shouldDisplayWelcomeDialog = useGlobalStore(
    (store) => store.shouldDisplayWelcomeDialog
  );
  const shouldDisplayDisclaimerDialog = useGlobalStore(
    (store) => store.shouldDisplayDisclaimerDialog
  );
  const shouldDisplayMainnetRiskDialog = useGlobalStore(
    (store) => store.shouldDisplayMainnetRiskDialog
  );
  const isRiskDialogNeeded =
    riskAccepted !== 'true' &&
    (VEGA_ENV !== Networks.MAINNET || shouldDisplayMainnetRiskDialog) &&
    !('Cypress' in window);

  const isWelcomeDialogNeeded = pathname === '/' || shouldDisplayWelcomeDialog;

  const onCloseDialog = useCallback(() => {
    update({
      shouldDisplayWelcomeDialog:
        isRiskDialogNeeded && VEGA_ENV !== Networks.MAINNET,
    });
  }, [update, isRiskDialogNeeded, VEGA_ENV]);
  if (shouldDisplayDisclaimerDialog) {
    title = t('Disclaimer');
    dialogContent = <Disclaimer />;
    size = 'medium';
    onClose = () => update({ shouldDisplayDisclaimerDialog: false });
  } else if (isRiskDialogNeeded) {
    dialogContent = (
      <RiskNoticeDialog onClose={onCloseDialog} network={VEGA_ENV} />
    );
    title =
      VEGA_ENV === Networks.MAINNET
        ? t('Understand the risk')
        : t('Vega Console');
    size = VEGA_ENV === Networks.MAINNET ? 'small' : 'medium';
  } else if (isWelcomeDialogNeeded && data?.length === 0) {
    dialogContent = <WelcomeNoticeDialog />;
    onClose = onCloseDialog;
  } else if (isWelcomeDialogNeeded && (data?.length || 0) > 0) {
    dialogContent = <WelcomeLandingDialog onClose={onCloseDialog} />;
    onClose = onCloseDialog;
  } else {
    dialogContent = null as React.ReactNode;
  }

  return (
    <Dialog
      open={Boolean(dialogContent)}
      title={title}
      size={size}
      onChange={onClose}
    >
      {dialogContent}
    </Dialog>
  );
};
