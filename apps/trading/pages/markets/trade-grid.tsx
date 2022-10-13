import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoContainer } from '@vegaprotocol/market-info';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import { OrderListContainer } from '@vegaprotocol/orders';
import { FillsContainer } from '@vegaprotocol/fills';
import { PositionsContainer } from '@vegaprotocol/positions';
import { TradesContainer } from '@vegaprotocol/trades';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import {
  Tab,
  Tabs,
  ResizableGrid,
  ResizableGridPanel,
  ButtonLink,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { getDateFormat, t } from '@vegaprotocol/react-helpers';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { Header, HeaderStat } from '../../components/header';
import { AccountsContainer } from '../portfolio/accounts-container';
import {
  ColumnKind,
  SelectMarketPopover,
} from '../../components/select-market';
import type { OnCellClickHandler } from '../../components/select-market';
import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';
import { Last24hPriceChange } from '../../components/last-24h-price-change';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { MarketVolume } from '../../components/market-volume';
import { MarketTradingModeComponent } from '../../components/market-trading-mode';

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
  market: SingleMarketFieldsFragment;
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  let content = null;
  if (market.marketTimestamps.close === null) {
    content = t('Not time-based');
  } else {
    const closeDate = new Date(market.marketTimestamps.close as string);
    const isExpired = Date.now() - closeDate.valueOf() > 0;
    const expiryDate = getDateFormat().format(closeDate);
    content = `${isExpired ? `${t('Expired')} ` : ''} ${expiryDate}`;
  }
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: SingleMarketFieldsFragment;
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
      <section data-testid="expiry-tool-tip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </section>
    );
  }

  return null;
};

interface TradeMarketHeaderProps {
  market: SingleMarketFieldsFragment;
  onSelect: (marketId: string) => void;
}

export const TradeMarketHeader = ({
  market,
  onSelect,
}: TradeMarketHeaderProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const symbol =
    market.tradableInstrument.instrument.product?.settlementAsset?.symbol;

  const onCellClick: OnCellClickHandler = (e, kind, value) => {
    if (value && kind === ColumnKind.Asset) {
      openAssetDetailsDialog(value, e.target as HTMLElement);
    }
  };

  return (
    <Header
      title={
        <SelectMarketPopover
          marketName={market.tradableInstrument.instrument.name}
          onSelect={onSelect}
          onCellClick={onCellClick}
        />
      }
    >
      <HeaderStat
        heading={t('Expiry')}
        description={
          <ExpiryTooltipContent
            market={market}
            explorerUrl={VEGA_EXPLORER_URL}
          />
        }
        testId="market-expiry"
      >
        <ExpiryLabel market={market} />
      </HeaderStat>
      <MarketMarkPrice marketId={market.id} />
      <Last24hPriceChange marketId={market.id} />
      <MarketVolume marketId={market.id} />
      <MarketTradingModeComponent marketId={market.id} onSelect={onSelect} />
      {symbol ? (
        <HeaderStat
          heading={t('Settlement asset')}
          testId="market-settlement-asset"
        >
          <div>
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(symbol, e.target as HTMLElement);
              }}
            >
              {symbol}
            </ButtonLink>
          </div>
        </HeaderStat>
      ) : null}
    </Header>
  );
};

interface TradeGridProps {
  market: SingleMarketFieldsFragment;
  onSelect: (marketId: string) => void;
}

const MainGrid = ({
  marketId,
  onSelect,
}: {
  marketId: string;
  onSelect: (marketId: string) => void;
}) => (
  <ResizableGrid vertical>
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
                <TradingViews.Candles marketId={marketId} />
              </Tab>
              <Tab id="depth" name={t('Depth')}>
                <TradingViews.Depth marketId={marketId} />
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
                <TradingViews.Ticket marketId={marketId} />
              </Tab>
              <Tab id="info" name={t('Info')}>
                <TradingViews.Info
                  marketId={marketId}
                  onSelect={(id: string) => {
                    onSelect(id);
                  }}
                />
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
                <TradingViews.Orderbook marketId={marketId} />
              </Tab>
              <Tab id="trades" name={t('Trades')}>
                <TradingViews.Trades marketId={marketId} />
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
);
const MainGridWrapped = memo(MainGrid);

export const TradeGrid = ({ market, onSelect }: TradeGridProps) => {
  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <TradeMarketHeader market={market} onSelect={onSelect} />
      <MainGridWrapped marketId={market.id} onSelect={onSelect} />
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
        {({ width, height }) => <div style={{ width, height }}>{children}</div>}
      </AutoSizer>
    </section>
  );
};

interface TradePanelsProps {
  market: SingleMarketFieldsFragment;
  onSelect: (marketId: string) => void;
}

export const TradePanels = ({ market, onSelect }: TradePanelsProps) => {
  const [view, setView] = useState<TradingView>('Candles');

  const renderView = () => {
    const Component = memo<{
      marketId: string;
      onSelect: (marketId: string) => void;
    }>(TradingViews[view]);

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    return <Component marketId={market.id} onSelect={onSelect} />;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <TradeMarketHeader market={market} onSelect={onSelect} />
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
