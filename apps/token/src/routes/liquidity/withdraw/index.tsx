import './withdraw.scss';

import * as Sentry from '@sentry/react';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';

import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import {
  KeyValueTable,
  KeyValueTableRow,
} from '../../../components/key-value-table';
import { TransactionCallout } from '../../../components/transaction-callout';
import { REWARDS_ADDRESSES } from '../../../config';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import { useTransaction } from '../../../hooks/use-transaction';
import { useVegaLPStaking } from '../../../hooks/use-vega-lp-staking';
import { formatNumber } from '../../../lib/format-number';
import { Routes } from '../../router-config';
import { useGetLiquidityBalances } from '../hooks';
import type {
  LiquidityAction,
  LiquidityState,
  LpContractData,
} from '../liquidity-reducer';
import { Button } from '@vegaprotocol/ui-toolkit';

export const LiquidityWithdrawPage = ({
  contractData,
  lpTokenAddress,
  dispatch,
}: {
  contractData: LpContractData;
  lpTokenAddress: string;
  dispatch: React.Dispatch<LiquidityAction>;
}) => {
  const { t } = useTranslation();
  const lpStaking = useVegaLPStaking({ address: lpTokenAddress });
  const { account } = useWeb3React();
  const {
    state: txUnstakeState,
    dispatch: txUnstakeDispatch,
    perform: txUnstakePerform,
    // @ts-ignore TFE import
  } = useTransaction(() => {
    if (!lpStaking) return;
    return lpStaking.unstake();
  });

  const { getBalances, lpStakingEth, lpStakingUSDC } = useGetLiquidityBalances(
    dispatch,
    account || ''
  );
  React.useEffect(() => {
    const run = async () => {
      if (!lpStakingUSDC || !lpStakingEth) return;
      try {
        await Promise.all([
          getBalances(lpStakingUSDC, REWARDS_ADDRESSES['SushiSwap VEGA/USDC']),
          getBalances(lpStakingEth, REWARDS_ADDRESSES['SushiSwap VEGA/ETH']),
        ]);
      } catch (e) {
        Sentry.captureException(e);
      }
    };
    if (txUnstakeState.txState === TxState.Complete) {
      run();
    }
  }, [getBalances, lpStakingEth, lpStakingUSDC, txUnstakeState.txState]);

  const hasLpTokens = React.useMemo(() => {
    return !(
      contractData.connectedWalletData?.totalStaked &&
      contractData.connectedWalletData?.totalStaked.isEqualTo(0)
    );
  }, [contractData.connectedWalletData?.totalStaked]);

  const hasRewardsTokens = React.useMemo(() => {
    return !(
      contractData.connectedWalletData?.accumulatedRewards &&
      contractData.connectedWalletData?.accumulatedRewards.isEqualTo(0)
    );
  }, [contractData.connectedWalletData?.accumulatedRewards]);

  if (txUnstakeState.txState !== TxState.Default) {
    return (
      <TransactionCallout
        state={txUnstakeState}
        completeHeading={t('withdrawAllLpSuccessCalloutTitle')}
        completeFooter={
          <Link to={Routes.LIQUIDITY}>
            <Button className="fill">{t('lpTxSuccessButton')}</Button>
          </Link>
        }
        reset={() =>
          txUnstakeDispatch({ type: TransactionActionType.TX_RESET })
        }
      />
    );
  } else if (!hasLpTokens && !hasRewardsTokens) {
    return <section>{t('withdrawLpNoneDeposited')}</section>;
  }

  return (
    <section>
      {!account ? (
        <EthConnectPrompt />
      ) : (
        <section>
          <KeyValueTable className="dex-tokens-withdraw__table">
            <KeyValueTableRow>
              <th>{t('liquidityTokenWithdrawBalance')}</th>
              <td>
                {contractData.connectedWalletData?.totalStaked
                  ? formatNumber(contractData.connectedWalletData.totalStaked)
                  : 0}
                &nbsp;
                {t('SLP')}
              </td>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <th>{t('liquidityTokenWithdrawRewards')}</th>
              <td>
                {contractData.connectedWalletData?.accumulatedRewards
                  ? formatNumber(
                      contractData.connectedWalletData.accumulatedRewards
                    )
                  : 0}
                &nbsp;
                {t('VEGA')}
              </td>
            </KeyValueTableRow>
          </KeyValueTable>
          <p className="dex-tokens-withdraw__submit">
            <Button
              disabled={!hasLpTokens}
              className="fill"
              onClick={txUnstakePerform}
            >
              {t('withdrawLpWithdrawAllButton')}
            </Button>
          </p>
        </section>
      )}
    </section>
  );
};

export const LiquidityWithdraw = () => {
  const { state, dispatch } = useOutletContext<{
    state: LiquidityState;
    dispatch: React.Dispatch<LiquidityAction>;
  }>();
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  const isValidAddress = React.useMemo(
    () => Object.values(REWARDS_ADDRESSES).includes(address!),
    [address]
  );

  const values = React.useMemo(
    () => state.contractData[address!],
    [address, state.contractData]
  );

  if (!isValidAddress) {
    return <section>{t('lpTokensInvalidToken', { address })}</section>;
  }

  if (!values) {
    return <p>{t('Loading')}...</p>;
  }

  return (
    <LiquidityWithdrawPage
      lpTokenAddress={address!}
      contractData={values}
      dispatch={dispatch}
    />
  );
};
