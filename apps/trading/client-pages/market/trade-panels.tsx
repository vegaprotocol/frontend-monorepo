import { type PinnedAsset } from '@vegaprotocol/accounts';
import { type Market } from '@vegaprotocol/markets';
import { OracleBanner } from '@vegaprotocol/markets';
import { useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import {
  MarketSuccessorBanner,
  MarketSuccessorProposalBanner,
  MarketTerminationBanner,
} from '../../components/market-banner';
import { ErrorBoundary } from '../../components/error-boundary';
import { type TradingView } from './trade-views';
import { TradingViews } from './trade-views';
import { useFeatureFlags } from '@vegaprotocol/environment';

interface TradePanelsProps {
  market: Market | null;
  pinnedAsset?: PinnedAsset;
}

export const TradePanels = ({ market, pinnedAsset }: TradePanelsProps) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const [view, setView] = useState<TradingView>('chart');

  const renderView = () => {
    const Component = TradingViews[view].component;

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    if (!market) return <NoMarketSplash />;

    // Watch out here, we don't know what component is being rendered
    // so watch out for clashes in props
    return (
      <ErrorBoundary feature={view}>
        <Component marketId={market?.id} pinnedAsset={pinnedAsset} />;
      </ErrorBoundary>
    );
  };

  const renderMenu = () => {
    const viewCfg = TradingViews[view];

    if ('menu' in viewCfg) {
      const Menu = viewCfg.menu;

      return (
        <div className="flex gap-1 p-1 bg-vega-clight-800 dark:bg-vega-cdark-800 border-b border-default">
          <Menu />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_min-content_1fr_min-content]">
      <div>
        {featureFlags.SUCCESSOR_MARKETS && (
          <>
            <MarketSuccessorBanner market={market} />
            <MarketSuccessorProposalBanner marketId={market?.id} />
          </>
        )}
        <MarketTerminationBanner market={market} />
        <OracleBanner marketId={market?.id || ''} />
      </div>
      <div>{renderMenu()}</div>
      <div className="h-full">
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }} className="overflow-auto">
              {renderView()}
            </div>
          )}
        </AutoSizer>
      </div>
      <div className="flex flex-nowrap overflow-x-auto max-w-full border-t border-default">
        {Object.keys(TradingViews)
          // filter to control available views for the current market
          // eg only perps should get the funding views
          .filter((_key) => {
            const key = _key as TradingView;
            const perpOnlyViews = ['funding', 'fundingPayments'];

            if (
              market?.tradableInstrument.instrument.product.__typename ===
              'Perpetual'
            ) {
              return true;
            }

            if (perpOnlyViews.includes(key)) {
              return false;
            }

            return true;
          })
          .map((_key) => {
            const key = _key as TradingView;
            const isActive = view === key;
            return (
              <ViewButton
                key={key}
                view={key}
                isActive={isActive}
                onClick={() => setView(key)}
              />
            );
          })}
      </div>
    </div>
  );
};

export const NoMarketSplash = () => {
  const t = useT();
  return <Splash>{t('No market')}</Splash>;
};

const ViewButton = ({
  view,
  isActive,
  onClick,
}: {
  view: TradingView;
  isActive: boolean;
  onClick: () => void;
}) => {
  const label = useViewLabel(view);
  const className = classNames('py-2 px-4 min-w-[100px] capitalize text-sm', {
    'bg-vega-clight-500 dark:bg-vega-cdark-500': isActive,
  });

  return (
    <button data-testid={view} onClick={onClick} className={className}>
      {label}
    </button>
  );
};

const useViewLabel = (view: TradingView) => {
  const t = useT();

  const labels = {
    chart: t('Chart'),
    depth: t('Depth'),
    liquidity: t('Liquidity'),
    funding: t('Funding'),
    fundingPayments: t('Funding Payments'),
    orderbook: t('Orderbook'),
    trades: t('Trades'),
    positions: t('Positions'),
    activeOrders: t('Active'),
    closedOrders: t('Closed'),
    rejectedOrders: t('Rejected'),
    orders: t('All'),
    stopOrders: t('Stop'),
    collateral: t('Collateral'),
    fills: t('Fills'),
  };

  return labels[view];
};
