import { t } from '@vegaprotocol/react-helpers';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { createDocsLinks } from '@vegaprotocol/react-helpers';
import { MarketDataGrid } from './market-data-grid';

import type { ReactNode } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';

type TradingModeTooltipProps = {
  tradingMode: MarketTradingMode | null;
  trigger: AuctionTrigger | null;
  compiledGrid?: { label: ReactNode; value?: ReactNode }[];
};

export const TradingModeTooltip = ({
  tradingMode,
  trigger,
  compiledGrid,
}: TradingModeTooltipProps) => {
  const { VEGA_DOCS_URL } = useEnvironment();
  const vegaDocsUrl = VEGA_DOCS_URL || 'http://docs.vega.xyz/testnet';
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
            <ExternalLink
              href={createDocsLinks(vegaDocsUrl).AUCTION_TYPE_OPENING}
            >
              {t('Find out more')}
            </ExternalLink>
          </p>
          {compiledGrid && <MarketDataGrid grid={compiledGrid} />}
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
                <ExternalLink
                  href={
                    createDocsLinks(vegaDocsUrl)
                      .AUCTION_TYPE_LIQUIDITY_MONITORING
                  }
                >
                  {t('Find out more')}
                </ExternalLink>
              </p>
              {compiledGrid && <MarketDataGrid grid={compiledGrid} />}
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
                <ExternalLink
                  href={
                    createDocsLinks(vegaDocsUrl).AUCTION_TYPE_PRICE_MONITORING
                  }
                >
                  {t('Find out more')}
                </ExternalLink>
              </p>
              {compiledGrid && <MarketDataGrid grid={compiledGrid} />}
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
