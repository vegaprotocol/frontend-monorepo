import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/utils';
import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  useVegaWallet,
  useEagerConnect as useVegaEagerConnect,
} from '@vegaprotocol/wallet-react';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';
import { useFeatureFlags, useEnvironment } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashError } from './components/splash-error';
import { SplashLoader } from './components/splash-loader';
import {
  AppStateActionType,
  useAppState,
} from './contexts/app-state/app-state-context';
import { useContracts } from './contexts/contracts/contracts-context';
import { useRefreshAssociatedBalances } from './hooks/use-refresh-associated-balances';
import { connectors } from './lib/web3-connectors';

// TODO: This blocks the app until you connect
export const AppLoader = ({ children }: { children: React.ReactElement }) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { VEGA_URL } = useEnvironment();
  const { pubKey } = useVegaWallet();
  const { appDispatch } = useAppState();
  const { token, staking, vesting } = useContracts();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  const [balancesLoaded, setBalancesLoaded] = useState(false);

  // Eager connect wallets
  const vegaWalletStatus = useVegaEagerConnect();
  useEthereumEagerConnect({ connectors });

  const loaded = balancesLoaded && vegaWalletStatus !== 'connecting';

  useEffect(() => {
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

        const totalSupply = toBigNum(supply.toString(), decimals);
        const totalWallet = toBigNum(
          totalAssociatedWallet.toString(),
          decimals
        );
        const totalVesting = toBigNum(
          totalAssociatedVesting.toString(),
          decimals
        );

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

    if (!featureFlags.GOVERNANCE_NETWORK_DOWN) {
      run();
    }
  }, [
    token,
    appDispatch,
    staking,
    vesting,
    featureFlags.GOVERNANCE_NETWORK_DOWN,
  ]);

  useEffect(() => {
    if (account && pubKey) {
      setAssociatedBalances(account, pubKey);
    }
  }, [setAssociatedBalances, account, pubKey]);

  useEffect(() => {
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
    if (featureFlags.GOVERNANCE_NETWORK_LIMITS) {
      getNetworkLimits();
    }

    return () => {
      stopPoll();
    };
  }, [appDispatch, VEGA_URL, t, featureFlags.GOVERNANCE_NETWORK_LIMITS]);

  if (featureFlags.GOVERNANCE_NETWORK_DOWN) {
    return (
      <Splash>
        <SplashError />
      </Splash>
    );
  }

  const loading = (
    <Splash>
      <SplashLoader />
    </Splash>
  );

  if (!loaded) {
    return loading;
  }
  return <Suspense fallback={loading}>{children}</Suspense>;
};

AppLoader.displayName = 'AppLoader';
