import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import {
  t,
  useDataProvider,
  useLocalStorage,
} from '@vegaprotocol/react-helpers';
import { activeMarketsProvider } from '@vegaprotocol/market-list';
import { useEnvironment, Networks } from '@vegaprotocol/environment';
import * as constants from '../constants';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeNoticeDialog } from './welcome-notice-dialog';
import { WelcomeLandingDialog } from './welcome-landing-dialog';
import { useGlobalStore } from '../../stores';

interface DialogConfig {
  open?: boolean;
  content: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium';
  onClose: () => void;
}
export const WelcomeDialog = () => {
  const { pathname } = useLocation();
  const { VEGA_ENV } = useEnvironment();
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [riskAccepted] = useLocalStorage(constants.RISK_ACCEPTED_KEY);
  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
  });

  const { update, marketId, shouldDisplayWelcomeDialog } = useGlobalStore(
    (store) => ({
      update: store.update,
      marketId: store.marketId,
      shouldDisplayWelcomeDialog: store.shouldDisplayWelcomeDialog,
    })
  );

  const isRiskDialogNeeded =
    riskAccepted !== 'true' && VEGA_ENV === Networks.MAINNET;
  const isWelcomeDialogNeeded =
    (pathname === '/' && !marketId) || shouldDisplayWelcomeDialog;
  const onClose = useCallback(() => {
    update({ shouldDisplayWelcomeDialog: isRiskDialogNeeded });
    setDialog(null);
  }, [setDialog, update, isRiskDialogNeeded]);

  useEffect(() => {
    switch (true) {
      case isRiskDialogNeeded:
        setDialog({
          content: <RiskNoticeDialog onClose={onClose} />,
          title: t('WARNING'),
          size: 'medium',
          onClose,
        });
        break;
      case isWelcomeDialogNeeded && data?.length === 0:
        setDialog({
          content: <WelcomeNoticeDialog />,
          onClose,
        });
        break;
      case isWelcomeDialogNeeded && (data?.length || 0) > 0:
        setDialog({
          content: <WelcomeLandingDialog onClose={onClose} />,
          onClose,
        });
        break;
    }
  }, [
    onClose,
    data?.length,
    setDialog,
    isRiskDialogNeeded,
    isWelcomeDialogNeeded,
  ]);
  return dialog ? (
    <Dialog
      open={Boolean(dialog.content)}
      title={dialog.title}
      size={dialog.size}
      onChange={dialog.onClose}
    >
      {dialog.content}
    </Dialog>
  ) : null;
};
