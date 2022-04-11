import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { GridTab, GridTabs } from './grid-tabs';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { OrderListContainer } from '@vegaprotocol/order-list';
import { ChartContainer } from '../../components/chart-container';
import { TradesContainer } from '@vegaprotocol/trades';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { PositionsContainer } from '@vegaprotocol/positions';
import type { Market_market } from './__generated__/Market';
import { t } from '@vegaprotocol/react-helpers';
import { AccountsContainer } from '@vegaprotocol/accounts';

const Orderbook = () => (
  <Splash>
    <p>{t('Orderbook')}</p>
  </Splash>
);

const TradingViews = {
  Chart: ChartContainer,
  Ticket: DealTicketContainer,
  Orderbook: Orderbook,
  Orders: OrderListContainer,
  Positions: PositionsContainer,
  Accounts: AccountsContainer,
  Trades: TradesContainer,
};

type TradingView = keyof typeof TradingViews;

interface TradeGridProps {
  market: Market_market;
}

export const TradeGrid = ({ market }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'grid gap-[1px] grid-cols-[1fr_375px_460px] grid-rows-[min-content_1fr_200px]',
    'bg-black-10 dark:bg-white-10',
    'text-ui'
  );
  return (
    <div className={wrapperClasses}>
      <header className="col-start-1 col-end-2 row-start-1 row-end-1 p-8">
        <h1>
          {t('Market')}: {market.name}
        </h1>
      </header>
      <TradeGridChild className="col-start-1 col-end-2">
        <TradingViews.Chart marketId={market.id} />
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
            <TradingViews.Orderbook />
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
  const [view, setView] = useState<TradingView>('Chart');

  const renderView = () => {
    const Component = TradingViews[view];

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    return <Component marketId={market.id} />;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <header className="p-8">
        <h1>
          {t('Market')}: {market.name}
        </h1>
      </header>
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
