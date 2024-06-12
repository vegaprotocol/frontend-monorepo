import { useEffect } from 'react';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useBalancesStore } from '@vegaprotocol/assets';
import { Balance } from '@vegaprotocol/assets';
import { type AssetData, useTokenContract } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { toBigNum } from '@vegaprotocol/utils';

const REFETCH_DELAY = 5000;

export const AssetBalance = ({ assetData }: { assetData?: AssetData }) => {
  const { account } = useWeb3React();

  const { contract, error } = useTokenContract(assetData);

  const [setBalance, getBalance] = useBalancesStore((state) => [
    state.setBalance,
    state.getBalance,
  ]);

  const ethBalanceFetcher = useGetBalanceOfERC20Token(contract, account);

  useEffect(() => {
    let ignore = false;

    const fetchBalance = async () => {
      if (!assetData) return;

      const cachedBalance = getBalance(assetData.id);

      if (
        !cachedBalance ||
        Date.now() - cachedBalance.updatedAt > REFETCH_DELAY
      ) {
        const balance = await ethBalanceFetcher();

        if (ignore) return;

        setBalance({
          asset: assetData,
          balanceOnEth: balance
            ? toBigNum(balance, assetData.decimals)
            : undefined,
          ethBalanceFetcher,
        });
      }
    };

    fetchBalance();

    return () => {
      ignore = true;
    };
  }, [assetData, getBalance, ethBalanceFetcher, setBalance]);

  if (!assetData) return null;

  const balance = getBalance(assetData.id)?.balanceOnEth?.toString();

  if (error && !balance) {
    return <span className="text-xs text-muted">-</span>;
  }

  return <Balance balance={balance} symbol={assetData.symbol} />;
};
