import { useBridgeContract, useTokenContract } from '@vegaprotocol/web3';
import { useEffect } from 'react';
import { useDepositStore } from './deposit-store';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useGetDepositMaximum } from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';

/**
 * Hook which fetches all the balances required for despoiting
 * whenever the asset changes in the form
 */
export const useDepositBalances = (isFaucetable: boolean) => {
  const { asset, update } = useDepositStore();
  const tokenContract = useTokenContract(
    asset?.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined,
    true
  );
  const bridgeContract = useBridgeContract(true);
  const getAllowance = useGetAllowance(tokenContract, asset);
  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);
  const getDepositMaximum = useGetDepositMaximum(bridgeContract, asset);
  const getDepositedAmount = useGetDepositedAmount(asset);

  useEffect(() => {
    const getBalances = async () => {
      const res = await Promise.all([
        getDepositMaximum(),
        getDepositedAmount(),
        getBalance(),
        getAllowance(),
      ]);

      update({
        max: res[0],
        deposited: res[1],
        balance: res[2],
        allowance: res[3],
      });
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
