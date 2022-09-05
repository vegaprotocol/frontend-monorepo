import 'allotment/dist/style.css';
import {
  DealTicketContainer,
  MarketInfoContainer,
} from '@vegaprotocol/deal-ticket';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import { SelectMarketPopover } from '@vegaprotocol/market-list';
import { OrderListContainer } from '@vegaprotocol/orders';
import { FillsContainer } from '@vegaprotocol/fills';
import { PositionsContainer } from '@vegaprotocol/positions';
import {
  addDecimalsFormatNumber,
  getDateFormat,
  t,
} from '@vegaprotocol/react-helpers';
import { TradesContainer } from '@vegaprotocol/trades';
import {
  AuctionTrigger,
  AuctionTriggerMapping,
  MarketTradingMode,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Market_market } from './__generated__/Market';
import type { CandleClose } from '@vegaprotocol/types';
import { useGlobalStore } from '../../stores';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  Tab,
  Tabs,
  PriceCellChange,
  Link,
  Tooltip,
  ResizableGrid,
  ButtonLink,
  ResizableGridPanel,
} from '@vegaprotocol/ui-toolkit';
import { TradingModeTooltip } from '../../components/trading-mode-tooltip';

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
  Fills: FillsContainer,
};

type TradingView = keyof typeof TradingViews;

type ExpiryLabelProps = {
  market: Market_market;
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  if (market.marketTimestamps.close === null) {
    return <>{t('Not time-based')}</>;
  }

  const closeDate = new Date(market.marketTimestamps.close);
  const isExpired = Date.now() - closeDate.valueOf() > 0;
  const expiryDate = getDateFormat().format(closeDate);

  return <>{`${isExpired ? `${t('Expired')} ` : ''} ${expiryDate}`}</>;
};

type ExpiryTooltipContentProps = {
  market: Market_market;
  explorerUrl?: string;
};

const ExpiryTooltipContent = ({
  market,
  explorerUrl,
}: ExpiryTooltipContentProps) => {
  if (market.marketTimestamps.close === null) {
    const oracleId =
      market.tradableInstrument.instrument.product
        .oracleSpecForTradingTermination?.id;

    return (
      <>
        <p data-testid="expiry-tool-tip" className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </>
    );
  }

  return null;
};

interface TradeMarketHeaderProps {
  market: Market_market;
}

