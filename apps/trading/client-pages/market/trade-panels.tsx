import { type PinnedAsset } from '@vegaprotocol/accounts';
import { type Market } from '@vegaprotocol/markets';
// TODO: handle oracle banner
// import { OracleBanner } from '@vegaprotocol/markets';
import { useState } from 'react';
import classNames from 'classnames';
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
interface TradePanelsProps {
  market: Market;
  pinnedAssets?: PinnedAsset[];
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
        <div className="flex items-center justify-end gap-1 p-1 bg-vega-clight-800 dark:bg-vega-cdark-800 border-b border-default">
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
    <div className="h-full flex flex-col lg:grid grid-rows-[min-content_min-content_1fr_min-content]">
      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto max-w-full border-t border-default">
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
        <div className="h-[50vh] lg:h-full relative">
          <div>{renderMenu(topViewCfg)}</div>
          <div className="overflow-auto h-full">{renderView(topView)}</div>
        </div>
      </div>

      <div className="flex flex-col w-full grow">
        <div className="flex flex-nowrap overflow-x-auto max-w-full border-t border-default">
          {[
            'positions',
            'activeOrders',
            'inactiveOrders',
            'stopOrders',
            'collateral',
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
        <div className="relative grow">
          <div className="flex flex-col">{renderMenu(bottomViewCfg)}</div>
          <div className="overflow-auto h-full">{renderView(bottomView)}</div>
        </div>
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
  const className = classNames(
    'py-2 px-4 capitalize text-sm whitespace-nowrap',
    {
      'bg-vega-clight-500 dark:bg-vega-cdark-500': isActive,
    }
  );

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
    collateral: t('Collateral'),
    fills: t('Trades'),
  };

  return labels[view];
};
