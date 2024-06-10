import { useCallback, useEffect } from 'react';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useBalancesStore } from '@vegaprotocol/assets';
import { Balance } from '@vegaprotocol/assets';
import {
  type AssetData,
  useTokenContract,
  getChainName,
} from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { toBigNum } from '@vegaprotocol/utils';
import { useT } from './use-t';

const REFETCH_DELAY = 5000;

export const AssetBalance = ({ assetData }: { assetData?: AssetData }) => {
  const t = useT();
  const { account } = useWeb3React();

  const { contract, error } = useTokenContract(assetData);

  const [setBalance, getBalance] = useBalancesStore((state) => [
    state.setBalance,
    state.getBalance,
  ]);

  const ethBalanceFetcher = useGetBalanceOfERC20Token(contract, account);

  const fetchFromEth = useCallback(
    async (ignore = false) => {
      if (ignore) return;
      if (!assetData) return;

      const balance = await ethBalanceFetcher();
      setBalance({
        asset: assetData,
        balanceOnEth: balance
          ? toBigNum(balance, assetData.decimals)
          : undefined,
        ethBalanceFetcher,
      });
    },
    [assetData, ethBalanceFetcher, setBalance]
  );

  useEffect(() => {
    let ignore = false;

    if (!assetData) return;
    const balance = getBalance(assetData.id);
    if (!balance || Date.now() - balance.updatedAt > REFETCH_DELAY) {
      fetchFromEth(ignore);
    }
    return () => {
      ignore = true;
    };
  }, [assetData, fetchFromEth, getBalance]);

  if (!assetData) return null;

  const balance = getBalance(assetData.id)?.balanceOnEth?.toString();

  if (error && !balance) {
    return (
      <span className="text-xs text-muted">
        {t('Requires connection to {{chainName}}', {
          chainName: getChainName(assetData.chainId),
        })}
      </span>
    );
  }

  return <Balance balance={balance} symbol={assetData.symbol} />;
};
