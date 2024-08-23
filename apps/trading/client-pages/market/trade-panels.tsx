import { type Market } from '@vegaprotocol/markets';
// TODO: handle oracle banner
// import { OracleBanner } from '@vegaprotocol/markets';
import { useState } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import {
  Popover,
  Splash,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { type TradingView } from './trade-views';
import { TradingViews } from './trade-views';
import { MobileMarketHeader } from '../../components/market-header';
import { MarketActionDrawer } from '../markets/mobile-buttons';

interface TradePanelsProps {
  market: Market;
  pinnedAssets?: string[];
}

export const TradePanels = ({ market, pinnedAssets }: TradePanelsProps) => {
  const [topView, setTopView] = useState<TradingView>('chart');
  const topViewCfg = TradingViews[topView];
  const [bottomView, setBottomView] = useState<TradingView>('positions');
  const bottomViewCfg = TradingViews[bottomView];

  const renderView = (view: TradingView) => {
    const Component = TradingViews[view].component;

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    if (!market) return <NoMarketSplash />;

    // Watch out here, we don't know what component is being rendered
    // so watch out for clashes in props
    return (
      <ErrorBoundary feature={view}>
        <Component marketId={market?.id} pinnedAssets={pinnedAssets} />
      </ErrorBoundary>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMenu = (viewCfg: any) => {
    if ('menu' in viewCfg || 'settings' in viewCfg) {
      return (
        <div className="flex items-center justify-end gap-1 p-1 bg-surface-1  border-b border-gs-300 dark:border-gs-700 shrink-0">
          {'menu' in viewCfg ? <viewCfg.menu /> : null}
          {'settings' in viewCfg ? (
            <Popover
              align="end"
              trigger={
                <span className="ml-1 flex items-center justify-center h-6 w-6">
                  <VegaIcon name={VegaIconNames.COG} size={16} />
                </span>
              }
            >
              <div className="p-4 flex justify-end">
                <viewCfg.settings />
              </div>
            </Popover>
          ) : null}
        </div>
      );
    }
  };

  return (
    <div className="h-full grid grid-rows-[min-content_50vh_1fr_min-content]">
      <MobileMarketHeader />

      {/* Top section */}
      <div className="flex flex-col overflow-hidden bg-surface-1">
        <div className="flex flex-nowrap overflow-x-auto shrink-0">
          {[
            'chart',
            'orderbook',
            'depth',
            'trades',
            'liquidity',
            'fundingPayments',
            'funding',
          ]
            // filter to control available views for the current market
            // e.g. only perpetuals should get the funding views
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
              const isActive = topView === key;
              return (
                <ViewButton
                  key={key}
                  view={key}
                  isActive={isActive}
                  onClick={() => {
                    setTopView(key);
                  }}
                />
              );
            })}
        </div>
        <div className="h-full relative">
          {renderMenu(topViewCfg)}
          <div className="overflow-auto h-full">{renderView(topView)}</div>
        </div>
      </div>
      {/* END: Top section */}

      {/* Bottom section */}
      <div className="flex flex-col overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto shrink-0">
          {[
            'positions',
            'activeOrders',
            'inactiveOrders',
            'stopOrders',
            'assets',
            'fills',
          ].map((_key) => {
            const key = _key as TradingView;
            const isActive = bottomView === key;
            return (
              <ViewButton
                key={key}
                view={key}
                isActive={isActive}
                onClick={() => {
                  setBottomView(key);
                }}
              />
            );
          })}
        </div>
        <div className="relative grow flex flex-col overflow-hidden">
          {renderMenu(bottomViewCfg)}
          <div className="overflow-auto grow">{renderView(bottomView)}</div>
        </div>
      </div>
      {/* END: Bottom section */}

      <div>
        <MarketActionDrawer />
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
  const className = cn('py-2 px-4 capitalize text-sm whitespace-nowrap', {
    'bg-surface-2': isActive,
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
    funding: t('Funding history'),
    fundingPayments: t('Funding payments'),
    orderbook: t('Orderbook'),
    trades: t('Trades'),
    positions: t('Positions'),
    activeOrders: t('Open'),
    inactiveOrders: t('Order history'),
    stopOrders: t('Advanced orders'),
    assets: t('Assets'),
    fills: t('Trades'),
  };

  return labels[view];
};
