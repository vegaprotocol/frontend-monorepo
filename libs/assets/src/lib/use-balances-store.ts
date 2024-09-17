import type BigNumber from 'bignumber.js';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toBigNum } from '@vegaprotocol/utils';

type AssetWithBalance = {
  asset: {
    id: string;
    decimals: number;
    contractAddress: string;
    chainId: number;
  };
  balanceOnEth?: BigNumber;
  balanceOnVega?: BigNumber;
  updatedAt: number;
};

type SetBalanceArgs = Omit<AssetWithBalance, 'updatedAt'> & {
  ethBalanceFetcher?: () => Promise<BigNumber | undefined>;
};

type BalancesStore = {
  balances: (AssetWithBalance & { fetchFromEth?: () => void })[];
  getBalance: (assetId: string) => AssetWithBalance | undefined;
  setBalance: (args: SetBalanceArgs) => void;
  refetch: (assetId: string) => void;
};

export const useBalancesStore = create(
  immer<BalancesStore>((set, get) => ({
    balances: [],
    getBalance: (assetId) =>
      get().balances.find(({ asset: a }) => a.id === assetId),
    setBalance: ({ asset, balanceOnEth, balanceOnVega, ethBalanceFetcher }) => {
      set((state) => {
        const found = state.balances.find(({ asset: a }) => a.id === asset.id);
        const fetchFromEth = ethBalanceFetcher
          ? () => {
              if (!ethBalanceFetcher) return;
              ethBalanceFetcher()
                .then((balance) => {
                  if (balance) {
                    get().setBalance({
                      asset,
                      balanceOnEth: toBigNum(balance, asset.decimals),
                    });
                  }
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          : undefined;

        if (found) {
          if (balanceOnEth) found.balanceOnEth = balanceOnEth;
          if (balanceOnVega) found.balanceOnVega = balanceOnVega;
          if (fetchFromEth) found.fetchFromEth = fetchFromEth;
          found.updatedAt = Date.now();
        } else {
          state.balances.push({
            asset,
            balanceOnEth,
            balanceOnVega,
            fetchFromEth,
            updatedAt: Date.now(),
          });
        }
      });
    },
    refetch: (assetId) => {
      const found = get().balances.find((a) => a.asset.id === assetId);
      found?.fetchFromEth?.();
    },
  }))
);
