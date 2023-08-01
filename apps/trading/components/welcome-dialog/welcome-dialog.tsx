import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { isBrowserWalletInstalled, isTestEnv } from '@vegaprotocol/utils';
import * as constants from '../constants';
import { OnboardingDialog } from './onboarding-dialog';
import { getConfig } from '@vegaprotocol/wallet';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  let dialogContent: React.ReactNode;
  let title: string | React.ReactNode = '';
  let size: 'small' | 'medium' = 'small';
  let onClose: ((open: boolean) => void) | undefined = undefined;
  const [onBoardingViewed, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );
  const navigate = useNavigate();
  const isOnboardingDialogNeeded =
    onBoardingViewed !== 'true' && !isBrowserWalletInstalled() && !getConfig();

  const marketId = useGlobalStore((store) => store.marketId);

  if (isOnboardingDialogNeeded) {
    dialogContent = <OnboardingDialog />;
    onClose = () => {
      setOnboardingViewed('true');
      const link = marketId
        ? Links[Routes.MARKET](marketId)
        : Links[Routes.HOME]();
      navigate(link);
    };
    title = (
      <span className="font-alpha calt" data-testid="welcome-title">
        {t('Console')}{' '}
        <span className="text-vega-clight-50 dark:text-vega-cdark-50">
          {VEGA_ENV}
        </span>
      </span>
    );
    size = 'medium';
  } else {
    dialogContent = null as React.ReactNode;
  }

  return (
    <Dialog
      open={Boolean(dialogContent)}
      title={title}
      size={size}
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      {dialogContent}
    </Dialog>
  );
};
