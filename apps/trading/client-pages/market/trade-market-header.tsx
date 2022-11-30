import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { MarketProposalNotification } from '@vegaprotocol/governance';
import { getExpiryDate } from '@vegaprotocol/market-info';
import { t } from '@vegaprotocol/react-helpers';
import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';
import {
  ColumnKind,
  SelectMarketPopover,
} from '../../components/select-market';
import type { OnCellClickHandler } from '../../components/select-market';
import { Header, HeaderStat } from '../../components/header';
import { NO_MARKET } from './constants';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { Last24hPriceChange } from '../../components/last-24h-price-change';
import { Last24hVolume } from '../../components/last-24h-volume';
import { MarketTradingMode } from '../../components/market-trading-mode';
import { MarketStateMapping, Schema } from '@vegaprotocol/types';

interface TradeMarketHeaderProps {
  market: SingleMarketFieldsFragment | null;
  onSelect: (marketId: string) => void;
}

export const TradeMarketHeader = ({
  market,
  onSelect,
}: TradeMarketHeaderProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const asset = market?.tradableInstrument.instrument.product?.settlementAsset;

  const onCellClick: OnCellClickHandler = (e, kind, value) => {
    if (value && kind === ColumnKind.Asset) {
      openAssetDetailsDialog(value, e.target as HTMLElement);
    }
  };

  return (
    <Header
      title={
        <SelectMarketPopover
          marketName={market?.tradableInstrument.instrument.name || NO_MARKET}
          onSelect={onSelect}
          onCellClick={onCellClick}
        />
      }
    >
      <HeaderStat
        heading={t('Expiry')}
        description={
          market && (
            <ExpiryTooltipContent
              market={market}
              explorerUrl={VEGA_EXPLORER_URL}
            />
          )
        }
        testId="market-expiry"
      >
        <ExpiryLabel market={market} />
      </HeaderStat>
      <MarketMarkPrice
        marketId={market?.id}
        decimalPlaces={market?.decimalPlaces}
        isHeader
      />
      <Last24hPriceChange
        marketId={market?.id}
        decimalPlaces={market?.decimalPlaces}
        isHeader
      />
      <Last24hVolume
        marketId={market?.id}
        positionDecimalPlaces={market?.positionDecimalPlaces}
        isHeader
      />
      <MarketTradingMode marketId={market?.id} onSelect={onSelect} isHeader />
      <HeaderStat
        heading={t('Status')}
        description={getMarketStateTooltip(market?.state)}
        testId="market-state"
      >
        {market?.state ? MarketStateMapping[market?.state] : '-'}
      </HeaderStat>
      {asset ? (
        <HeaderStat
          heading={t('Settlement asset')}
          testId="market-settlement-asset"
        >
          <div>
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(asset.id, e.target as HTMLElement);
              }}
            >
              {asset.symbol}
            </ButtonLink>
          </div>
        </HeaderStat>
      ) : null}
      <MarketProposalNotification marketId={market?.id} />
    </Header>
  );
};

type ExpiryLabelProps = {
  market: SingleMarketFieldsFragment | null;
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  const content = market ? getExpiryDate(market) : '-';
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: SingleMarketFieldsFragment;
  explorerUrl?: string;
};

const ExpiryTooltipContent = ({
  market,
  explorerUrl,
}: ExpiryTooltipContentProps) => {
  if (market?.marketTimestamps.close === null) {
    const oracleId =
      market.tradableInstrument.instrument.product
        .dataSourceSpecForTradingTermination?.id;

    return (
      <section data-testid="expiry-tool-tip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </section>
    );
  }

  return null;
};

const getMarketStateTooltip = (state?: Schema.MarketState) => {
  if (state === Schema.MarketState.STATE_ACTIVE) {
    return t('Enactment date reached and usual auction exit checks pass');
  }

  if (state === Schema.MarketState.STATE_CANCELLED) {
    return t(
      'Market triggers cancellation or governance vote has passed to cancel'
    );
  }

  if (state === Schema.MarketState.STATE_CLOSED) {
    return t('Governance vote passed to close the market');
  }

  if (state === Schema.MarketState.STATE_PENDING) {
    return t(
      'Governance vote has passed and market is awaiting opening auction exit'
    );
  }

  if (state === Schema.MarketState.STATE_PROPOSED) {
    return t('Governance vote for this market is valid and has been accepted');
  }

  if (state === Schema.MarketState.STATE_REJECTED) {
    return t('Governance vote for this market has been rejected');
  }

  if (state === Schema.MarketState.STATE_SETTLED) {
    return t('Settlement defined by product has been triggered and completed');
  }

  if (state === Schema.MarketState.STATE_SUSPENDED) {
    return t('Suspended due to price or liquidity monitoring trigger');
  }

  if (state === Schema.MarketState.STATE_TRADING_TERMINATED) {
    return t(
      'Trading has been terminated as a result of the product definition'
    );
  }

  return undefined;
};
