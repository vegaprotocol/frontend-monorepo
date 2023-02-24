import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import * as Sentry from '@sentry/react';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useGetDepositMaximum } from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { isAssetTypeERC20, usePrevious } from '@vegaprotocol/utils';
import { useAccountBalance } from '@vegaprotocol/accounts';
import type { Asset } from '@vegaprotocol/assets';

type DepositBalances = {
  balance: BigNumber;
  allowance: BigNumber;
  deposited: BigNumber;
  max: BigNumber;
  refresh: () => void;
};

type DepositBalancesState = Omit<DepositBalances, 'refresh'>;

const initialState: DepositBalancesState = {
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
): DepositBalances => {
  const tokenContract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined,
    isFaucetable
  );
  const bridgeContract = useBridgeContract();
  const getAllowance = useGetAllowance(tokenContract, asset);
  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);
  const getDepositMaximum = useGetDepositMaximum(bridgeContract, asset);
  const getDepositedAmount = useGetDepositedAmount(asset);
  const prevAsset = usePrevious(asset);
  const [state, setState] = useState<DepositBalancesState>(initialState);

  useEffect(() => {
    if (asset?.id !== prevAsset?.id) {
      // reset values to initial state when asset changes
      setState(initialState);
    }
  }, [asset?.id, prevAsset?.id]);

  const { accountBalance } = useAccountBalance(asset?.id);

  const getBalances = useCallback(async () => {
    if (!asset) return;
    try {
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
      Sentry.captureException(err);
    }
  }, [asset, getAllowance, getBalance, getDepositMaximum, getDepositedAmount]);

  useEffect(() => {
    getBalances();
  }, [asset, getBalances, accountBalance]);

  return { ...state, refresh: getBalances };
};
