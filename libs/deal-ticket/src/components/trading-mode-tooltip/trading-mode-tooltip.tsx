import { t } from '@vegaprotocol/react-helpers';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { MarketDataGrid } from './market-data-grid';

type TradingModeTooltipProps = {
  market: {
    tradingMode: MarketTradingMode;
    data: { trigger: AuctionTrigger | null } | null;
  };
  compiledGrid: { label: ReactNode; value?: ReactNode }[];
};

export const TradingModeTooltip = ({
  market,
  compiledGrid,
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
            <ExternalLink href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-happens-in-an-opening-auction">
              {t('Find out more')}
            </ExternalLink>
          </p>
          <MarketDataGrid grid={compiledGrid} />
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
                <ExternalLink href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-is-a-liquidity-monitoring-auction">
                  {t('Find out more')}
                </ExternalLink>
              </p>
              <MarketDataGrid grid={compiledGrid} />
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
                <ExternalLink href="https://docs.fairground.vega.xyz/docs/trading-questions/#auctions-what-is-a-price-monitoring-auction">
                  {t('Find out more')}
                </ExternalLink>
              </p>
              <MarketDataGrid grid={compiledGrid} />
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
