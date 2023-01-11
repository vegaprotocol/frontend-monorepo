import classNames from 'classnames';
import { useEnvironment } from '@vegaprotocol/environment';
import { DataGrid, t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { createDocsLinks } from '@vegaprotocol/react-helpers';
import { compileGridData } from './compile-grid-data';
import { useMarket, useStaticMarketData } from '@vegaprotocol/market-list';

type TradingModeTooltipProps = {
  marketId?: string;
  onSelect?: (marketId: string) => void;
  skip?: boolean;
};

export const TradingModeTooltip = ({
  marketId,
  onSelect,
  skip,
}: TradingModeTooltipProps) => {
  const { VEGA_DOCS_URL } = useEnvironment();
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId, skip);

  if (!market || !marketData) {
    return null;
  }

  const compiledGrid =
    onSelect && compileGridData(market, marketData, onSelect);
  const { marketTradingMode, trigger } = marketData;

  switch (marketTradingMode) {
    case Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS: {
      return (
        <section data-testid="trading-mode-tooltip">
          {t(
            'This is the standard trading mode where trades are executed whenever orders are received.'
          )}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION: {
      return (
        <section data-testid="trading-mode-tooltip">
          <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
            <span>
              {t(
                'This new market is in an opening auction to determine a fair mid-price before starting continuous trading.'
              )}
            </span>{' '}
            {VEGA_DOCS_URL && (
              <ExternalLink
                href={createDocsLinks(VEGA_DOCS_URL).AUCTION_TYPE_OPENING}
              >
                {t('Find out more')}
              </ExternalLink>
            )}
          </p>
          {compiledGrid && <DataGrid grid={compiledGrid} />}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION: {
      switch (trigger) {
        case Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
                <span>
                  {t(
                    'This market is in auction until it reaches sufficient liquidity.'
                  )}
                </span>{' '}
                {VEGA_DOCS_URL && (
                  <ExternalLink
                    href={
                      createDocsLinks(VEGA_DOCS_URL)
                        .AUCTION_TYPE_LIQUIDITY_MONITORING
                    }
                  >
                    {t('Find out more')}
                  </ExternalLink>
                )}
              </p>
              {compiledGrid && <DataGrid grid={compiledGrid} />}
            </section>
          );
        }
        case Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
                <span>
                  {t('This market is in auction due to high price volatility.')}
                </span>{' '}
                {VEGA_DOCS_URL && (
                  <ExternalLink
                    href={
                      createDocsLinks(VEGA_DOCS_URL)
                        .AUCTION_TYPE_PRICE_MONITORING
                    }
                  >
                    {t('Find out more')}
                  </ExternalLink>
                )}
              </p>
              {compiledGrid && <DataGrid grid={compiledGrid} />}
            </section>
          );
        }
        default: {
          return null;
        }
      }
    }
    case Schema.MarketTradingMode.TRADING_MODE_NO_TRADING: {
      return (
        <section data-testid="trading-mode-tooltip">
          {t('No trading enabled for this market.')}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
    default: {
      return null;
    }
  }
};
