import { type PinnedAsset } from '@vegaprotocol/accounts';
import { type Market } from '@vegaprotocol/markets';
import { OracleBanner } from '@vegaprotocol/markets';
import { useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { Splash, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
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
  const [settingsOpened, setSettingsOpened] = useState(false);
  const viewCfg = TradingViews[view];

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
    if ('menu' in viewCfg || 'settings' in viewCfg) {
      return (
        <div className="flex items-center justify-end gap-1 p-1 bg-vega-clight-800 dark:bg-vega-cdark-800 border-b border-default">
          {'menu' in viewCfg ? <viewCfg.menu /> : null}
          {'settings' in viewCfg ? (
            <button
              className="ml-1 flex items-center justify-center h-6 w-6"
              onClick={() => setSettingsOpened((v) => !v)}
            >
              <VegaIcon name={VegaIconNames.COG} size={16} />
            </button>
          ) : null}
        </div>
      );
    }
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
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
      <div className="h-full grid grid-rows-[min-content_1fr] relative">
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
        {settingsOpened && 'settings' in viewCfg ? (
          <div className="absolute right-0 top-0 bottom-0 w-[280px] max-w-full bg-vega-clight-700 dark:bg-vega-cdark-700 z-10">
            <div className="grid grid-rows-[32px_1fr]">
              <div className="flex justify-end p-1">
                <button
                  type="button"
                  data-testid="settings-close"
                  onClick={() => setSettingsOpened(false)}
                  className="flex items-center justify-center h-6 w-6"
                >
                  <VegaIcon name={VegaIconNames.CROSS} size={12} />
                </button>
              </div>
              <div className="relative h-full overflow-auto p-2">
                <viewCfg.settings />
              </div>
            </div>
          </div>
        ) : null}
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
                onClick={() => {
                  setSettingsOpened(false);
                  setView(key);
                }}
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
