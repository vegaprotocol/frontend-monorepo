import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider, useLocalStorage } from '@vegaprotocol/react-helpers';
import { activeMarketsProvider } from '@vegaprotocol/market-list';
import { useEnvironment, Networks } from '@vegaprotocol/environment';
import * as constants from '../constants';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeNoticeDialog } from './welcome-notice-dialog';
import { WelcomeLandingDialog } from './welcome-landing-dialog';
import { useGlobalStore } from '../../stores';

export const WelcomeDialog = () => {
  const { pathname } = useLocation();
  const { VEGA_ENV } = useEnvironment();
  let dialogContent: React.ReactNode = null;
  let title = '';
  let size: 'small' | 'medium' = 'small';
  const [riskAccepted] = useLocalStorage(constants.RISK_ACCEPTED_KEY);
  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
    variables: undefined,
  });

  const { update, shouldDisplayWelcomeDialog } = useGlobalStore((store) => ({
    update: store.update,
    shouldDisplayWelcomeDialog: store.shouldDisplayWelcomeDialog,
  }));
  const isRiskDialogNeeded =
    riskAccepted !== 'true' && VEGA_ENV === Networks.MAINNET;
  const isWelcomeDialogNeeded = pathname === '/' || shouldDisplayWelcomeDialog;
  const onClose = useCallback(() => {
    update({ shouldDisplayWelcomeDialog: isRiskDialogNeeded });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dialogContent = null;
  }, [update, isRiskDialogNeeded]);

  if (isRiskDialogNeeded) {
    dialogContent = <RiskNoticeDialog onClose={onClose} />;
    title = t('WARNING');
    size = 'medium';
  } else if (isWelcomeDialogNeeded && data?.length === 0) {
    dialogContent = <WelcomeNoticeDialog />;
  } else if (isWelcomeDialogNeeded && (data?.length || 0) > 0) {
    dialogContent = <WelcomeLandingDialog onClose={onClose} />;
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
