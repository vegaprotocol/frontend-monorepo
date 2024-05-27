import { useCallback, useEffect, useMemo } from 'react';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useBalancesStore } from '@vegaprotocol/assets';
import { Balance } from '@vegaprotocol/assets';
import { useTokenContract } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { isAssetTypeERC20, toBigNum } from '@vegaprotocol/utils';

const REFETCH_DELAY = 5000;

export const AssetBalance = ({ asset }: { asset: AssetFieldsFragment }) => {
  const { account } = useWeb3React();

  const assetData = useMemo(
    () =>
      isAssetTypeERC20(asset)
        ? {
            id: asset.id,
            contractAddress: asset.source.contractAddress,
            chainId: Number(asset.source.chainId),
            decimals: asset.decimals,
          }
        : undefined,
    [asset]
  );

  const { contract } = useTokenContract(assetData, true);

  const [setBalance, getBalance] = useBalancesStore((state) => [
    state.setBalance,
    state.getBalance,
  ]);

  const ethBalanceFetcher = useGetBalanceOfERC20Token(contract, account);

  const fetchFromEth = useCallback(async () => {
    if (!assetData) return;

    const balance = await ethBalanceFetcher();
    setBalance({
      asset: assetData,
      balanceOnEth: balance ? toBigNum(balance, asset.decimals) : undefined,
      ethBalanceFetcher,
    });
  }, [asset.decimals, assetData, ethBalanceFetcher, setBalance]);

  useEffect(() => {
    const balance = getBalance(asset.id);
    if (!balance || Date.now() - balance.updatedAt > REFETCH_DELAY) {
      fetchFromEth();
    }
  }, [asset.id, fetchFromEth, getBalance]);

  return (
    <Balance
      balance={getBalance(asset.id)?.balanceOnEth?.toString()}
      symbol={asset.symbol}
    />
  );
};
