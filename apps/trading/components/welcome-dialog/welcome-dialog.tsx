import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeMarketsProvider } from '@vegaprotocol/markets';
import * as constants from '../constants';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeNoticeDialog } from './welcome-notice-dialog';
import { useGlobalStore } from '../../stores';
import { useEnvironment } from '@vegaprotocol/environment';
import { Networks } from '@vegaprotocol/environment';
import { isTestEnv } from '@vegaprotocol/utils';

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

  const isRiskDialogNeeded =
    riskAccepted !== 'true' && VEGA_ENV !== Networks.MAINNET && !isTestEnv();

  const isWelcomeDialogNeeded = pathname === '/' || shouldDisplayWelcomeDialog;

  const onCloseDialog = useCallback(() => {
    update({
      shouldDisplayWelcomeDialog: isRiskDialogNeeded,
    });
  }, [update, isRiskDialogNeeded]);

  if (isRiskDialogNeeded) {
    dialogContent = (
      <RiskNoticeDialog onClose={onCloseDialog} network={VEGA_ENV} />
    );
    title = t('Vega Console');
    size = 'medium';
  } else if (isWelcomeDialogNeeded && data?.length === 0) {
    dialogContent = <WelcomeNoticeDialog />;
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
