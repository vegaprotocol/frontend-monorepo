import compact from 'lodash/compact';
import { MarketState } from '@vegaprotocol/types';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';
import { useMarketState, useMarket, type Market } from '@vegaprotocol/markets';
import { useState } from 'react';
import { type MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';
import { MarketSuspendedBanner } from './market-suspended-banner';
import { MarketUpdateBanner } from './market-update-banner';
import { MarketUpdateStateBanner } from './market-update-state-banner';
import { MarketSuccessorBanner } from './market-successor-banner';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import {
  useSuccessorMarketProposals,
  useUpdateMarketProposals,
  useUpdateMarketStateProposals,
} from './use-market-proposals';

type UpdateMarketBanner = {
  kind: 'UpdateMarket';
  proposals: MarketViewProposalFieldsFragment[];
};

type UpdateMarketStateBanner = {
  kind: 'UpdateMarketState';
  proposals: MarketViewProposalFieldsFragment[];
};

type NewMarketBanner = {
  kind: 'NewMarket'; // aka a proposal of NewMarket which succeeds the current market
  proposals: MarketViewProposalFieldsFragment[];
};

type SettledBanner = {
  kind: 'Settled';
  market: Market;
};

type SuspendedBanner = {
  kind: 'Suspended';
  market: Market;
};

type Banner =
  | UpdateMarketBanner
  | UpdateMarketStateBanner
  | NewMarketBanner
  | SettledBanner
  | SuspendedBanner;

export const MarketBanner = ({ marketId }: { marketId: string }) => {
  const { data: market } = useMarket(marketId);
  const { data: marketState } = useMarketState(marketId);

  const { proposals: successorProposals, loading: successorLoading } =
    useSuccessorMarketProposals(marketId);

  const { proposals: updateMarketProposals, loading: updateMarketLoading } =
    useUpdateMarketProposals(marketId);

  const {
    proposals: updateMarketStateProposals,
    loading: updateMarketStateLoading,
  } = useUpdateMarketStateProposals(marketId);

  if (!market) {
    return null;
  }

  const loading =
    successorLoading || updateMarketLoading || updateMarketStateLoading;

  if (loading) {
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
  ]);

  return <BannerQueue banners={banners} market={market} />;
};

const BannerQueue = ({
  banners,
  market,
}: {
  banners: Banner[];
  market: Market;
}) => {
  // for showing banner by index
  const [index, setIndex] = useState(0);

  const banner = banners[index];
  if (!banner) return null;

  let content = null;

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
      break;
    }
    case 'Settled': {
      content = <MarketSuccessorBanner market={market} />;
      break;
    }
    case 'Suspended': {
      content = <MarketSuspendedBanner />;
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
    <NotificationBanner intent={Intent.Primary} onClose={onClose}>
      <div className="flex justify-between">
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
