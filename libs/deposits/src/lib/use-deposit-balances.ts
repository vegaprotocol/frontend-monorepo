import {
  useCollateralBridge,
  useProvider,
  useTokenContract,
} from '@vegaprotocol/web3';
import { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useGetAllowance } from './use-get-allowance';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import {
  useGetDepositMaximum,
  useIsExemptDepositor,
} from './use-get-deposit-maximum';
import { useGetDepositedAmount } from './use-get-deposited-amount';
import { localLoggerFactory } from '@vegaprotocol/logger';
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

  const assetData = useMemo(() => {
    const assetChainId =
      asset?.source.__typename === 'ERC20'
        ? Number(asset.source.chainId)
        : undefined;
    const assetSource =
      asset?.source.__typename === 'ERC20'
        ? asset.source.contractAddress
        : undefined;
    const assetData =
      assetChainId && assetSource
        ? {
            chainId: assetChainId,
            contractAddress: assetSource,
          }
        : undefined;
    return assetData;
  }, [asset]);

  const { provider, error: providerError } = useProvider(assetData?.chainId);

  const {
    contract: collateralBridgeContract,
    address: collateralBridgeContractAddress,
    error: collateralBridgeContractError,
  } = useCollateralBridge(assetData?.chainId);
  const { contract: tokenContract, error: tokenContractError } =
    useTokenContract(assetData);

  const getAllowance = useGetAllowance(
    tokenContract,
    collateralBridgeContractAddress,
    account
  );
  const getBalance = useGetBalanceOfERC20Token(tokenContract, account);
  const getDepositMaximum = useGetDepositMaximum(
    collateralBridgeContract,
    assetData?.contractAddress
  );
  const isExemptDepositor = useIsExemptDepositor(
    collateralBridgeContract,
    account
  );
  const getDepositedAmount = useGetDepositedAmount(
    provider,
    assetData?.contractAddress,
    collateralBridgeContractAddress,
    account
  );

  const [state, setState] = useState<DepositBalances | null>(null);

  const getBalances = useCallback(async () => {
    if (!assetData) return;
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposit balances', { asset: assetData });
      setState(null);
      const [max, deposited, balance, allowance, exempt] = await Promise.all([
        getDepositMaximum(),
        getDepositedAmount(),
        getBalance(),
        getAllowance(),
        isExemptDepositor(),
      ]);

      const state = {
        max: max ?? initialState.max,
        deposited: deposited ?? initialState.deposited,
        balance: balance ?? initialState.balance,
        allowance: allowance ?? initialState.allowance,
        exempt,
      };
      logger.info('get deposit balances', { state });

      setState(state);
    } catch (err) {
      logger.error('get deposit balances', err);
      setState(null);
    }
  }, [
    assetData,
    getAllowance,
    getBalance,
    getDepositMaximum,
    getDepositedAmount,
    isExemptDepositor,
  ]);
  const reset = useCallback(() => {
    setState(null);
  }, []);
  return {
    balances: state,
    getBalances,
    reset,
    error: providerError || tokenContractError || collateralBridgeContractError,
  };
};
