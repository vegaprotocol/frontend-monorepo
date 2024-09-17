import { toBigNum } from '@vegaprotocol/utils';
import { Splash, Loader } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useEagerConnect } from '@vegaprotocol/wallet-react';
import { useFeatureFlags, useEnvironment } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashError } from './components/splash-error';
import {
  AppStateActionType,
  useAppState,
} from './contexts/app-state/app-state-context';
import { useContracts } from './contexts/contracts/contracts-context';
import { useRefreshAssociatedBalances } from './hooks/use-refresh-associated-balances';

export const AppLoader = ({ children }: { children: React.ReactElement }) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { API_NODE } = useEnvironment();
  const { pubKey } = useVegaWallet();
  const { appDispatch } = useAppState();
  const { token, staking } = useContracts();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  useEagerConnect();

  React.useEffect(() => {
    const run = async () => {
      try {
        const [supply, totalAssociatedWallet, decimals] = await Promise.all([
          token.totalSupply(),
          staking.totalStaked(),
          token.decimals(),
        ]);

        const totalSupply = toBigNum(supply.toString(), decimals);
        const totalWallet = toBigNum(
          totalAssociatedWallet.toString(),
          decimals
        );

        appDispatch({
          type: AppStateActionType.SET_TOKEN,
          decimals,
          totalSupply,
          totalAssociated: totalWallet,
        });
      } catch (err) {
        console.error(err);
      }
    };

    if (!featureFlags.GOVERNANCE_NETWORK_DOWN) {
      run();
    }
  }, [token, appDispatch, staking, featureFlags.GOVERNANCE_NETWORK_DOWN]);

  React.useEffect(() => {
    if (account && pubKey) {
      setAssociatedBalances(account, pubKey);
    }
  }, [setAssociatedBalances, account, pubKey]);

  React.useEffect(() => {
    const networkLimitsEndpoint = new URL(
      '/network/limits',
      API_NODE?.graphQLApiUrl
    ).href;
    const statsEndpoint = new URL('/statistics', API_NODE?.graphQLApiUrl).href;

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
        console.error(err);
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
  }, [
    appDispatch,
    t,
    featureFlags.GOVERNANCE_NETWORK_LIMITS,
    API_NODE?.graphQLApiUrl,
  ]);

  if (featureFlags.GOVERNANCE_NETWORK_DOWN) {
    return (
      <Splash>
        <SplashError />
      </Splash>
    );
  }

  const loading = (
    <Splash>
      <Loader />
    </Splash>
  );

  return <Suspense fallback={loading}>{children}</Suspense>;
};

AppLoader.displayName = 'AppLoader';
