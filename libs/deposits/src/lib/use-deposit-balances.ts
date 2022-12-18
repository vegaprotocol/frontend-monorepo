import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useEffect, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import * as Sentry from '@sentry/react';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useGetDepositMaximum } from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { isAssetTypeERC20 } from '@vegaprotocol/react-helpers';
import type { Asset } from '@vegaprotocol/assets';

const initialState = {
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
  const assetRef = useRef(asset);
  const [state, setState] = useState(initialState);

  if (asset !== assetRef.current) {
    assetRef.current = asset;
    setState(initialState);
  }

  useEffect(() => {
    const getBalances = async () => {
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
    };

    if (asset) {
      getBalances();
    }
  }, [asset, getDepositMaximum, getDepositedAmount, getAllowance, getBalance]);

  return state;
};
