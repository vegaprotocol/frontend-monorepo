import { type Market } from '@vegaprotocol/markets';
import {
  Button,
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
  type Banner,
  DISMISSAL_PERIOD,
  useMarketBanners,
  useMarketBannerStore,
} from '../../lib/hooks/use-market-banners';
import {
  DispatchMetricDescription,
  DispatchMetricLabels,
} from '@vegaprotocol/types';
import { t } from '../../lib/use-t';
import { Link } from 'react-router-dom';
import { Links } from '../../lib/links';
import compact from 'lodash/compact';

export const MarketBannerIndicator = ({
  market,
  kind,
  className,
}: {
  market: Market;
  kind: Banner['kind'];
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

export const MarketBanner = ({ market }: { market: Market }) => {
  const { banners, loading } = useMarketBanners(market);

  if (loading) {
    return null;
  }

  return <BannerQueue banners={banners} market={market} />;
};

const mapBanner = (market: Market, banner: Banner) => {
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
    case 'Generic': {
      content = <span>{banner.message}</span>;
      intent = Intent.Info;
      break;
    }
    case 'ActiveReward': {
      const metric = banner.game.transfer?.kind.dispatchStrategy.dispatchMetric;
      const gameId = banner.game.transfer?.gameId;
      if (!metric || !gameId) return null;
      content = (
        <span className="flex gap-1">
          <span className="font-bold antialiased">{t('Active reward')}: </span>
          <span className="font-bold antialiased">
            {DispatchMetricLabels[metric]}
          </span>
          <span>{DispatchMetricDescription[metric]}</span>
          <Link className="underline" to={Links.COMPETITIONS_GAME(gameId)}>
            {t('Learn more')}
          </Link>
        </span>
      );
      intent = Intent.Info;
      break;
    }
    default: {
      return null;
    }
  }

  return {
    content,
    intent,
    kind: banner.kind,
  };
};

const BannerQueue = ({
  banners,
  market,
}: {
  banners: Banner[];
  market: Market;
}) => {
  const bannerInfos = useMarketBannerStore((state) => state.banners);
  const setBanner = useMarketBannerStore((state) => state.setBanner);
  const current = useMarketBannerStore((state) => state.current);
  const setCurrent = useMarketBannerStore((state) => state.setCurrent);

  const dismissedKinds = bannerInfos
    .filter((bi) => {
      const age = Date.now() - bi.ts;
      if (age <= DISMISSAL_PERIOD) {
        return true;
      }
      return false;
    })
    .map((bi) => bi.kind);

  const notDismissedBanners = banners.filter(
    (b) => !dismissedKinds.includes(b.kind)
  );

  const displayableBanners = compact(
    notDismissedBanners.map((b) => mapBanner(market, b))
  );

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
      intent={currentBanner.intent}
      onClose={onClose}
      data-testid="market-banner"
      prefixElement={
        currentBanner.kind === 'ActiveReward' ? (
          <VegaIcon name={VegaIconNames.TROPHY} className="mr-2" />
        ) : undefined
      }
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
          <VegaIcon className="block" name={VegaIconNames.ARROW_RIGHT} />
        </div>
      </Button>
    </Tooltip>
  );
};
