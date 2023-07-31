import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeMarketsProvider } from '@vegaprotocol/markets';
import * as constants from '../constants';
import { OnboardingDialog } from './onboarding-dialog';
import { WelcomeNoticeDialog } from './welcome-notice-dialog';
import { useGlobalStore } from '../../stores';
import { useEnvironment } from '@vegaprotocol/environment';
import { isTestEnv } from '@vegaprotocol/utils';

export const WelcomeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const { pathname } = useLocation();
  let dialogContent: React.ReactNode;
  let title: string | React.ReactNode = '';
  let size: 'small' | 'medium' = 'small';
  let onClose: ((open: boolean) => void) | undefined = undefined;
  const [onBoardingViewed, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );
  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
    variables: undefined,
  });

  const update = useGlobalStore((store) => store.update);
  const shouldDisplayWelcomeDialog = useGlobalStore(
    (store) => store.shouldDisplayWelcomeDialog
  );

  const isOnboardingDialogNeeded = onBoardingViewed !== 'true' && !isTestEnv();

  const isWelcomeDialogNeeded = pathname === '/' || shouldDisplayWelcomeDialog;

  const onCloseDialog = useCallback(() => {
    update({
      shouldDisplayWelcomeDialog: isOnboardingDialogNeeded,
    });
  }, [update, isOnboardingDialogNeeded]);

  if (isOnboardingDialogNeeded) {
    dialogContent = <OnboardingDialog network={VEGA_ENV} />;
    onClose = () => setOnboardingViewed('true');
    title = (
      <h3 className="font-alpha calt">
        {t('Console')}{' '}
        <span className="text-vega-clight-50 dark:text-vega-cdark-50">
          {VEGA_ENV}
        </span>
      </h3>
    );
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
      intent={Intent.None}
    >
      {dialogContent}
    </Dialog>
  );
};
