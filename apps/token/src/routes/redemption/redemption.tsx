import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { EthConnectPrompt } from '../../components/eth-connect-prompt';
import { SplashLoader } from '../../components/splash-loader';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { useTranches } from '../../hooks/use-tranches';
import { Routes as RoutesConfig } from '../router-config';
import {
  initialRedemptionState,
  RedemptionActionType,
  redemptionReducer,
} from './redemption-reducer';

const RedemptionRouter = () => {
  const { t } = useTranslation();
  const [state, dispatch] = React.useReducer(
    redemptionReducer,
    initialRedemptionState
  );
  const {
    appState: { trancheBalances },
  } = useAppState();
  const { account } = useWeb3React();
  const { tranches, error, loading } = useTranches();

  React.useEffect(() => {
    const run = (address: string) => {
      const userTranches = tranches?.filter((t) =>
        t.users.some(
          ({ address: a }) => a.toLowerCase() === address.toLowerCase()
        )
      );

      if (userTranches) {
        dispatch({
          type: RedemptionActionType.SET_USER_TRANCHES,
          userTranches,
        });
      }
    };

    if (account) {
      run(account);
    }
  }, [account, tranches]);

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        <span>{error.message}</span>
      </Callout>
    );
  }

  if (!tranches || loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  if (!account) {
    return (
      <EthConnectPrompt>
        <p data-testid="eth-connect-prompt">
          {t(
            "Use the Ethereum wallet you want to send your tokens to. You'll also need enough Ethereum to pay gas."
          )}
        </p>
      </EthConnectPrompt>
    );
  }

  if (!trancheBalances.length) {
    return (
      <>
        <Callout>
          <p>{t('You have no VEGA tokens currently vesting.')}</p>
        </Callout>
        <Link to={RoutesConfig.TRANCHES}>{t('viewAllTranches')}</Link>
      </>
    );
  }

  return <Outlet context={{ state, account }} />;
};

export default RedemptionRouter;
