import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { GridTab, GridTabs } from './grid-tabs';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { OrderListContainer } from '@vegaprotocol/order-list';
import { TradesContainer } from '@vegaprotocol/trades';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import type { Market_market } from './__generated__/Market';
import { t } from '@vegaprotocol/react-helpers';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { SelectMarketDialog } from '@vegaprotocol/market-list';
import { ArrowDown, PriceCellChange } from '@vegaprotocol/ui-toolkit';
import type { CandleClose } from '@vegaprotocol/types';

const TradingViews = {
  Candles: CandlesChartContainer,
  Depth: DepthChartContainer,
  Ticket: DealTicketContainer,
  Orderbook: OrderbookContainer,
  Orders: OrderListContainer,
  Positions: PositionsContainer,
  Accounts: AccountsContainer,
  Trades: TradesContainer,
};

type TradingView = keyof typeof TradingViews;

interface TradeGridProps {
  market: Market_market;
}

export const TradeMarketHeader = ({ market }: TradeGridProps) => {
  const [open, setOpen] = useState(false);
  const candlesClose: string[] = (market?.candles || [])
    .map((candle) => candle?.close)
    .filter((c): c is CandleClose => c !== null);
  const headerItemClassName = 'whitespace-nowrap flex flex-col';
  const itemClassName =
    'font-sans font-normal mb-0 text-dark/80 dark:text-white/80 text-ui-small';
  const itemValueClassName =
    'capitalize font-sans tracking-tighter text-black dark:text-white text-ui';
  return (
    <header className="w-full p-8">
      <SelectMarketDialog dialogOpen={open} setDialogOpen={setOpen} />
      <div className="flex flex-col md:flex-row gap-20 md:gap-64 ml-auto mr-8">
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 dark:text-vega-yellow text-black text-h5 flex items-center gap-8 px-4 py-0 h-37 hover:bg-vega-yellow dark:hover:bg-white/20"
        >
          <span className="break-words text-left">{market.name}</span>
          <ArrowDown color="yellow" borderX={8} borderTop={12} />
        </button>

        <div className="flex flex-auto items-start gap-64 overflow-x-scroll whitespace-nowrap w-[400px]">
          <div className={headerItemClassName}>
            <span className={itemClassName}>Change (24h)</span>
            <PriceCellChange
              candles={candlesClose}
              decimalPlaces={market.decimalPlaces}
            />
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>Volume</span>
            <span className={itemValueClassName}>
              {market.data?.indicativeVolume === '0'
                ? '-'
                : market.data?.indicativeVolume}
            </span>
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>Trading mode</span>
            <span className={itemValueClassName}>{market.tradingMode}</span>
          </div>
          <div className={headerItemClassName}>
            <span className={itemClassName}>State</span>
            <span className={itemValueClassName}>{market.state}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export const TradeGrid = ({ market }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'grid gap-[1px] grid-cols-[1fr_375px_460px] grid-rows-[min-content_1fr_200px]',
    'bg-black-10 dark:bg-white-10',
    'text-ui'
  );

  return (
    <>
      <TradeMarketHeader market={market} />
      <div className={wrapperClasses}>
        <TradeGridChild className="row-start-1 row-end-3">
          <GridTabs group="chart">
            <GridTab id="candles" name={t('Candles')}>
              <TradingViews.Candles marketId={market.id} />
            </GridTab>
            <GridTab id="depth" name={t('Depth')}>
              <TradingViews.Depth marketId={market.id} />
            </GridTab>
          </GridTabs>
        </TradeGridChild>
        <TradeGridChild className="row-start-1 row-end-3">
          <TradingViews.Ticket marketId={market.id} />
        </TradeGridChild>
        <TradeGridChild className="row-start-1 row-end-3">
          <GridTabs group="trade">
            <GridTab id="trades" name={t('Trades')}>
              <TradingViews.Trades marketId={market.id} />
            </GridTab>
            <GridTab id="orderbook" name={t('Orderbook')}>
              <TradingViews.Orderbook marketId={market.id} />
            </GridTab>
          </GridTabs>
        </TradeGridChild>
        <TradeGridChild className="col-span-3">
          <GridTabs group="portfolio">
            <GridTab id="orders" name={t('Orders')}>
              <TradingViews.Orders />
            </GridTab>
            <GridTab id="positions" name={t('Positions')}>
              <TradingViews.Positions />
            </GridTab>
            <GridTab id="accounts" name={t('Accounts')}>
              <TradingViews.Accounts />
            </GridTab>
          </GridTabs>
        </TradeGridChild>
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
