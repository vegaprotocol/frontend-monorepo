import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import * as Sentry from '@sentry/react';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useGetDepositMaximum } from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { isAssetTypeERC20, localLoggerFactory } from '@vegaprotocol/utils';
import { useAccountBalance } from '@vegaprotocol/accounts';
import type { Asset } from '@vegaprotocol/assets';

export interface DepositBalances {
  balance: BigNumber; // amount in Ethereum wallet
  allowance: BigNumber; // amount approved
  deposited: BigNumber; // total amounted deposited over lifetime
  max: BigNumber; // life time deposit cap
}

const initialState: DepositBalances = {
  balance: new BigNumber(0),
  allowance: new BigNumber(0),
  deposited: new BigNumber(0),
  max: new BigNumber(0),
};

/**
 * Hook which fetches all the balances required for depositing
 * whenever the asset changes in the form
 */
export const useDepositBalances = (
  asset: Asset | undefined,
  isFaucetable: boolean
) => {
  const tokenContract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined,
    isFaucetable
  );
  const bridgeContract = useBridgeContract();
  const getAllowance = useGetAllowance(tokenContract, asset);
  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);
  const getDepositMaximum = useGetDepositMaximum(bridgeContract, asset);
  const getDepositedAmount = useGetDepositedAmount(asset);
  const [state, setState] = useState<DepositBalances | null>(null);

  const { accountBalance } = useAccountBalance(asset?.id);

  const getBalances = useCallback(async () => {
    if (!asset) return;
    try {
      setState(null);
      const [max, deposited, balance, allowance] = await Promise.all([
        getDepositMaximum(),
        getDepositedAmount(),
        getBalance(),
        getAllowance(),
      ]);

      setState({
        max: max ?? initialState.max,
        deposited: deposited ?? initialState.deposited,
        balance: balance ?? initialState.balance,
        allowance: allowance ?? initialState.allowance,
      });
    } catch (err) {
      const logger = localLoggerFactory({ application: 'deposits' });
      if (err.message.match(/call revert exception/)) {
        logger.info('call revert eth exception', err);
      } else {
        logger.error(err);
      }
      setState(null);
    }
  }, [asset, getAllowance, getBalance, getDepositMaximum, getDepositedAmount]);

  const reset = useCallback(() => {
    setState(null);
  }, []);

  useEffect(() => {
    getBalances();
  }, [asset, getBalances, accountBalance]);

  return { balances: state, getBalances, reset };
};
