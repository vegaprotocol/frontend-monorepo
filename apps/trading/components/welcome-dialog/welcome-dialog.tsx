import React, { useMemo, useState, useCallback } from 'react';
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
  const onClose = useCallback(() => {
    setDialog(null);
  }, [setDialog]);
  const [riskAccepted] = useLocalStorage(constants.RISK_ACCEPTED_KEY);

  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
  });

  useMemo(() => {
    switch (true) {
      case riskAccepted !== 'true' && VEGA_ENV === Networks.MAINNET:
        setDialog({
          content: <RiskNoticeDialog onClose={onClose} />,
          title: t('WARNING'),
          size: 'medium',
          onClose,
        });
        break;
      case pathname === '/' && data?.length === 0:
        setDialog({
          content: <WelcomeNoticeDialog />,
          onClose,
        });
        break;
      case pathname === '/' && (data?.length || 0) > 0:
        setDialog({
          content: <WelcomeLandingDialog onClose={onClose} />,
          onClose,
        });
        break;
    }
  }, [onClose, data?.length, riskAccepted, pathname, VEGA_ENV, setDialog]);
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
