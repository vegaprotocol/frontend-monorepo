import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useState, ReactNode } from 'react';
import { Market_market } from './__generated__/Market';
import { View, Views } from './trading-components';
import { GridTab, GridTabs } from './grid-tabs';

interface TradeGridProps {
  market: Market_market;
}

export const TradeGrid = ({ market }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'grid gap-[1px] grid-cols-[1fr_325px_325px] grid-rows-[min-content_1fr_200px]',
    'bg-neutral-200',
    'text-ui'
  );
  return (
    <div className={wrapperClasses}>
      <header className="col-start-1 col-end-2 row-start-1 row-end-1 bg-white p-8">
        <h1>Market: {market.name}</h1>
      </header>
      <TradeGridChild className="col-start-1 col-end-2">
        <Views.chart />
      </TradeGridChild>
      <TradeGridChild className="row-start-1 row-end-3">
        <Views.ticket />
      </TradeGridChild>
      <TradeGridChild className="row-start-1 row-end-3">
        <GridTabs group="trade">
          <GridTab name="trades">
            <pre>{JSON.stringify(market.trades, null, 2)}</pre>
          </GridTab>
          <GridTab name="orderbook">
            <Views.orderbook />
          </GridTab>
        </GridTabs>
      </TradeGridChild>
      <TradeGridChild className="col-span-3">
        <GridTabs group="portfolio">
          <GridTab name="orders">
            <Views.orders />
          </GridTab>
          <GridTab name="positions">
            <Views.positions />
          </GridTab>
          <GridTab name="collateral">
            <Views.collateral />
          </GridTab>
        </GridTabs>
      </TradeGridChild>
    </div>
  );
};

interface TradeGridChildProps {
  children: ReactNode;
  className?: string;
}

const TradeGridChild = ({ children, className }: TradeGridChildProps) => {
  const gridChildClasses = classNames('bg-white', className);
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
  const [view, setView] = useState<View>('chart');

  const renderView = () => {
    const Component = Views[view];

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    return <Component />;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <header className="bg-white p-8">
        <h1>Market: {market.name}</h1>
      </header>
      <div className="h-full">
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }}>{renderView()}</div>
          )}
        </AutoSizer>
      </div>
      <div className="flex flex-nowrap gap-2 bg-neutral-200 border-neutral-200 border-t overflow-x-auto">
        {Object.keys(Views).map((key: View) => {
          const className = classNames(
            'p-8',
            'border-t',
            'border-neutral-200',
            'capitalize',
            {
              'text-vega-pink': view === key,
              'bg-white': view === key,
            }
          );
          return (
            <button
              onClick={() => setView(key)}
              className={className}
              key={key}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
