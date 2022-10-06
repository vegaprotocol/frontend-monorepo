import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useDepositStore } from './deposit-store';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useGetDepositMaximum } from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { isAssetTypeERC20 } from '@vegaprotocol/assets';

/**
 * Hook which fetches all the balances required for depositing
 * whenever the asset changes in the form
 */
export const useDepositBalances = (isFaucetable: boolean) => {
  const { asset, update } = useDepositStore();
  const tokenContract = useTokenContract(
    isAssetTypeERC20(asset) ? asset : undefined,
    isFaucetable
  );
  const bridgeContract = useBridgeContract();
  const getAllowance = useGetAllowance(tokenContract, asset);
  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);
  const getDepositMaximum = useGetDepositMaximum(bridgeContract, asset);
  const getDepositedAmount = useGetDepositedAmount(asset);

  useEffect(() => {
    const getBalances = async () => {
      try {
        const [max, deposited, balance, allowance] = await Promise.all([
          getDepositMaximum(),
          getDepositedAmount(),
          getBalance(),
          getAllowance(),
        ]);

        update({
          max,
          deposited,
          balance,
          allowance,
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    if (asset) {
      getBalances();
    }
  }, [
    asset,
    update,
    getDepositMaximum,
    getDepositedAmount,
    getAllowance,
    getBalance,
  ]);
};
