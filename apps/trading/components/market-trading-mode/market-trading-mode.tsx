import { useCallback, useMemo, useState } from 'react';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type { DealTicketMarketFragment } from '@vegaprotocol/deal-ticket';
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

interface Props {
  marketId: string;
  onSelect: (marketId: string) => void;
}

type TradingModeMarket = Omit<DealTicketMarketFragment, 'depth'>;

export const MarketTradingModeComponent = ({ marketId, onSelect }: Props) => {
  const [tradingMode, setTradingMode] =
    useState<Types.MarketTradingMode | null>(null);
  const [trigger, setTrigger] = useState<Types.AuctionTrigger | null>(null);
  const [market, setMarket] = useState<TradingModeMarket | null>(null);
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
      if (marketData) {
        setTradingMode(marketData.marketTradingMode);
        setTrigger(marketData.trigger);
        setMarket({
          ...data,
          data: marketData,
        } as TradingModeMarket);
      }
      return true;
    },
    [data]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: !marketId || !data,
  });

  return (
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
      <div>
        {tradingMode ===
          Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
        trigger &&
        trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
          ? `${MarketTradingModeMapping[tradingMode]} - ${AuctionTriggerMapping[trigger]}`
          : MarketTradingModeMapping[tradingMode as Types.MarketTradingMode]}
      </div>
    </HeaderStat>
  );
};
