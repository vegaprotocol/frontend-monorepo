import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { isBrowserWalletInstalled } from '@vegaprotocol/wallet';
import * as constants from '../constants';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { getConfig } from '@vegaprotocol/wallet';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const [onBoardingViewed, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );
  const navigate = useNavigate();
  const isOnboardingDialogNeeded =
    onBoardingViewed !== 'true' && !isBrowserWalletInstalled() && !getConfig();
  const marketId = useGlobalStore((store) => store.marketId);

  const onClose = () => {
    setOnboardingViewed('true');
    const link = marketId
      ? Links[Routes.MARKET](marketId)
      : Links[Routes.HOME]();
    navigate(link);
  };
  const title = (
    <span className="font-alpha calt" data-testid="welcome-title">
      {t('Console')}{' '}
      <span className="text-vega-clight-100 dark:text-vega-cdark-100">
        {VEGA_ENV}
      </span>
    </span>
  );

  return isOnboardingDialogNeeded ? (
    <Dialog
      open
      title={title}
      size="medium"
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      <WelcomeDialogContent />
    </Dialog>
  ) : null;
};
