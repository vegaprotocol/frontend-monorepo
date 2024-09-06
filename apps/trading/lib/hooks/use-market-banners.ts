import type { ReactNode } from 'react';
import compact from 'lodash/compact';
import {
  type Market,
  useMaliciousOracle,
  useMarketState,
  useMarketTradingMode,
} from '@vegaprotocol/markets';
import type { ProposalFragment } from '@vegaprotocol/proposals';
import {
  type DispatchStrategy,
  MarketState,
  MarketTradingMode,
  type StakingDispatchStrategy,
} from '@vegaprotocol/types';
import {
  useSuccessorMarketProposals,
  useUpdateMarketProposals,
  useUpdateMarketStateProposals,
} from './use-market-proposals';
import { SECOND } from '@vegaprotocol/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type EnrichedRewardTransfer, useRewards } from './use-rewards';

type Oracle = ReturnType<typeof useMaliciousOracle>['data'];

type UpdateMarketBanner = {
  kind: 'UpdateMarket';
  proposals: ProposalFragment[];
};

type UpdateMarketStateBanner = {
  kind: 'UpdateMarketState';
  proposals: ProposalFragment[];
};

type NewMarketBanner = {
  kind: 'NewMarket'; // aka a proposal of NewMarket which succeeds the current market
  proposals: ProposalFragment[];
};

type SettledBanner = {
  kind: 'Settled';
  market: Market;
};

type SuspendedBanner = {
  kind: 'Suspended';
  market: Market;
};

type MonitoringAuctionBanner = {
  kind: 'MonitoringAuction';
  market: Market;
};

type OracleBanner = {
  kind: 'Oracle';
  oracle: Oracle;
};

type GenericMessageBanner = {
  kind: 'Generic';
  message: ReactNode;
};

type ActiveRewardBanner = {
  kind: 'ActiveReward';
  game: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
};

export type Banner =
  | ActiveRewardBanner
  | GenericMessageBanner
  | MonitoringAuctionBanner
  | NewMarketBanner
  | OracleBanner
  | SettledBanner
  | SuspendedBanner
  | UpdateMarketBanner
  | UpdateMarketStateBanner;

export const useMarketBanners = (
  market: Market
): { banners: Banner[]; loading: boolean } => {
  const { data: marketState } = useMarketState(market.id);
  const { data: marketTradingMode } = useMarketTradingMode(market.id);

  const { proposals: successorProposals, loading: successorLoading } =
    useSuccessorMarketProposals(market.id);

  const { proposals: updateMarketProposals, loading: updateMarketLoading } =
    useUpdateMarketProposals(market.id);

  const {
    proposals: updateMarketStateProposals,
    loading: updateMarketStateLoading,
  } = useUpdateMarketStateProposals(market.id);

  const { data: maliciousOracle, loading: oracleLoading } = useMaliciousOracle(
    market.id
  );

  const { data: gamesData, loading: gamesLoading } = useRewards({
    onlyActive: true,
  });

  // TODO: What if a game is not scoped to any market? Should it be displayed here as well?
  const gamesForMarket = gamesData.filter((g) =>
    g.markets?.map((m) => m.id).includes(market.id)
  );

  const loading =
    successorLoading ||
    updateMarketLoading ||
    updateMarketStateLoading ||
    oracleLoading ||
    gamesLoading;

  const banners = compact([
    updateMarketStateProposals.length
      ? {
          kind: 'UpdateMarketState' as const,
          proposals: updateMarketStateProposals,
        }
      : undefined,
    updateMarketProposals.length
      ? {
          kind: 'UpdateMarket' as const,
          proposals: updateMarketProposals,
        }
      : undefined,
    successorProposals.length
      ? {
          kind: 'NewMarket' as const,
          proposals: successorProposals,
        }
      : undefined,
    marketState === MarketState.STATE_SETTLED
      ? {
          kind: 'Settled' as const,
          market,
        }
      : undefined,
    marketState === MarketState.STATE_SUSPENDED_VIA_GOVERNANCE
      ? {
          kind: 'Suspended' as const,
          market,
        }
      : undefined,
    marketState === MarketState.STATE_SUSPENDED &&
    (marketTradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION ||
      marketTradingMode === MarketTradingMode.TRADING_MODE_LONG_BLOCK_AUCTION)
      ? {
          kind: 'MonitoringAuction' as const,
          market,
        }
      : undefined,
    maliciousOracle !== undefined
      ? {
          kind: 'Oracle' as const,
          oracle: maliciousOracle,
        }
      : undefined,

    ...gamesForMarket.map((g) => ({
      kind: 'ActiveReward' as const,
      game: g,
    })),
  ]);

  return {
    banners,
    loading,
  };
};

export const DISMISSAL_PERIOD = 3000 * SECOND;

type MarketBannerInfo = {
  marketId: string;
  kind: Banner['kind'];
  ts: number;
};

type MarketBannerStore = {
  current: number;
  banners: MarketBannerInfo[];
};
type MarketBannerStoreActions = {
  setBanner: (marketId: string, kind: Banner['kind']) => void;
  reset: (marketId: string, kinds?: Banner['kind'][]) => void;
  setCurrent: (current: number) => void;
};

export const useMarketBannerStore = create<
  MarketBannerStore & MarketBannerStoreActions
>()(
  persist(
    (set, get) => ({
      current: 0,
      banners: [],
      setBanner: (marketId, kind) => {
        let banners = get().banners.filter(
          (bi) => !(bi.marketId === marketId && bi.kind === kind)
        );
        banners = [...banners, { marketId, kind, ts: Date.now() }];
        set({ banners });
      },
      reset: (marketId, kinds) => {
        const banners = [...get().banners];
        const other = kinds
          ? banners.filter(
              (b) => !(b.marketId === marketId && kinds.includes(b.kind))
            )
          : banners.filter((b) => b.marketId !== marketId);
        set({ banners: other });
      },
      setCurrent: (current) => set({ current }),
    }),
    {
      name: 'vega_market_banner_store',
      version: 1,
      partialize: (state) => ({ banners: state.banners }),
    }
  )
);
