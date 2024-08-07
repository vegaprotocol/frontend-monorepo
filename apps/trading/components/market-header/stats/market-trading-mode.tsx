import type { RefObject, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../../header';
import {
  Tooltip,
  Link as UILink,
  type SimpleGridProps,
} from '@vegaprotocol/ui-toolkit';
import {
  useMarket,
  useStaticMarketData,
  getAsset,
  type Market,
  type MarketData,
} from '@vegaprotocol/markets';
import { useT } from '../../../lib/use-t';
import { useMemo } from 'react';
import { parseISO, isValid, isAfter } from 'date-fns';
import classNames from 'classnames';
import { useProposalOfMarketQuery } from '@vegaprotocol/proposals';
import { DocsLinks } from '@vegaprotocol/environment';
import {
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { ExternalLink, SimpleGrid } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';

const getTradingModeLabel = (
  marketTradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  const hasTrigger =
    trigger && trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED;

  const isAuction =
    marketTradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION ||
    marketTradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_LONG_BLOCK_AUCTION;

  if (!marketTradingMode) {
    return '-';
  }

  if (isAuction && hasTrigger) {
    return `${Schema.MarketTradingModeMapping[marketTradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`;
  }

  return Schema.MarketTradingModeMapping[
    marketTradingMode as Schema.MarketTradingMode
  ];
};

interface MarketTradingModeStatProps {
  marketId?: string;
  onSelect?: (marketId: string, metaKey?: boolean) => void;
}

export const MarketTradingModeStat = ({
  marketId,
  onSelect,
}: MarketTradingModeStatProps) => {
  const t = useT();
  const { data } = useStaticMarketData(marketId);
  const { marketTradingMode, trigger } = data || {};

  return (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        <TradingModeTooltip marketId={marketId} onSelect={onSelect} />
      }
      data-testid="market-trading-mode"
    >
      <div>{getTradingModeLabel(marketTradingMode, trigger)}</div>
    </HeaderStat>
  );
};

export const MarketTradingMode = ({
  marketId,
  inViewRoot,
}: Omit<MarketTradingModeStatProps, 'onUpdate'> & {
  inViewRoot?: RefObject<Element>;
}) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { data } = useStaticMarketData(marketId, !inView);

  return (
    <Tooltip
      description={
        <TradingModeTooltip marketId={marketId} skip={!inView} skipGrid />
      }
    >
      <span ref={ref}>
        {getTradingModeLabel(data?.marketTradingMode, data?.trigger)}
      </span>
    </Tooltip>
  );
};

