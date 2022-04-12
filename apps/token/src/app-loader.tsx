import * as Sentry from '@sentry/react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SplashError } from './components/splash-error';
import { SplashLoader } from './components/splash-loader';
import { SplashScreen } from './components/splash-screen';
import { Flags } from './config';
import {
  AppStateActionType,
  useAppState,
} from './contexts/app-state/app-state-context';
import { useContracts } from './contexts/contracts/contracts-context';
import { useRefreshAssociatedBalances } from './hooks/use-refresh-associated-balances';
import { getDataNodeUrl } from './lib/get-data-node-url';

export const AppLoader = ({ children }: { children: React.ReactElement }) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();
  const { appDispatch } = useAppState();
  const { token, staking, vesting } = useContracts();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  const [balancesLoaded, setBalancesLoaded] = React.useState(false);
  // TODO: TFE import detect when vega keys attempt complete
  // const [vegaKeysLoaded, setVegaKeysLoaded] = React.useState(false);

  // Derive loaded state from all things that we want to load or attempted
  // to load before rendering the app

  // TODO: TFE import
  const loaded = balancesLoaded; // && vegaKeysLoaded;

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
          staking.totalStaked(),
          vesting.totalStaked(),
          token.decimals(),
        ]);
        appDispatch({
          type: AppStateActionType.SET_TOKEN,
          decimals,
          totalSupply: supply,
          totalAssociated: totalAssociatedWallet.plus(totalAssociatedVesting),
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
    if (account && keypair) {
      setAssociatedBalances(account, keypair.pub);
    }
  }, [setAssociatedBalances, account, keypair]);

  React.useEffect(() => {
    const { base } = getDataNodeUrl();
    const networkLimitsEndpoint = new URL('/network/limits', base).href;
    const statsEndpoint = new URL('/statistics', base).href;

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
  }, [appDispatch, t]);

  if (Flags.NETWORK_DOWN) {
    return (
      <SplashScreen>
        <SplashError />
      </SplashScreen>
    );
  }

  if (!loaded) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return children;
};