export const TradeMarketHeader = ({ market }: TradeMarketHeaderProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol } =
    useAssetDetailsDialogStore();
  const candlesClose: string[] = (market?.candles || [])
    .map((candle) => candle?.close)
    .filter((c): c is CandleClose => c !== null);
  const symbol =
    market.tradableInstrument.instrument.product?.settlementAsset?.symbol;
  const itemClass =
    'min-w-min w-[120px] whitespace-nowrap py-3 px-4 border-l border-neutral-300 dark:border-neutral-600';
  const itemHeading = 'text-neutral-500 dark:text-neutral-400';

  const store = useGlobalStore();
  const onSelect = (marketId: string) => {
    if (marketId && store.marketId !== marketId) {
      store.setMarketId(marketId);
    }
  };

  const hasExpiry = market.marketTimestamps.close !== null;

  return (
    <header className="w-screen xl:px-4 border-b border-neutral-300 dark:border-neutral-600">
      <div className="xl:flex xl:gap-4  items-start">
        <div className="py-3">
          <SelectMarketPopover marketName={market.name} onSelect={onSelect} />
        </div>
        <div
          data-testid="market-summary"
          className="flex flex-nowrap items-start xl:flex-1 w-full overflow-x-auto text-xs "
        >
          <div className={itemClass}>
            <div className={itemHeading}>{t('Expiry')}</div>
            <Tooltip
              align="start"
              description={
                <ExpiryTooltipContent
                  market={market}
                  explorerUrl={VEGA_EXPLORER_URL}
                />
              }
            >
              <div
                data-testid="trading-expiry"
                className={classNames({
                  'underline decoration-dashed': !hasExpiry,
                })}
              >
                <ExpiryLabel market={market} />
              </div>
            </Tooltip>
          </div>
          <div className={itemClass}>
            <div className={itemHeading}>{t('Change (24h)')}</div>
            <PriceCellChange
              candles={candlesClose}
              decimalPlaces={market.decimalPlaces}
            />
          </div>
          <div className={itemClass}>
            <div className={itemHeading}>{t('Volume')}</div>
            <div data-testid="trading-volume" className="font-mono">
              {market.data && market.data.indicativeVolume !== '0'
                ? addDecimalsFormatNumber(
                    market.data.indicativeVolume,
                    market.positionDecimalPlaces
                  )
                : '-'}
            </div>
          </div>

          <div className={itemClass}>
            <div className={itemHeading}>{t('Trading mode')}</div>
            <Tooltip
              align="start"
              description={<TradingModeTooltip market={market} />}
            >
              <div data-testid="trading-mode">
                {market.tradingMode ===
                  MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
                market.data?.trigger &&
                market.data.trigger !==
                  AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
                  ? `${MarketTradingModeMapping[market.tradingMode]}
                     - ${AuctionTriggerMapping[market.data.trigger]}`
                  : MarketTradingModeMapping[market.tradingMode]}
              </div>
            </Tooltip>
          </div>
          <div className={itemClass}>
            <div className={itemHeading}>{t('Price')}</div>
            <div data-testid="mark-price" className="font-mono">
              {market.data && market.data.markPrice !== '0'
                ? addDecimalsFormatNumber(
                    market.data.markPrice,
                    market.decimalPlaces
                  )
                : '-'}
            </div>
          </div>
          {symbol && (
            <div className={itemClass}>
              <div className={itemHeading}>{t('Settlement asset')}</div>
              <div data-testid="trading-mode">
                <ButtonLink
                  onClick={() => {
                    setAssetDetailsDialogOpen(true);
                    setAssetDetailsDialogSymbol(symbol);
                  }}
                >
                  {symbol}
                </ButtonLink>
              </div>
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
  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <TradeMarketHeader market={market} />
      <ResizableGrid vertical={true}>
        <ResizableGridPanel minSize={75} priority={LayoutPriority.High}>
          <ResizableGrid proportionalLayout={false} minSize={200}>
            <ResizableGridPanel
              priority={LayoutPriority.High}
              minSize={200}
              preferredSize="50%"
            >
              <TradeGridChild>
                <Tabs>
                  <Tab id="candles" name={t('Candles')}>
                    <TradingViews.Candles marketId={market.id} />
                  </Tab>
                  <Tab id="depth" name={t('Depth')}>
                    <TradingViews.Depth marketId={market.id} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              priority={LayoutPriority.Low}
              preferredSize={330}
              minSize={300}
            >
              <TradeGridChild>
                <Tabs>
                  <Tab id="ticket" name={t('Ticket')}>
                    <TradingViews.Ticket marketId={market.id} />
                  </Tab>
                  <Tab id="info" name={t('Info')}>
                    <TradingViews.Info marketId={market.id} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              priority={LayoutPriority.Low}
              preferredSize={430}
              minSize={200}
            >
              <TradeGridChild>
                <Tabs>
                  <Tab id="orderbook" name={t('Orderbook')}>
                    <TradingViews.Orderbook marketId={market.id} />
                  </Tab>
                  <Tab id="trades" name={t('Trades')}>
                    <TradingViews.Trades marketId={market.id} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
        <ResizableGridPanel
          priority={LayoutPriority.Low}
          preferredSize="25%"
          minSize={50}
        >
          <TradeGridChild>
            <Tabs>
              <Tab id="positions" name={t('Positions')}>
                <TradingViews.Positions />
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <TradingViews.Orders />
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <TradingViews.Fills />
              </Tab>
              <Tab id="accounts" name={t('Collateral')}>
                <TradingViews.Collateral />
              </Tab>
            </Tabs>
          </TradeGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    </div>
  );
};

interface TradeGridChildProps {
  children: ReactNode;
}

const TradeGridChild = ({ children }: TradeGridChildProps) => {
  return (
    <section className="h-full">
      <AutoSizer>
        {({ width, height }) => (
          <div
            style={{ width, height }}
            className="overflow-auto border-[1px] dark:border-neutral-600"
          >
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
      <div className="flex flex-nowrap overflow-x-auto max-w-full border-t border-neutral-300 dark:border-neutral-600">
        {Object.keys(TradingViews).map((key) => {
          const isActive = view === key;
          const className = classNames('p-4 min-w-[100px] capitalize', {
            'text-black dark:text-vega-yellow': isActive,
            'bg-neutral-200 dark:bg-neutral-800': isActive,
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
      </div>
    </div>
  );
};
