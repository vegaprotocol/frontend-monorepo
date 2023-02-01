import type { RefObject } from 'react';
import { useMemo } from 'react';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import { useInView } from 'react-intersection-observer';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { marketDataProvider } from '@vegaprotocol/market-list';

// This will cause often re-rendering
// Here it may not be a problem because the component is not very complex
// In general, we should avoid using this marketData hook without any throttling
const useMarketData = (marketId?: string, skip?: boolean) => {
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables,
    skip: skip || !marketId,
  });
  return data;
};

const getTradingModeLabel = (
  tradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  return (
    (tradingMode === Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    trigger &&
    trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ? `${Schema.MarketTradingModeMapping[tradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`
      : Schema.MarketTradingModeMapping[
          tradingMode as Schema.MarketTradingMode
        ]) || '-'
  );
};

interface HeaderStatMarketTradingModeProps {
  marketId?: string;
  onSelect?: (marketId: string) => void;
  initialTradingMode?: Schema.MarketTradingMode;
  initialTrigger?: Schema.AuctionTrigger;
}

export const HeaderStatMarketTradingMode = ({
  marketId,
  onSelect,
  initialTradingMode,
  initialTrigger,
}: HeaderStatMarketTradingModeProps) => {
  const data = useMarketData(marketId);
  const tradingMode = data?.marketTradingMode ?? initialTradingMode;
  const trigger = data?.trigger ?? initialTrigger;

  return (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        <TradingModeTooltip marketId={marketId} onSelect={onSelect} />
      }
      testId="market-trading-mode"
    >
      <div>{getTradingModeLabel(tradingMode, trigger)}</div>
    </HeaderStat>
  );
};

export const MarketTradingMode = ({
  marketId,
  initialTradingMode,
  initialTrigger,
  inViewRoot,
}: Omit<HeaderStatMarketTradingModeProps, 'onUpdate'> & {
  inViewRoot?: RefObject<Element>;
}) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const data = useMarketData(marketId, !inView);

  return (
    <Tooltip
      description={<TradingModeTooltip marketId={marketId} skip={!inView} />}
    >
      <span ref={ref}>
        {getTradingModeLabel(
          data?.marketTradingMode ?? initialTradingMode,
          data?.trigger ?? initialTrigger
        )}
      </span>
    </Tooltip>
  );
};
