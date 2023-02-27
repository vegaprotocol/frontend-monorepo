import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { MarketProposalNotification } from '@vegaprotocol/governance';
import type { Market } from '@vegaprotocol/market-list';
import {
  getExpiryDate,
  getMarketExpiryDate,
  t,
} from '@vegaprotocol/react-helpers';
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
import { MarketState } from '../../components/market-state';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { MarketState as State } from '@vegaprotocol/types';

interface TradeMarketHeaderProps {
  market: Market | null;
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
          marketCode={market?.tradableInstrument.instrument.code || NO_MARKET}
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
      <HeaderStat heading={t('Price')} testId="market-price">
        <MarketMarkPrice
          marketId={market?.id}
          decimalPlaces={market?.decimalPlaces}
        />
      </HeaderStat>
      <HeaderStat heading={t('Change (24h)')} testId="market-change">
        <Last24hPriceChange
          marketId={market?.id}
          decimalPlaces={market?.decimalPlaces}
        />
      </HeaderStat>
      <HeaderStat
        heading={t('Volume (24h)')}
        testId="market-volume"
        description={t(
          'The total number of contracts traded in the last 24 hours.'
        )}
      >
        <Last24hVolume
          marketId={market?.id}
          positionDecimalPlaces={market?.positionDecimalPlaces}
        />
      </HeaderStat>
      <HeaderStatMarketTradingMode
        marketId={market?.id}
        onSelect={onSelect}
        initialTradingMode={market?.tradingMode}
      />
      <MarketState market={market} />
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
      <MarketLiquiditySupplied
        marketId={market?.id}
        assetDecimals={asset?.decimals || 0}
      />
    </Header>
  );
};

type ExpiryLabelProps = {
  market: Market | null;
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  const content =
    market && market.tradableInstrument.instrument.metadata.tags
      ? getExpiryDate(
          market.tradableInstrument.instrument.metadata.tags,
          market.marketTimestamps.close,
          market.state
        )
      : '-';
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: Market;
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

    const metadataExpiryDate = getMarketExpiryDate(
      market.tradableInstrument.instrument.metadata.tags
    );

    const isExpired =
      metadataExpiryDate &&
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (market.state === State.STATE_TRADING_TERMINATED ||
        market.state === State.STATE_SETTLED);

    return (
      <section data-testid="expiry-tooltip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {metadataExpiryDate && !isExpired && (
          <p className="mb-2">
            {t(
              'This timestamp is user curated metadata and does not drive any on-chain functionality.'
            )}
          </p>
        )}
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
