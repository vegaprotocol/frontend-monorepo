import * as Sentry from '@sentry/react';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, Outlet } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { Flags, REWARDS_ADDRESSES } from '../../config';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { useGetLiquidityBalances } from './hooks';
import { initialLiquidityState, liquidityReducer } from './liquidity-reducer';
import { Splash } from '@vegaprotocol/ui-toolkit';

const RedemptionIndex = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const path = '/liquidity';
  const withdraw = useMatch(`${path}/:address/withdraw`);
  const deposit = useMatch(`${path}/:address/deposit`);
  const [state, dispatch] = React.useReducer(
    liquidityReducer,
    initialLiquidityState
  );
  const { account } = useWeb3React();
  const [loading, setLoading] = React.useState(true);
  const { getBalances, lpStakingUSDC, lpStakingEth } = useGetLiquidityBalances(
    dispatch,
    account || ''
  );
  const loadAllBalances = React.useCallback(async () => {
    if (!lpStakingUSDC || !lpStakingEth) return;
    try {
      await Promise.all([
        getBalances(lpStakingUSDC, REWARDS_ADDRESSES['SushiSwap VEGA/USDC']),
        getBalances(lpStakingEth, REWARDS_ADDRESSES['SushiSwap VEGA/ETH']),
      ]);
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  }, [getBalances, lpStakingEth, lpStakingUSDC]);
  React.useEffect(() => {
    loadAllBalances();
  }, [loadAllBalances]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      loadAllBalances();
    }, 10000);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadAllBalances]);

  const title = React.useMemo(() => {
    if (withdraw) {
      return t('pageTitleWithdrawLp');
    } else if (deposit) {
      return t('pageTitleDepositLp');
    }
    return t('pageTitleLiquidity');
  }, [withdraw, deposit, t]);
  if (loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }
  return (
    <>
      <Heading title={title} />
      {Flags.DEX_STAKING_DISABLED ? (
        <p>{t('liquidityComingSoon')}&nbsp;🚧👷‍♂️👷‍♀️🚧</p>
      ) : (
        <Outlet context={{ state, dispatch }} />
      )}
    </>
  );
};

export default RedemptionIndex;
