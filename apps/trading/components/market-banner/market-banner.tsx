import type { ProposalFragment } from '@vegaprotocol/proposals';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import { useState } from 'react';
import { MarketOracleBanner } from './market-oracle-banner';
import { MarketSettledBanner } from './market-settled-banner';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import { MarketSuspendedBanner } from './market-suspended-banner';
import { MarketUpdateBanner } from './market-update-banner';
import { MarketUpdateStateBanner } from './market-update-state-banner';
import {
  useSuccessorMarketProposals,
  useUpdateMarketProposals,
  useUpdateMarketStateProposals,
} from './use-market-proposals';
import { MarketAuctionBanner } from './market-monitoring-auction';
import {
  type Market,
  useMarket,
  useMaliciousOracleProvider,
  type Provider,
} from '@vegaprotocol/data-provider';

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
  oracle: { provider: Provider; dataSourceSpecId: string };
};

type Banner =
  | UpdateMarketBanner
  | UpdateMarketStateBanner
  | NewMarketBanner
  | SettledBanner
  | SuspendedBanner
  | MonitoringAuctionBanner
  | OracleBanner;

export const MarketBanner = ({ marketId }: { marketId: string }) => {
  const { data: market } = useMarket({ marketId });

  const marketState = market?.data?.marketState;
  const marketTradingMode = market?.data?.marketTradingMode;

  const { proposals: successorProposals, loading: successorLoading } =
    useSuccessorMarketProposals(marketId);

  const { proposals: updateMarketProposals, loading: updateMarketLoading } =
    useUpdateMarketProposals(marketId);

  const {
    proposals: updateMarketStateProposals,
    loading: updateMarketStateLoading,
  } = useUpdateMarketStateProposals(marketId);

  const maliciousOracleProvider = useMaliciousOracleProvider({ marketId });

  const loading =
    successorLoading || updateMarketLoading || updateMarketStateLoading;

  if (loading) {
    return null;
  }

  if (!market) {
    return null;
  }

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
    marketTradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION
      ? {
          kind: 'MonitoringAuction' as const,
          market,
        }
      : undefined,
    maliciousOracleProvider
      ? {
          kind: 'Oracle' as const,
          oracle: maliciousOracleProvider,
        }
      : undefined,
  ]);

  return <BannerQueue banners={banners} market={market} />;
};

const BannerQueue = ({
  banners,
  market,
}: {
  banners: Banner[];
  market?: Market;
}) => {
  // for showing banner by index
  const [index, setIndex] = useState(0);

  const banner = banners[index];
  if (!market) return null;
  if (!banner) return null;

  let content = null;
  let intent = Intent.Primary;

  switch (banner.kind) {
    case 'UpdateMarket': {
      content = <MarketUpdateBanner proposals={banner.proposals} />;
      break;
    }
    case 'UpdateMarketState': {
      content = (
        <MarketUpdateStateBanner proposals={banner.proposals} market={market} />
      );
      break;
    }
    case 'NewMarket': {
      content = <MarketSuccessorProposalBanner proposals={banner.proposals} />;
      intent = Intent.Warning;
      break;
    }
    case 'Settled': {
      content = <MarketSettledBanner market={market} />;
      break;
    }
    case 'Suspended': {
      content = <MarketSuspendedBanner />;
      intent = Intent.Warning;
      break;
    }
    case 'MonitoringAuction': {
      content = <MarketAuctionBanner market={market} />;
      intent = Intent.Primary;
      break;
    }
    case 'Oracle': {
      // @ts-ignore oracle cannot be undefined
      content = <MarketOracleBanner oracle={banner.oracle} />;
      intent = Intent.Danger;
      break;
    }
    default: {
      return null;
    }
  }

  const showCount = banners.length > 1;

  const onClose = () => {
    setIndex((x) => x + 1);
  };

  return (
    <NotificationBanner
      intent={intent}
      onClose={onClose}
      data-testid="market-banner"
    >
      <div className="flex items-center justify-between">
        {content}
        {showCount ? (
          <p>
            {index + 1}/{banners.length}
          </p>
        ) : null}
      </div>
    </NotificationBanner>
  );
};
