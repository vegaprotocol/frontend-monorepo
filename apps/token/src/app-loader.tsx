import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useEagerConnect } from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SplashError } from './components/splash-error';
import { SplashLoader } from './components/splash-loader';
import { Flags } from './config';
import {
  AppStateActionType,
  useAppState,
} from './contexts/app-state/app-state-context';
import { useContracts } from './contexts/contracts/contracts-context';
import { useRefreshAssociatedBalances } from './hooks/use-refresh-associated-balances';
import { Connectors } from './lib/vega-connectors';

export const AppLoader = ({ children }: { children: React.ReactElement }) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { VEGA_URL } = useEnvironment();
  const { pubKey } = useVegaWallet();
  const { appDispatch } = useAppState();
  const { token, staking, vesting } = useContracts();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  const [balancesLoaded, setBalancesLoaded] = React.useState(false);
  const vegaConnecting = useEagerConnect(Connectors);

  const loaded = balancesLoaded && !vegaConnecting;

  React.useEffect(() => {
    const run = async () => {
      try {
        const [
          supply,
          totalAssociatedWallet,
          totalAssociatedVesting,
          decimals,
        ] = await Promise.all([
          token.totalSupply(),
          staking.total_staked(),
          vesting.total_staked(),
          token.decimals(),
        ]);

        const totalSupply = toBigNum(supply, decimals);
        const totalWallet = toBigNum(totalAssociatedWallet, decimals);
        const totalVesting = toBigNum(totalAssociatedVesting, decimals);

        appDispatch({
          type: AppStateActionType.SET_TOKEN,
          decimals,
          totalSupply,
          totalAssociated: totalWallet.plus(totalVesting),
        });
        setBalancesLoaded(true);
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    if (!Flags.NETWORK_DOWN) {
      run();
    }
  }, [token, appDispatch, staking, vesting]);

  React.useEffect(() => {
    if (account && pubKey) {
      setAssociatedBalances(account, pubKey);
    }
  }, [setAssociatedBalances, account, pubKey]);

  React.useEffect(() => {
    const networkLimitsEndpoint = new URL('/network/limits', VEGA_URL).href;
    const statsEndpoint = new URL('/statistics', VEGA_URL).href;

    // eslint-disable-next-line
    let interval: any = null;

    const getNetworkLimits = async () => {
      try {
        const [networkLimits, stats] = await Promise.all([
          fetch(networkLimitsEndpoint).then((res) => res.json()),
          fetch(statsEndpoint).then((res) => res.json()),
        ]);

        const restoreBlock = Number(
          networkLimits.networkLimits.bootstrapBlockCount
        );
        const currentBlock = Number(stats.statistics.blockHeight);

        if (currentBlock <= restoreBlock) {
          appDispatch({
            type: AppStateActionType.SET_BANNER_MESSAGE,
            message: t('networkRestoring', {
              bootstrapBlockCount: restoreBlock,
            }),
          });

          if (!interval) {
            startPoll();
          }
        } else {
          appDispatch({
            type: AppStateActionType.SET_BANNER_MESSAGE,
            message: '',
          });

          if (interval) {
            stopPoll();
          }
        }
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    const stopPoll = () => {
      clearInterval(interval);
      interval = null;
    };

    const startPoll = () => {
      interval = setInterval(() => {
        getNetworkLimits();
      }, 10000);
    };

    // Only begin polling if network limits flag is set, as this is a new API not yet on mainnet 7/3/22
    if (Flags.NETWORK_LIMITS) {
      getNetworkLimits();
    }

    return () => {
      stopPoll();
    };
  }, [appDispatch, VEGA_URL, t]);

  if (Flags.NETWORK_DOWN) {
    return (
      <Splash>
        <SplashError />
      </Splash>
    );
  }

  if (!loaded) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return children;
};
