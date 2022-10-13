import { t } from '@vegaprotocol/react-helpers';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { MarketDataGrid } from './market-data-grid';

type TradingModeTooltipProps = {
  tradingMode: MarketTradingMode | null;
  trigger: AuctionTrigger | null;
  compiledGrid: { label: ReactNode; value?: ReactNode }[];
};

export const TradingModeTooltip = ({
  tradingMode,
  trigger,
  compiledGrid,
}: TradingModeTooltipProps) => {
  switch (tradingMode) {
    case MarketTradingMode.TRADING_MODE_CONTINUOUS: {
      return (
        <section data-testid="trading-mode-tooltip">
          {t(
            'This is the standard trading mode where trades are executed whenever orders are received.'
          )}
        </section>
      );
    }
    case MarketTradingMode.TRADING_MODE_OPENING_AUCTION: {
      return (
        <section data-testid="trading-mode-tooltip">
          <p className="mb-4">
            <span>
              {t(
                'This new market is in an opening auction to determine a fair mid-price before starting continuous trading.'
              )}
            </span>{' '}
            <ExternalLink href="https://docs.vega.xyz/docs/testnet/concepts/trading-on-vega/trading-modes#auction-type-opening">
              {t('Find out more')}
            </ExternalLink>
          </p>
          <MarketDataGrid grid={compiledGrid} />
        </section>
      );
    }
    case MarketTradingMode.TRADING_MODE_MONITORING_AUCTION: {
      switch (trigger) {
        case AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className="mb-4">
                <span>
                  {t(
                    'This market is in auction until it reaches sufficient liquidity.'
                  )}
                </span>{' '}
                <ExternalLink href="https://docs.vega.xyz/docs/testnet/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring">
                  {t('Find out more')}
                </ExternalLink>
              </p>
              <MarketDataGrid grid={compiledGrid} />
            </section>
          );
        }
        case AuctionTrigger.AUCTION_TRIGGER_PRICE: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className="mb-4">
                <span>
                  {t('This market is in auction due to high price volatility.')}
                </span>{' '}
                <ExternalLink href="https://docs.vega.xyz/docs/testnet/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring">
                  {t('Find out more')}
                </ExternalLink>
              </p>
              <MarketDataGrid grid={compiledGrid} />
            </section>
          );
        }
        default: {
          return null;
        }
      }
    }
    case MarketTradingMode.TRADING_MODE_NO_TRADING: {
      return (
        <section data-testid="trading-mode-tooltip">
          {t('No trading enabled for this market.')}
        </section>
      );
    }
    case MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
    default: {
      return null;
    }
  }
};
