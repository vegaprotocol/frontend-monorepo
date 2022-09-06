import type { ReactNode } from 'react';
import {
  t,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import type { Market_market } from '../../pages/markets/__generated__/Market';

type MarketDataGridProps = {
  grid: {
    label: string | ReactNode;
    value?: ReactNode;
  }[];
};

const MarketDataGrid = ({ grid }: MarketDataGridProps) => {
  return (
    <>
      {grid.map(
        ({ label, value }, index) =>
          value && (
            <div key={index} className="grid grid-cols-2">
              <span data-testid="tooltip-label">{label}</span>
              <span data-testid="tooltip-value" className="text-right">
                {value}
              </span>
            </div>
          )
      )}
    </>
  );
};

const formatStake = (value: string, market: Market_market) => {
  const formattedValue = addDecimalsFormatNumber(
    value,
    market.positionDecimalPlaces
  );
  const asset =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;
  return `${formattedValue} ${asset}`;
};

const compileGridData = (
  market: Market_market,
  onSelect?: (id: string) => void
) => {
  const grid: MarketDataGridProps['grid'] = [];
  const isLiquidityMonitoringAuction =
    market.tradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

  if (!market.data) return grid;

  if (market.data?.auctionStart) {
    grid.push({
      label: t('Auction start'),
      value: getDateTimeFormat().format(new Date(market.data.auctionStart)),
    });
  }

  if (market.data?.auctionEnd) {
    const endDate = getDateTimeFormat().format(
      new Date(market.data.auctionEnd)
    );
    grid.push({
      label: isLiquidityMonitoringAuction
        ? t('Est auction end')
        : t('Auction end'),
      value: isLiquidityMonitoringAuction ? `~${endDate}` : endDate,
    });
  }

  if (isLiquidityMonitoringAuction && market.data?.targetStake) {
    grid.push({
      label: t('Target liquidity'),
      value: formatStake(market.data.targetStake, market),
    });
  }

  if (isLiquidityMonitoringAuction && market.data?.suppliedStake) {
    grid.push({
      label: (
        <Link onClick={() => onSelect && onSelect(market.id)}>
          {t('Current liquidity')}
        </Link>
      ),
      value: formatStake(market.data.suppliedStake, market),
    });
  }

  if (market.data?.indicativePrice) {
    grid.push({
      label: t('Est uncrossing price'),
      value:
        '~' +
        addDecimalsFormatNumber(
          market.data.indicativePrice,
          market.positionDecimalPlaces
        ),
    });
  }

  if (market.data?.indicativeVolume) {
    grid.push({
      label: t('Est uncrossing vol'),
      value:
        '~' +
        addDecimalsFormatNumber(
          market.data.indicativeVolume,
          market.positionDecimalPlaces
        ),
    });
  }

  return grid;
};

type TradingModeTooltipProps = {
  market: Market_market;
  onSelect?: (marketId: string) => void;
};

export const TradingModeTooltip = ({
  market,
  onSelect,
}: TradingModeTooltipProps) => {
  switch (market.tradingMode) {
    case MarketTradingMode.TRADING_MODE_CONTINUOUS: {
      return (
        <>
          {t(
            'This is the standard trading mode where trades are executed whenever orders are received.'
          )}
        </>
      );
    }
    case MarketTradingMode.TRADING_MODE_OPENING_AUCTION: {
      return (
        <>
          <p className="mb-4">
            <span>
              {t(
                'This new market is in an opening auction to determine a fair mid-price before starting continuous trading.'
              )}
            </span>{' '}
            <Link
              href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-happens-in-an-opening-auction"
              target="_blank"
            >
              {t('Find out more')}
            </Link>
          </p>
          <MarketDataGrid grid={compileGridData(market)} />
        </>
      );
    }
    case MarketTradingMode.TRADING_MODE_MONITORING_AUCTION: {
      switch (market.data?.trigger) {
        case AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY: {
          return (
            <>
              <p data-testid="tooltip-market-info" className="mb-4">
                <span>
                  {t(
                    'This market is in auction until it reaches sufficient liquidity.'
                  )}
                </span>{' '}
                <Link
                  href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-is-a-liquidity-monitoring-auction"
                  target="_blank"
                >
                  {t('Find out more')}
                </Link>
              </p>
              <MarketDataGrid grid={compileGridData(market, onSelect)} />
            </>
          );
        }
        case AuctionTrigger.AUCTION_TRIGGER_PRICE: {
          return (
            <>
              <p className="mb-4">
                <span>
                  {t('This market is in auction due to high price volatility.')}
                </span>{' '}
                <Link
                  href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-is-a-price-monitoring-auction"
                  target="_blank"
                >
                  {t('Find out more')}
                </Link>
              </p>
              <MarketDataGrid grid={compileGridData(market)} />
            </>
          );
        }
        default: {
          return null;
        }
      }
    }
    case MarketTradingMode.TRADING_MODE_NO_TRADING: {
      return <>{t('No trading enabled for this market.')}</>;
    }
    case MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
    default: {
      return null;
    }
  }
};
