import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  DealTicketContainer,
  MarketInfoContainer,
} from '@vegaprotocol/deal-ticket';
import { OrderListContainer } from '@vegaprotocol/orders';
import { TradesContainer } from '@vegaprotocol/trades';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import type { Market_market } from './__generated__/Market';
import {
  addDecimalsFormatNumber,
  formatLabel,
  t,
} from '@vegaprotocol/react-helpers';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { SelectMarketDialog } from '@vegaprotocol/market-list';
import {
  ArrowDown,
  Tab,
  Tabs,
  PriceCellChange,
} from '@vegaprotocol/ui-toolkit';
import type { CandleClose } from '@vegaprotocol/types';
import { AuctionTrigger } from '@vegaprotocol/types';
import { MarketTradingMode } from '@vegaprotocol/types';
import { Allotment, LayoutPriority } from 'allotment';
import 'allotment/dist/style.css';

const TradingViews = {
  Candles: CandlesChartContainer,
  Depth: DepthChartContainer,
  Ticket: DealTicketContainer,
  Info: MarketInfoContainer,
  Orderbook: OrderbookContainer,
  Trades: TradesContainer,
  Positions: PositionsContainer,
  Orders: OrderListContainer,
  Collateral: AccountsContainer,
};

type TradingView = keyof typeof TradingViews;

interface TradeMarketHeaderProps {
  market: Market_market;
  className?: string;
}

