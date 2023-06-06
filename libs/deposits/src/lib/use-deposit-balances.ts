import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import {
  useGetDepositMaximum,
  useIsExemptDepositor,
} from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useAccountBalance } from '@vegaprotocol/accounts';
import type { Asset } from '@vegaprotocol/assets';
import { useWeb3React } from '@web3-react/core';

export interface DepositBalances {
  balance: BigNumber; // amount in Ethereum wallet
  allowance: BigNumber; // amount approved
  deposited: BigNumber; // total amounted deposited over lifetime
  max: BigNumber; // life time deposit cap
  exempt: boolean; // if exempt then deposit cap doesn't matter
}

const initialState: DepositBalances = {
  balance: new BigNumber(0),
  allowance: new BigNumber(0),
  deposited: new BigNumber(0),
  max: new BigNumber(0),
  exempt: false,
};

/**
 * Hook which fetches all the balances required for depositing
 * whenever the asset changes in the form
 */
export const useDepositBalances = (asset: Asset | undefined) => {
  const { account } = useWeb3React();
  const tokenContract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined
  );
  const bridgeContract = useBridgeContract();
  const getAllowance = useGetAllowance(tokenContract, asset);
  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);
  const getDepositMaximum = useGetDepositMaximum(bridgeContract, asset);
  const isExemptDepositor = useIsExemptDepositor(bridgeContract, account);
  const getDepositedAmount = useGetDepositedAmount(asset);
  const [state, setState] = useState<DepositBalances | null>(null);

  const { accountBalance } = useAccountBalance(asset?.id);

  const getBalances = useCallback(async () => {
    if (!asset) return;
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposit balances', { asset: asset.id });
      setState(null);
      const [max, deposited, balance, allowance, exempt] = await Promise.all([
        getDepositMaximum(),
        getDepositedAmount(),
        getBalance(),
        getAllowance(),
        isExemptDepositor(),
      ]);

      setState({
        max: max ?? initialState.max,
        deposited: deposited ?? initialState.deposited,
        balance: balance ?? initialState.balance,
        allowance: allowance ?? initialState.allowance,
        exempt,
      });
    } catch (err) {
      logger.error('get deposit balances', err);
      setState(null);
    }
  }, [
    asset,
    getAllowance,
    getBalance,
    getDepositMaximum,
    getDepositedAmount,
    isExemptDepositor,
  ]);

  const reset = useCallback(() => {
    setState(null);
  }, []);

  useEffect(() => {
    getBalances();
  }, [asset, getBalances, accountBalance]);

  return { balances: state, getBalances, reset };
};