const TradingModeTooltip = ({
  marketId,
  onSelect,
  skip,
  skipGrid,
}: TradingModeTooltipProps) => {
  const t = useT();
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId, skip);
  const { marketTradingMode, trigger } = marketData || {};

  const skipEnactmentDate =
    !marketTradingMode ||
    Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION !== marketTradingMode;
  const enactmentDate = useEnactmentDatetime(marketId, skipEnactmentDate);

  if (!market || !marketData) {
    return null;
  }

  const compiledGrid =
    !skipGrid && compileGridData(t, market, marketData, onSelect);

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
            className={classNames('flex flex-col items-start gap-2', {
              'mb-4': Boolean(compiledGrid),
            })}
          >
            {enactmentDate &&
            isValid(enactmentDate) &&
            isAfter(new Date(), enactmentDate) ? (
              <>
                <span
                  className="justify-center font-bold"
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
                    className="justify-center font-bold"
                    data-testid="opening-auction-sub-status"
                  >
                    {`${
                      Schema.MarketTradingModeMapping[marketTradingMode]
                    }: ${t('Closing on {{time}}', {
                      time: getDateTimeFormat().format(enactmentDate),
                    })}`}
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
              <ExternalLink href={DocsLinks.AUCTION_TYPE_OPENING}>
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
            'This market has been suspended via a governance vote and can be resumed or terminated by further votes.'
          )}
          {DocsLinks && (
            <ExternalLink href={DocsLinks.MARKET_LIFECYCLE} className="ml-1">
              {t('Find out more')}
            </ExternalLink>
          )}
        </section>
      );
    }
    case Schema.MarketTradingMode.TRADING_MODE_LONG_BLOCK_AUCTION:
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
        case Schema.AuctionTrigger.AUCTION_TRIGGER_LONG_BLOCK: {
          return (
            <section data-testid="trading-mode-tooltip">
              <p className={classNames({ 'mb-4': Boolean(compiledGrid) })}>
                <span>
                  {t(
                    'This market is in auction due to slow block processing, potentially due to an upgrade or network downtime.'
                  )}
                </span>{' '}
                {DocsLinks && (
                  <ExternalLink
                    href={DocsLinks.AUCTION_TYPE_BLOCK_TIME}
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

type TradingModeTooltipProps = {
  marketId?: string;
  onSelect?: (marketId: string, metaKey?: boolean) => void;
  skip?: boolean;
  skipGrid?: boolean;
};

const useEnactmentDatetime = (marketId?: string, skip?: boolean) => {
  const variables = useMemo(() => ({ marketId: marketId || '' }), [marketId]);
  const { data: proposalData } = useProposalOfMarketQuery({
    variables,
    skip,
  });

  let v: string = '';
  if (proposalData?.proposal) {
    if (proposalData?.proposal?.__typename === 'Proposal') {
      v = proposalData.proposal.terms.enactmentDatetime;
    }
    if (
      proposalData?.proposal?.__typename === 'BatchProposal' &&
      proposalData.proposal.subProposals
    ) {
      const sub = proposalData.proposal.subProposals.find(
        (p) => p?.id === variables.marketId
      );
      v = sub?.terms?.enactmentDatetime;
    }
  }

  return parseISO(v);
};

export const compileGridData = (
  t: ReturnType<typeof useT>,
  market: Pick<
    Market,
    'id' | 'tradableInstrument' | 'decimalPlaces' | 'positionDecimalPlaces'
  >,
  marketData?: Pick<
    MarketData,
    | 'marketTradingMode'
    | 'auctionStart'
    | 'auctionEnd'
    | 'indicativePrice'
    | 'indicativeVolume'
    | 'suppliedStake'
    | 'targetStake'
    | 'trigger'
  > | null,
  onSelect?: (id: string, metaKey?: boolean) => void
): { label: ReactNode; value?: ReactNode }[] => {
  const grid: SimpleGridProps['grid'] = [];
  const isLiquidityMonitoringAuction =
    (marketData?.marketTradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
      marketData?.trigger ===
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET) ||
    marketData?.trigger ===
      Schema.AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS;
  const asset = getAsset(market);

  const formatStake = (value: string) => {
    const formattedValue = addDecimalsFormatNumber(value, asset.decimals);
    return `${formattedValue} ${asset.symbol}`;
  };

  if (!marketData) return grid;

  if (marketData.auctionStart) {
    grid.push({
      label: t('Auction start'),
      value: getDateTimeFormat().format(new Date(marketData.auctionStart)),
    });
  }

  if (marketData.auctionEnd) {
    const endDate = getDateTimeFormat().format(new Date(marketData.auctionEnd));
    grid.push({
      label: isLiquidityMonitoringAuction
        ? t('Est. auction end')
        : t('Auction end'),
      value: isLiquidityMonitoringAuction ? `~${endDate}` : endDate,
    });
  }

  if (isLiquidityMonitoringAuction && marketData.targetStake) {
    grid.push({
      label: t('Target liquidity'),
      value: formatStake(marketData.targetStake),
    });
  }

  if (isLiquidityMonitoringAuction && marketData.suppliedStake) {
    grid.push({
      label: (
        <Link
          to={`/liquidity/${market.id}`}
          onClick={(ev) =>
            onSelect && onSelect(market.id, ev.metaKey || ev.ctrlKey)
          }
        >
          <UILink>{t('Current liquidity')}</UILink>
        </Link>
      ),
      value: formatStake(marketData.suppliedStake),
    });
  }
  if (marketData.indicativePrice) {
    grid.push({
      label: t('Est. uncrossing price'),
      value:
        marketData.indicativePrice && marketData.indicativePrice !== '0'
          ? `~
            ${addDecimalsFormatNumber(
              marketData.indicativePrice,
              market.decimalPlaces
            )}`
          : '-',
    });
  }

  if (marketData.indicativeVolume) {
    grid.push({
      label: t('Est. uncrossing vol'),
      value:
        marketData.indicativeVolume && marketData.indicativeVolume !== '0'
          ? '~' +
            addDecimalsFormatNumber(
              marketData.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
    });
  }

  return grid;
};
