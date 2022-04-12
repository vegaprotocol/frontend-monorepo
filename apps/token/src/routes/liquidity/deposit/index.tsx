import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Dispatch } from 'react';
import { useOutletContext } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import { TokenInput } from '../../../components/token-input';
import { TransactionCallout } from '../../../components/transaction-callout';
import { REWARDS_ADDRESSES } from '../../../config';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import { useTransaction } from '../../../hooks/use-transaction';
import { useVegaLPStaking } from '../../../hooks/use-vega-lp-staking';
import { BigNumber } from '../../../lib/bignumber';
import { Routes } from '../../router-config';
import { DexTokensSection } from '../dex-table';
import { useGetLiquidityBalances } from '../hooks';
import type { LiquidityAction, LiquidityState } from '../liquidity-reducer';

export const LiquidityDepositPage = ({
  lpTokenAddress,
  name,
  state,
  dispatch,
}: {
  lpTokenAddress: string;
  name: string;
  state: LiquidityState;
  dispatch: Dispatch<LiquidityAction>;
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('0');
  const lpStaking = useVegaLPStaking({ address: lpTokenAddress });
  const [allowance, setAllowance] = useState<BigNumber>(new BigNumber(0));
  const {
    state: txApprovalState,
    dispatch: txApprovalDispatch,
    perform: txApprovalPerform,
    // @ts-ignore TFE import
  } = useTransaction(() => {
    if (!lpStaking) return;
    return lpStaking.approve(lpTokenAddress);
  });
  const {
    state: txStakeState,
    dispatch: txStakeDispatch,
    perform: txStakePerform,
    // @ts-ignore TFE import
  } = useTransaction(() => {
    if (!lpStaking) return;
    return lpStaking.stake(amount);
  });
  const { account } = useWeb3React();
  const { getBalances, lpStakingEth, lpStakingUSDC } = useGetLiquidityBalances(
    dispatch,
    account || ''
  );
  useEffect(() => {
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
    if (txStakeState.txState === TxState.Complete) {
      run();
    }
  }, [getBalances, lpStakingEth, lpStakingUSDC, txStakeState.txState]);
  const values = useMemo(
    () => state.contractData[lpTokenAddress],
    [lpTokenAddress, state.contractData]
  );
  const maximum = useMemo(
    () =>
      BigNumber.min(
        values.connectedWalletData?.availableLPTokens || 0,
        allowance
      ),
    [allowance, values.connectedWalletData?.availableLPTokens]
  );
  const fetchAllowance = useCallback(async () => {
    if (!lpStaking) return;
    try {
      const allowance = await lpStaking.allowance(account || '');
      setAllowance(allowance);
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [account, lpStaking]);
  useEffect(() => {
    if (txApprovalState.txState === TxState.Complete) {
      fetchAllowance();
    }
  }, [lpStaking, account, fetchAllowance, txApprovalState.txState]);
  useEffect(() => {
    fetchAllowance();
  }, [lpStaking, account, fetchAllowance]);
  let pageContent;
  if (txStakeState.txState !== TxState.Default) {
    pageContent = (
      <TransactionCallout
        state={txStakeState}
        completeHeading={t('depositLpSuccessCalloutTitle')}
        completeBody={t('depositLpSuccessCalloutBody')}
        completeFooter={
          <Link to={Routes.LIQUIDITY}>
            <button className="fill">{t('lpTxSuccessButton')}</button>
          </Link>
        }
        reset={() => txStakeDispatch({ type: TransactionActionType.TX_RESET })}
      />
    );
  } else if (
    values.connectedWalletData?.stakedLPTokens &&
    !values.connectedWalletData?.stakedLPTokens.isEqualTo(0)
  ) {
    pageContent = (
      <p>
        <Trans
          i18nKey="depositLpAlreadyStaked"
          components={{
            withdrawLink: (
              <Link to={`${Routes.LIQUIDITY}/${lpTokenAddress}/withdraw`} />
            ),
          }}
        />
      </p>
    );
  } else {
    pageContent = (
      <>
        {!account && <EthConnectPrompt />}
        <Callout
          iconName="error"
          intent={Intent.Danger}
          title={t('depositLpCalloutTitle')}
        >
          <p>{t('depositLpCalloutBody')}</p>
        </Callout>
        <DexTokensSection
          name={name}
          contractAddress={lpTokenAddress}
          ethAddress={account || ''}
          state={state}
        />
        <h1>{t('depositLpTokensHeading')}</h1>
        {values.connectedWalletData?.availableLPTokens?.isGreaterThan(0) ? (
          <TokenInput
            submitText={t('depositLpSubmitButton')}
            approveText={t('depositLpApproveButton')}
            requireApproval={true}
            allowance={allowance}
            perform={txStakePerform}
            approve={txApprovalPerform}
            amount={amount}
            setAmount={setAmount}
            maximum={maximum}
            approveTxState={txApprovalState}
            approveTxDispatch={txApprovalDispatch}
            currency={t('SLP Tokens')}
          />
        ) : (
          <p>{t('depositLpInsufficientBalance')}</p>
        )}
      </>
    );
  }

  return <section>{pageContent}</section>;
};

export const LiquidityDeposit = () => {
  const { state, dispatch } = useOutletContext<{
    state: LiquidityState;
    dispatch: Dispatch<LiquidityAction>;
  }>();
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  const isValidAddress = useMemo(
    () => Object.values(REWARDS_ADDRESSES).includes(address!),
    [address]
  );

  if (!isValidAddress) {
    return <section>{t('lpTokensInvalidToken', { address })}</section>;
  }
  const [name] = Object.entries(REWARDS_ADDRESSES).find(
    ([, a]) => a === address
  )!;

  return (
    <LiquidityDepositPage
      state={state}
      dispatch={dispatch}
      name={name}
      lpTokenAddress={address!}
    />
  );
};
