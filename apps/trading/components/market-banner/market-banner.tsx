import { type Market } from '@vegaprotocol/markets';
import {
  Button,
  getIntentIcon,
  Intent,
  NotificationBanner,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { MarketOracleBanner } from './market-oracle-banner';
import { MarketSettledBanner } from './market-settled-banner';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import { MarketSuspendedBanner } from './market-suspended-banner';
import { MarketUpdateBanner } from './market-update-banner';
import { MarketUpdateStateBanner } from './market-update-state-banner';
import { MarketAuctionBanner } from './market-monitoring-auction';
import {
  type Banner as IBanner,
  DISMISSAL_PERIOD,
  useMarketBanners,
  useMarketBannerStore,
} from '../../lib/hooks/use-market-banners';
import compact from 'lodash/compact';
import { MarketRewardBanner } from './market-reward-banner';

export const MarketBannerIndicator = ({
  market,
  kind,
  className,
}: {
  market: Market;
  kind: IBanner['kind'];
  className?: string;
}) => {
  const bannerInfos = useMarketBannerStore((state) => state.banners);
  const reset = useMarketBannerStore((state) => state.reset);
  const { banners, loading } = useMarketBanners(market);
  const bi = bannerInfos.find(
    (bi) => bi.marketId === market.id && bi.kind === kind
  );

  if (loading) return null;

  const ofKind = banners.filter((b) => b.kind === kind);
  let isDismissed = false;
  if (bi) {
    const age = Date.now() - bi.ts;
    if (age <= DISMISSAL_PERIOD) {
      isDismissed = true;
    }
  }

  if (isDismissed && ofKind.length > 0) {
    switch (kind) {
      case 'ActiveReward':
        return (
          <button
            onClick={() => {
              reset(market.id, [kind]);
            }}
            className={className}
          >
            <VegaIcon name={VegaIconNames.TROPHY} size={16} />
          </button>
        );
      case 'Generic':
        return (
          <button
            onClick={() => {
              reset(market.id, [kind]);
            }}
            className={['relative', className].join(' ')}
          >
            <VegaIcon name={VegaIconNames.INFO} size={16} />
            <div className="absolute top-2 left-2 bg-gs-500 text-gs-100 dark:bg-gs-500 dark:text-gs-100 rounded-full text-2xs leading-none pt-px w-3 h-3">
              {ofKind.length}
            </div>
          </button>
        );
    }
  }

  return null;
};

export const MarketBanner = (props: { market: Market }) => {
  const { notDismissedBanners, loading } = useMarketBanners(props.market);
  if (loading) {
    return null;
  }

  if (!notDismissedBanners.length) {
    return null;
  }

  return <BannerQueue banners={notDismissedBanners} market={props.market} />;
};

const mapBanner = (market: Market, banner: IBanner) => {
  let content = null;
  let intent = Intent.Info;
  let icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;

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
      icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;
      break;
    }
    case 'Settled': {
      content = <MarketSettledBanner market={market} />;
      break;
    }
    case 'Suspended': {
      content = <MarketSuspendedBanner />;
      intent = Intent.Warning;
      icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;
      break;
    }
    case 'MonitoringAuction': {
      content = <MarketAuctionBanner market={market} />;
      icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;
      break;
    }
    case 'Oracle': {
      // @ts-ignore oracle cannot be undefined
      content = <MarketOracleBanner oracle={banner.oracle} />;
      intent = Intent.Danger;
      icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;
      break;
    }
    case 'Generic': {
      content = <p>{banner.message}</p>;
      icon = <VegaIcon name={getIntentIcon(intent)} size={16} />;
      break;
    }
    case 'ActiveReward': {
      const metric = banner.game.transfer?.kind.dispatchStrategy.dispatchMetric;
      const gameId = banner.game.transfer?.gameId;
      if (!metric || !gameId) return null;
      content = <MarketRewardBanner metric={metric} gameId={gameId} />;
      intent = Intent.Primary;
      icon = <VegaIcon name={VegaIconNames.TROPHY} size={16} />;
      break;
    }
    default: {
      return null;
    }
  }

  return {
    content,
    intent,
    icon,
    kind: banner.kind,
  };
};

const BannerQueue = ({
  banners,
  market,
}: {
  banners: IBanner[];
  market: Market;
}) => {
  const setBanner = useMarketBannerStore((state) => state.setBanner);
  const current = useMarketBannerStore((state) => state.current);
  const setCurrent = useMarketBannerStore((state) => state.setCurrent);

  const displayableBanners = compact(banners.map((b) => mapBanner(market, b)));

  const currentBanner = displayableBanners[current];
  if (!currentBanner) return null;

  const showCount = displayableBanners.length > 1;

  const onClose = () => {
    setBanner(market.id, currentBanner.kind);
    setCurrent(0);
  };

  const showNext = () => {
    const count = displayableBanners.length;
    let next = current + 1;
    if (next >= count) {
      next = 0;
    }
    setCurrent(next);
  };

  return (
    <NotificationBanner
      intent={Intent.Primary}
      icon={currentBanner.icon}
      onClose={onClose}
      data-testid="market-banner"
      className="rounded-grid bg-surface-1/70"
    >
      <div className="flex items-center justify-between">
        {currentBanner.content}
        {showCount ? (
          <NextBannerButton
            current={current}
            count={displayableBanners.length}
            onClick={showNext}
          />
        ) : null}
      </div>
    </NotificationBanner>
  );
};

const NextBannerButton = ({
  current,
  count,
  onClick,
}: {
  current: number;
  count: number;
  onClick?: () => void;
}) => {
  return (
    <Tooltip description={`${current + 1}/${count}`} side="left" align="center">
      <Button className="w-6 h-6 p-0 rounded-full relative" onClick={onClick}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <VegaIcon
            className="block"
            size={16}
            name={VegaIconNames.ARROW_RIGHT}
          />
        </div>
      </Button>
    </Tooltip>
  );
};
