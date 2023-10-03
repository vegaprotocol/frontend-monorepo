import { useMemo } from 'react';
import { parseISO, isValid, isAfter } from 'date-fns';
import classNames from 'classnames';
import { useProposalOfMarketQuery } from '@vegaprotocol/proposals';
import { DocsLinks } from '@vegaprotocol/environment';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { ExternalLink, SimpleGrid } from '@vegaprotocol/ui-toolkit';
import { compileGridData } from './compile-grid-data';
import { useMarket, useStaticMarketData } from '@vegaprotocol/markets';

type TradingModeTooltipProps = {
  marketId?: string;
  onSelect?: (marketId: string, metaKey?: boolean) => void;
  skip?: boolean;
  skipGrid?: boolean;
};

export const TradingModeTooltip = ({
  marketId,
  onSelect,
  skip,
  skipGrid,
}: TradingModeTooltipProps) => {
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId, skip);
  const { marketTradingMode, trigger } = marketData || {};
  const variables = useMemo(() => ({ marketId: marketId || '' }), [marketId]);
  const { data: proposalData } = useProposalOfMarketQuery({
    variables,
    skip:
      !marketTradingMode ||
      Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION !==
        marketTradingMode,
  });

  if (!market || !marketData) {
    return null;
  }
  const enactmentDate = parseISO(
    proposalData?.proposal?.terms.enactmentDatetime
  );

  const compiledGrid =
    !skipGrid && compileGridData(market, marketData, onSelect);

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
          <p
            className={classNames('flex flex-col', {
              'mb-4': Boolean(compiledGrid),
            })}
          >
            {isValid(enactmentDate) && isAfter(new Date(), enactmentDate) ? (
              <>
                <span
                  className="justify-center font-bold my-2"
                  data-testid="opening-auction-sub-status"
                >
                  {`${Schema.MarketTradingModeMapping[marketTradingMode]}: ${t(
                    'Not enough liquidity to open'
                  )}`}
                </span>
                <span>
                  {t(
                    'This market is in opening auction until it has reached enough liquidity to move into continuous trading.'
                  )}
                </span>
              </>
            ) : (
              <>
                {isValid(enactmentDate) && (
                  <span
                    className="justify-center font-bold my-2"
                    data-testid="opening-auction-sub-status"
                  >
                    {`${
                      Schema.MarketTradingModeMapping[marketTradingMode]
                    }: ${t(
                      'Closing on %s',
                      getDateTimeFormat().format(enactmentDate)
                    )}`}
                  </span>
                )}
                <span>
                  {t(
                    'This is a new market in an opening auction to determine a fair mid-price before starting continuous trading.'
                  )}
                </span>
              </>
            )}
            {DocsLinks && (
              <ExternalLink
                href={DocsLinks.AUCTION_TYPE_OPENING}
                className="ml-1"
              >
                {t('Find out more')}
              </ExternalLink>
            )}
          </p>
          {compiledGrid && <SimpleGrid grid={compiledGrid} />}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE: {
      return (
        <section data-testid="trading-mode-suspended-via-governance">
          {t(
            `This market has been suspended via a governance vote and can be resumed or terminated by further votes.`
          )}
          {DocsLinks && (
            <ExternalLink href={DocsLinks.MARKET_LIFECYCLE} className="ml-1">
              {t('Find out more')}
            </ExternalLink>
          )}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION: {
      switch (trigger) {
        case Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
                <span className="mb-2">
                  {t(
                    'This market is in auction until it reaches sufficient liquidity.'
                  )}
                </span>
                {DocsLinks && (
                  <ExternalLink
                    href={DocsLinks.AUCTION_TYPE_LIQUIDITY_MONITORING}
                    className="ml-1"
                  >
                    {t('Find out more')}
                  </ExternalLink>
                )}
              </p>
              {compiledGrid && <SimpleGrid grid={compiledGrid} />}
            </section>
          );
        }
        case Schema.AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
                <span className="mb-2">
                  {t(
                    'This market may have sufficient liquidity but there are not enough priced limit orders in the order book, which are required to deploy liquidity commitment pegged orders.'
                  )}
                </span>
                {DocsLinks && (
                  <ExternalLink
                    href={DocsLinks.AUCTION_TYPE_LIQUIDITY_MONITORING}
                    className="ml-1"
                  >
                    {t('Find out more')}
                  </ExternalLink>
                )}
              </p>
              {compiledGrid && <SimpleGrid grid={compiledGrid} />}
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
                {DocsLinks && (
                  <ExternalLink
                    href={DocsLinks.AUCTION_TYPE_PRICE_MONITORING}
                    className="ml-1"
                  >
                    {t('Find out more')}
                  </ExternalLink>
                )}
              </p>
              {compiledGrid && <SimpleGrid grid={compiledGrid} />}
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
