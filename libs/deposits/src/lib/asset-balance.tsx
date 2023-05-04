import { useCallback, useEffect } from 'react';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useBalancesStore } from '@vegaprotocol/assets';
import { Balance } from '@vegaprotocol/assets';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import { useTokenContract } from '@vegaprotocol/web3';

const REFETCH_DELAY = 5000;

export const AssetBalance = ({ asset }: { asset: AssetFieldsFragment }) => {
  const [setBalance, getBalance] = useBalancesStore((state) => [
    state.setBalance,
    state.getBalance,
  ]);

  const tokenContract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined
  );
  const ethBalanceFetcher = useGetBalanceOfERC20Token(tokenContract, asset);

  const fetchFromEth = useCallback(async () => {
    const balance = await ethBalanceFetcher();
    if (balance) {
      setBalance({ asset, balanceOnEth: balance, ethBalanceFetcher });
    }
  }, [asset, ethBalanceFetcher, setBalance]);

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