export const TradeMarketHeader = ({
  market,
  className,
}: TradeMarketHeaderProps) => {
  const [open, setOpen] = useState(false);
  const candlesClose: string[] = (market?.candles || [])
    .map((candle) => candle?.close)
    .filter((c): c is CandleClose => c !== null);
  const headerItemClassName = 'whitespace-nowrap flex flex-col';
  const itemClassName =
    'font-sans font-normal mb-0 text-black-60 dark:text-white-80 text-ui-small';
  const itemValueClassName =
    'font-sans tracking-tighter text-black dark:text-white text-ui';
  const headerClassName = classNames(
    'w-full p-8 mb-4 bg-white dark:bg-black',
    className
  );
  return (
    <header className={headerClassName}>
      <SelectMarketDialog
        dialogOpen={open}
        setDialogOpen={setOpen}
        detailed={true}
        size="tall"
      />
      <div className="flex flex-col md:flex-row gap-20 md:gap-64 ml-auto mr-8">
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 text-vega-pink dark:text-vega-yellow font-medium text-h5 flex items-center gap-8 px-4 py-0 h-37 hover:bg-black/10 dark:hover:bg-white/20"
        >
          <span className="break-words text-left">{market.name}</span>
          <ArrowDown color="yellow" borderX={8} borderTop={12} />
        </button>

        <div
          data-testid="market-summary"
          className="flex flex-auto items-start gap-64 overflow-x-auto whitespace-nowrap"
        >
          <div className={headerItemClassName}>
            <span className={itemClassName}>{t('Change (24h)')}</span>
            <PriceCellChange
              candles={candlesClose}
              decimalPlaces={market.decimalPlaces}
            />
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>{t('Volume')}</span>
            <span data-testid="trading-volume" className={itemValueClassName}>
              {market.data && market.data.indicativeVolume !== '0'
                ? addDecimalsFormatNumber(
                    market.data.indicativeVolume,
                    market.positionDecimalPlaces
                  )
                : '-'}
            </span>
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>{t('Trading mode')}</span>
            <span data-testid="trading-mode" className={itemValueClassName}>
              {market.tradingMode === MarketTradingMode.MonitoringAuction &&
              market.data?.trigger &&
              market.data.trigger !== AuctionTrigger.Unspecified
                ? `${formatLabel(
                    market.tradingMode
                  )} - ${market.data?.trigger.toLowerCase()}`
                : formatLabel(market.tradingMode)}
            </span>
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>{t('Price')}</span>
            <span data-testid="mark-price" className={itemValueClassName}>
              {market.data && market.data.markPrice !== '0'
                ? addDecimalsFormatNumber(
                    market.data.markPrice,
                    market.decimalPlaces
                  )
                : '-'}
            </span>
          </div>
          {market.tradableInstrument.instrument.product?.settlementAsset
            ?.symbol && (
            <div className={headerItemClassName}>
              <span className={itemClassName}>{t('Settlement asset')}</span>
              <span data-testid="trading-mode" className={itemValueClassName}>
                {
                  market.tradableInstrument.instrument.product?.settlementAsset
                    ?.symbol
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

interface TradeGridProps {
  market: Market_market;
}

export const TradeGrid = ({ market }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'flex flex-col',
    'bg-black-10 dark:bg-black-70',
    'text-ui'
  );

  return (
    <>
      <div className={wrapperClasses}>
        <TradeMarketHeader market={market} />
        <Allotment vertical={true}>
          <Allotment.Pane>
            <Allotment proportionalLayout={false} minSize={200}>
              <Allotment.Pane priority={LayoutPriority.High} minSize={200}>
                <TradeGridChild className="h-full px-4 bg-black-10 dark:bg-black-70">
                  <Tabs>
                    <Tab id="candles" name={t('Candles')}>
                      <TradingViews.Candles marketId={market.id} />
                    </Tab>
                    <Tab id="depth" name={t('Depth')}>
                      <TradingViews.Depth marketId={market.id} />
                    </Tab>
                  </Tabs>
                </TradeGridChild>
              </Allotment.Pane>
              <Allotment.Pane
                priority={LayoutPriority.Low}
                preferredSize={330}
                minSize={200}
              >
                <TradeGridChild className="h-full px-4 bg-black-10 dark:bg-black-70">
                  <Tabs>
                    <Tab id="ticket" name={t('Ticket')}>
                      <TradingViews.Ticket marketId={market.id} />
                    </Tab>
                    <Tab id="info" name={t('Info')}>
                      <TradingViews.Info marketId={market.id} />
                    </Tab>
                  </Tabs>
                </TradeGridChild>
              </Allotment.Pane>
              <Allotment.Pane
                priority={LayoutPriority.Low}
                preferredSize={430}
                minSize={200}
              >
                <TradeGridChild className="h-full px-4 bg-black-10 dark:bg-black-70">
                  <Tabs>
                    <Tab id="orderbook" name={t('Orderbook')}>
                      <TradingViews.Orderbook marketId={market.id} />
                    </Tab>
                    <Tab id="trades" name={t('Trades')}>
                      <TradingViews.Trades marketId={market.id} />
                    </Tab>
                  </Tabs>
                </TradeGridChild>
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
          <Allotment.Pane
            priority={LayoutPriority.Low}
            preferredSize={200}
            minSize={50}
          >
            <TradeGridChild className="h-full mt-4">
              <Tabs>
                <Tab id="positions" name={t('Positions')}>
                  <TradingViews.Positions />
                </Tab>
                <Tab id="orders" name={t('Orders')}>
                  <TradingViews.Orders />
                </Tab>
                <Tab id="accounts" name={t('Collateral')}>
                  <TradingViews.Collateral />
                </Tab>
              </Tabs>
            </TradeGridChild>
          </Allotment.Pane>
        </Allotment>
      </div>
    </>
  );
};

interface TradeGridChildProps {
  children: ReactNode;
  className?: string;
}

const TradeGridChild = ({ children, className }: TradeGridChildProps) => {
  const gridChildClasses = classNames('bg-white dark:bg-black', className);
  return (
    <section className={gridChildClasses}>
      <AutoSizer>
        {({ width, height }) => (
          <div style={{ width, height }} className="overflow-auto">
            {children}
          </div>
        )}
      </AutoSizer>
    </section>
  );
};

interface TradePanelsProps {
  market: Market_market;
}

export const TradePanels = ({ market }: TradePanelsProps) => {
  const [view, setView] = useState<TradingView>('Candles');

  const renderView = () => {
    const Component = TradingViews[view];

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    return <Component marketId={market.id} />;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <TradeMarketHeader market={market} />
      <div className="h-full">
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }}>{renderView()}</div>
          )}
        </AutoSizer>
      </div>
      <div className="flex flex-nowrap gap-4 overflow-x-auto my-4 max-w-full">
        {Object.keys(TradingViews).map((key) => {
          const isActive = view === key;
          const className = classNames('py-4', 'px-12', 'capitalize', {
            'text-black dark:text-vega-yellow': isActive,
            'bg-white dark:bg-black': isActive,
            'text-black dark:text-white': !isActive,
            'bg-black-10 dark:bg-white-10': !isActive,
          });
          return (
            <button
              data-testid={key}
              onClick={() => setView(key as TradingView)}
              className={className}
              key={key}
            >
              {key}
            </button>
          );
        })}
        <div className="bg-black-10 dark:bg-white-10 grow"></div>
      </div>
    </div>
  );
};
