import { useCallback, useMemo, useState } from 'react';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { compileGridData, TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import type { Schema as Types } from '@vegaprotocol/types';
import {
  AuctionTriggerMapping,
  MarketTradingModeMapping,
  Schema,
} from '@vegaprotocol/types';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

interface Props {
  marketId?: string;
  onSelect?: (marketId: string) => void;
  isHeader?: boolean;
  noUpdate?: boolean;
  initialMode?: Types.MarketTradingMode;
  initialTrigger?: Types.AuctionTrigger;
}

export const MarketTradingMode = ({
  marketId,
  onSelect,
  isHeader = false,
  noUpdate = false,
  initialMode,
  initialTrigger,
}: Props) => {
  const [tradingMode, setTradingMode] =
    useState<Types.MarketTradingMode | null>(initialMode || null);
  const [trigger, setTrigger] = useState<Types.AuctionTrigger | null>(
    initialTrigger || null
  );
  const [market, setMarket] = useState<MarketDealTicket | null>(null);
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const { data } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (!noUpdate && marketData) {
        setTradingMode(marketData.marketTradingMode);
        setTrigger(marketData.trigger);
        setMarket({
          ...data,
          data: marketData,
        } as MarketDealTicket);
      }
      return true;
    },
    [noUpdate, data]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const content =
    (tradingMode === Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    trigger &&
    trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ? `${MarketTradingModeMapping[tradingMode]} - ${AuctionTriggerMapping[trigger]}`
      : MarketTradingModeMapping[tradingMode as Types.MarketTradingMode]) ||
    '-';

  return isHeader ? (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        market && (
          <TradingModeTooltip
            tradingMode={tradingMode}
            trigger={trigger}
            compiledGrid={compileGridData(market, onSelect)}
          />
        )
      }
      testId="market-trading-mode"
    >
      <div>{content}</div>
    </HeaderStat>
  ) : (
    <Tooltip
      description={
        tradingMode &&
        trigger && (
          <TradingModeTooltip tradingMode={tradingMode} trigger={trigger} />
        )
      }
    >
      <span>{content}</span>
    </Tooltip>
  );
};
